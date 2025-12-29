/**
 * Script de Migração: Vagas de Voluntariado (WordPress → Supabase)
 *
 * Migra dados de vagas das tabelas legadas do WordPress
 * para a tabela `vacancies` do Supabase de forma idempotente.
 *
 * Requisitos:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 * - Dry-run: node migrate-vacancies-wp-to-supabase.js --dry-run --limit 10
 * - Migração parcial: node migrate-vacancies-wp-to-supabase.js --limit 20
 * - Migração completa: node migrate-vacancies-wp-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ========================================
// CARREGAMENTO DE VARIÁVEIS DE AMBIENTE
// ========================================

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Erro: Arquivo .env.local não encontrado na raiz do projeto');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

// ========================================
// CONFIGURAÇÃO
// ========================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_supabase_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = 200;
const PAGE_SIZE = 500;

// Argumentos CLI
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

// ========================================
// VALIDAÇÃO DE AMBIENTE
// ========================================

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.error('   NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========================================
// UTILITÁRIOS
// ========================================

function normalizeText(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeState(state) {
  const normalized = normalizeText(state);
  return normalized ? normalized.toUpperCase() : null;
}

function parseWpDate(wpDate) {
  if (!wpDate) return new Date().toISOString();
  try {
    const date = new Date(wpDate);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function extractMeta(metaArray, key) {
  if (!Array.isArray(metaArray)) return null;
  const meta = metaArray.find(m => m.meta_key === key);
  return meta?.meta_value || null;
}

function normalizeWpSlug(postName) {
  if (!postName) return null;
  return postName.trim().toLowerCase();
}

function slugifyName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function generateVacancySlug(title, wpPostId) {
  const base = slugifyName(title || 'vaga');
  const idSuffix = String(wpPostId).slice(-4).padStart(4, '0');
  return `${base}-${idSuffix}`;
}

// ========================================
// TRANSFORMAÇÃO E VALIDAÇÃO
// ========================================

/**
 * Transforma uma vaga do WordPress para o formato Supabase
 */
function mapLegacyVacancyToNew(wpPost, metaArray) {
  const title = wpPost.post_title || null;
  const cidade = normalizeText(extractMeta(metaArray, 'cidade'));
  const estado = normalizeState(extractMeta(metaArray, 'estado'));
  const periodo = normalizeText(extractMeta(metaArray, 'periodo'));
  const cargaHoraria = normalizeText(extractMeta(metaArray, 'carga_horaria'));
  const habilidades = normalizeText(extractMeta(metaArray, 'habilidades_e_funcoes'));
  const perfilVoluntarios = normalizeText(extractMeta(metaArray, 'perfil_dos_voluntarios'));
  const tipoDemanda = normalizeText(extractMeta(metaArray, 'tipo_demanda'));
  const areaAtuacao = normalizeText(extractMeta(metaArray, 'area_atuacao'));
  const quantidade = normalizeText(extractMeta(metaArray, 'quantidade'));
  const abrigo = normalizeText(extractMeta(metaArray, 'abrigo') || extractMeta(metaArray, '_abrigo'));

  const isPublic = wpPost.post_status === 'publish';
  const createdAt = parseWpDate(wpPost.post_date);
  const updatedAt = parseWpDate(wpPost.post_modified);

  // Gerar slug: prioriza post_name do WP, senão gera a partir do título
  const slug = wpPost.post_name
    ? normalizeWpSlug(wpPost.post_name)
    : generateVacancySlug(title || 'vaga', wpPost.id);

  // Montar description como JSON com todos os campos extras
  const description = JSON.stringify({
    post_content: wpPost.post_content || null,
    post_habilidades_e_funcoes: habilidades,
    post_perfil_dos_voluntarios: perfilVoluntarios,
    post_periodo: periodo,
    post_carga: cargaHoraria,
    post_tipo_demanda: tipoDemanda,
    post_area_atuacao: areaAtuacao,
    post_quantidade: quantidade,
    cidade,
    estado,
    abrigo,
  });

  return {
    wp_post_id: wpPost.id,
    shelter_id: null, // Será vinculado posteriormente se necessário
    title: title || 'Vaga de Voluntariado',
    slug,
    description,
    status: isPublic ? 'active' : 'inactive',
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

/**
 * Valida se um registro de vaga é válido para migração
 */
function validateVacancy(vacancy) {
  if (!vacancy.wp_post_id) {
    return { ok: false, reason: 'wp_post_id ausente' };
  }

  if (!vacancy.title || vacancy.title.trim().length === 0) {
    return { ok: false, reason: 'title ausente ou vazio' };
  }

  if (!vacancy.slug || vacancy.slug.trim().length === 0) {
    return { ok: false, reason: 'slug ausente ou vazio' };
  }

  return { ok: true };
}

// ========================================
// LEITURA DO LEGADO
// ========================================

/**
 * Busca vagas do WordPress com paginação
 */
async function fetchLegacyVacancies(offset = 0, pageSize = PAGE_SIZE) {
  const { data: posts, error: postsError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author, post_date, post_content, post_title, post_name, post_status, post_modified, post_type')
    .eq('post_type', 'vaga')
    .order('id', { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (postsError) {
    throw new Error(`Erro ao buscar posts: ${postsError.message}`);
  }

  if (!posts || posts.length === 0) {
    return [];
  }

  const postIds = posts.map(p => p.id);

  // Buscar TODOS os metadados em lotes (chunks de 50)
  let allMetas = [];
  const CHUNK_SIZE = 50;

  for (let i = 0; i < postIds.length; i += CHUNK_SIZE) {
    const chunk = postIds.slice(i, i + CHUNK_SIZE);
    const { data: metas, error: metasError } = await supabase
      .from('wp_postmeta_raw')
      .select('post_id, meta_key, meta_value')
      .in('post_id', chunk);

    if (metasError) {
      throw new Error(`Erro ao buscar metadados: ${metasError.message}`);
    }

    if (metas) {
      allMetas = allMetas.concat(metas);
    }
  }

  // Agrupar metadados por post_id
  const metasByPostId = {};
  allMetas.forEach(meta => {
    if (!metasByPostId[meta.post_id]) {
      metasByPostId[meta.post_id] = [];
    }
    metasByPostId[meta.post_id].push(meta);
  });

  return posts.map(post => ({
    post,
    metas: metasByPostId[post.id] || [],
  }));
}

// ========================================
// UPSERT
// ========================================

async function upsertVacancies(vacancies) {
  const { data, error } = await supabase
    .from('vacancies')
    .upsert(vacancies, {
      onConflict: 'wp_post_id',
      ignoreDuplicates: false,
    })
    .select('*');

  if (error) {
    throw new Error(`Erro ao fazer upsert: ${error.message}`);
  }

  return { updated: data?.length || 0 };
}

// ========================================
// LOOP PRINCIPAL
// ========================================

async function main() {
  console.log('🚀 Iniciando migração de vagas de voluntariado...\n');
  console.log(`📋 Modo: ${isDryRun ? 'DRY-RUN (sem alterações)' : 'EXECUÇÃO REAL'}`);
  if (limit) console.log(`🔢 Limit: ${limit} registros\n`);

  const stats = {
    total: 0,
    valid: 0,
    invalid: 0,
    updated: 0,
    errors: 0,
    invalidReasons: {},
  };

  let offset = 0;
  let hasMore = true;
  let processedCount = 0;

  try {
    while (hasMore) {
      console.log(`📥 Buscando vagas (offset: ${offset})...`);

      const legacyVacancies = await fetchLegacyVacancies(offset, PAGE_SIZE);

      if (legacyVacancies.length === 0) {
        hasMore = false;
        break;
      }

      stats.total += legacyVacancies.length;

      const mappedVacancies = legacyVacancies.map(({ post, metas }) =>
        mapLegacyVacancyToNew(post, metas)
      );

      const validVacancies = [];
      mappedVacancies.forEach(vacancy => {
        const validation = validateVacancy(vacancy);
        if (validation.ok) {
          validVacancies.push(vacancy);
          stats.valid++;
        } else {
          stats.invalid++;
          stats.invalidReasons[validation.reason] =
            (stats.invalidReasons[validation.reason] || 0) + 1;
        }
      });

      console.log(`✅ Válidos: ${validVacancies.length} / Total: ${legacyVacancies.length}`);

      if (validVacancies.length > 0 && !isDryRun) {
        try {
          const { updated } = await upsertVacancies(validVacancies);
          stats.updated += updated;
          console.log(`💾 Salvos: ${updated}`);
        } catch (error) {
          console.error(`❌ Erro ao salvar lote: ${error.message}`);
          stats.errors++;
        }
      }

      offset += PAGE_SIZE;
      processedCount += legacyVacancies.length;

      if (limit && processedCount >= limit) {
        console.log(`\n🛑 Limit de ${limit} registros atingido\n`);
        hasMore = false;
      }
    }

    // Relatório final
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RELATÓRIO FINAL');
    console.log('═══════════════════════════════════════');
    console.log(`Total de vagas processadas: ${stats.total}`);
    console.log(`Válidas: ${stats.valid}`);
    console.log(`Inválidas: ${stats.invalid}`);
    console.log(`Atualizadas: ${stats.updated}`);
    console.log(`Erros: ${stats.errors}`);

    if (stats.invalid > 0) {
      console.log('\n❌ Razões de invalidação:');
      Object.entries(stats.invalidReasons).forEach(([reason, count]) => {
        console.log(`   - ${reason}: ${count}`);
      });
    }

    console.log('═══════════════════════════════════════\n');

    if (isDryRun) {
      console.log('ℹ️  Este foi um DRY-RUN. Nenhuma alteração foi feita.\n');
    } else {
      console.log('✅ Migração concluída com sucesso!\n');
    }

    // Salvar relatório
    const reportPath = path.join(__dirname, 'output', 'migrate-vacancies-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      isDryRun,
      limit: limit || null,
      stats,
    };

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Relatório salvo em: ${reportPath}\n`);

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Erro inesperado:', error);
  process.exit(1);
});
