/**
 * Script de Migração: Voluntários (WordPress → Supabase)
 *
 * Migra dados de voluntários das tabelas legadas do WordPress
 * para a tabela `volunteers` do Supabase de forma idempotente.
 *
 * Requisitos:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 * - Dry-run: node migrate-volunteers-wp-to-supabase.js --dry-run --limit 50
 * - Migração parcial: node migrate-volunteers-wp-to-supabase.js --limit 500
 * - Migração completa: node migrate-volunteers-wp-to-supabase.js
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
  console.error('   Certifique-se de que o arquivo .env.local existe na raiz do projeto');
  process.exit(1);
}

// Cliente Supabase (Service Role para bypass de RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========================================
// UTILITÁRIOS
// ========================================

/**
 * Normaliza telefone (apenas dígitos)
 */
function normalizePhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Normaliza texto (trim)
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Normaliza estado (uppercase)
 */
function normalizeState(state) {
  const normalized = normalizeText(state);
  return normalized ? normalized.toUpperCase() : null;
}

/**
 * Converte data do WordPress para ISO timestamp
 */
function parseWpDate(wpDate) {
  if (!wpDate) return new Date().toISOString();
  try {
    const date = new Date(wpDate);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Extrai metadados do WordPress (array de meta_key/meta_value)
 */
function extractMeta(metaArray, key) {
  if (!Array.isArray(metaArray)) return null;
  const meta = metaArray.find(m => m.meta_key === key);
  return meta?.meta_value || null;
}

/**
 * Normaliza slug do WordPress
 */
function normalizeWpSlug(postName) {
  if (!postName) return null;
  return postName.trim().toLowerCase();
}

/**
 * Gera slug a partir do nome (fallback se post_name não existir)
 */
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

/**
 * Gera slug completo com sufixo de ID (fallback)
 */
function generateVolunteerSlug(name, wpPostId) {
  const base = slugifyName(name || 'voluntario');
  const idSuffix = String(wpPostId).slice(-4).padStart(4, '0');
  return `${base}-${idSuffix}`;
}

// ========================================
// TRANSFORMAÇÃO E VALIDAÇÃO
// ========================================

/**
 * Transforma um voluntário do WordPress para o formato Supabase
 */
function mapLegacyVolunteerToNew(wpPost, metaArray) {
  const name = wpPost.post_title || null;
  const telefone = normalizePhone(extractMeta(metaArray, 'telefone'));
  const cidade = normalizeText(extractMeta(metaArray, 'cidade'));
  const estado = normalizeState(extractMeta(metaArray, 'estado'));
  const profissao = normalizeText(extractMeta(metaArray, 'profissao'));
  const escolaridade = normalizeText(extractMeta(metaArray, 'escolaridade'));
  const faixaEtaria = normalizeText(extractMeta(metaArray, 'faixa_etaria'));
  const genero = normalizeText(extractMeta(metaArray, 'genero'));
  const experiencia = normalizeText(extractMeta(metaArray, 'experiencia'));
  const atuacao = normalizeText(extractMeta(metaArray, 'atuacao'));
  const disponibilidade = normalizeText(extractMeta(metaArray, 'disponibilidade'));
  const periodo = normalizeText(extractMeta(metaArray, 'periodo'));
  const descricao = normalizeText(extractMeta(metaArray, 'descricao') || wpPost.post_content);
  const comentarios = normalizeText(extractMeta(metaArray, 'comentarios'));

  const isPublic = wpPost.post_status === 'publish';
  const createdAt = parseWpDate(wpPost.post_date);
  const updatedAt = parseWpDate(wpPost.post_modified);

  // Gerar slug: prioriza post_name do WP, senão gera a partir do nome
  const slug = wpPost.post_name
    ? normalizeWpSlug(wpPost.post_name)
    : generateVolunteerSlug(name || 'voluntario', wpPost.id);

  return {
    wp_post_id: wpPost.id,
    owner_profile_id: null, // Será vinculado no login
    name,
    slug,
    telefone,
    cidade,
    estado,
    profissao,
    escolaridade,
    faixa_etaria: faixaEtaria,
    genero,
    experiencia,
    atuacao,
    disponibilidade,
    periodo,
    descricao,
    comentarios,
    is_public: isPublic,
    accept_terms: true, // Assumir aceite para migrados
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

/**
 * Valida se um registro de voluntário é válido para migração
 */
function validateVolunteer(volunteer) {
  // Obrigatórios: wp_post_id e name
  if (!volunteer.wp_post_id) {
    return { ok: false, reason: 'wp_post_id ausente' };
  }

  if (!volunteer.name || volunteer.name.trim().length === 0) {
    return { ok: false, reason: 'name ausente ou vazio' };
  }

  return { ok: true };
}

// ========================================
// LEITURA DO LEGADO
// ========================================

/**
 * Busca voluntários do WordPress com paginação
 */
async function fetchLegacyVolunteers(offset = 0, pageSize = PAGE_SIZE) {
  const { data: posts, error: postsError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author, post_date, post_content, post_title, post_name, post_status, post_modified, post_type')
    .eq('post_type', 'voluntario')
    .order('id', { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (postsError) {
    throw new Error(`Erro ao buscar posts: ${postsError.message}`);
  }

  if (!posts || posts.length === 0) {
    return [];
  }

  const postIds = posts.map(p => p.id);

  // Buscar TODOS os metadados em lotes (Supabase limita a 1000 registros por padrão)
  let allMetas = [];
  const CHUNK_SIZE = 50; // Buscar metadados para 50 posts por vez

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

/**
 * Conta total de voluntários no legado
 */
async function countLegacyVolunteers() {
  const { count, error } = await supabase
    .from('wp_posts_raw')
    .select('*', { count: 'exact', head: true })
    .eq('post_type', 'voluntario');

  if (error) {
    console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
    throw new Error(`Erro ao contar voluntários: ${error.message || error.code || 'Erro desconhecido'}`);
  }

  return count || 0;
}

// ========================================
// UPSERT NO SUPABASE
// ========================================

/**
 * Faz upsert em lote de voluntários
 */
async function upsertVolunteers(volunteers) {
  if (isDryRun) {
    console.log(`   [DRY-RUN] Simulando upsert de ${volunteers.length} registros...`);
    return { inserted: 0, updated: volunteers.length };
  }

  const { data, error } = await supabase
    .from('volunteers')
    .upsert(volunteers, {
      onConflict: 'wp_post_id',
      ignoreDuplicates: false,
    })
    .select('id, wp_post_id');

  if (error) {
    throw new Error(`Erro ao fazer upsert: ${error.message}`);
  }

  // Como é upsert, não sabemos exatamente quantos foram insert vs update
  // Vamos assumir que todos foram processados com sucesso
  return { inserted: 0, updated: data?.length || volunteers.length };
}

// ========================================
// SCRIPT PRINCIPAL
// ========================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Migração de Voluntários: WordPress → Supabase            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (isDryRun) {
    console.log('🔍 MODO DRY-RUN: Nenhuma alteração será feita no banco\n');
  }

  if (limit) {
    console.log(`📌 LIMITE: Processando até ${limit} registros\n`);
  }

  // Estatísticas
  const stats = {
    totalLegacy: 0,
    processed: 0,
    inserted: 0,
    updated: 0,
    invalid: 0,
    errors: [],
  };

  try {
    // 1. Contar total de voluntários legados
    console.log('📊 Contando voluntários no legado...');
    stats.totalLegacy = await countLegacyVolunteers();
    console.log(`   Total encontrado: ${stats.totalLegacy}\n`);

    if (stats.totalLegacy === 0) {
      console.log('⚠️  Nenhum voluntário encontrado no legado. Abortando.\n');
      return;
    }

    // 2. Processar em lotes
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      // Verificar limite
      if (limit && stats.processed >= limit) {
        console.log(`\n⚠️  Limite de ${limit} registros atingido. Parando.\n`);
        break;
      }

      // Buscar lote
      console.log(`🔄 Processando lote (offset: ${offset})...`);
      const legacyVolunteers = await fetchLegacyVolunteers(offset, PAGE_SIZE);

      if (legacyVolunteers.length === 0) {
        hasMore = false;
        break;
      }

      // Transformar e validar
      const validVolunteers = [];
      const invalidVolunteers = [];

      for (const { post, metas } of legacyVolunteers) {
        const volunteer = mapLegacyVolunteerToNew(post, metas);
        const validation = validateVolunteer(volunteer);

        if (validation.ok) {
          validVolunteers.push(volunteer);
        } else {
          invalidVolunteers.push({
            wp_post_id: post.ID,
            reason: validation.reason,
          });
          stats.invalid++;
        }
      }

      console.log(`   ✅ Válidos: ${validVolunteers.length}`);
      console.log(`   ❌ Inválidos: ${invalidVolunteers.length}`);

      // Registrar inválidos
      if (invalidVolunteers.length > 0) {
        stats.errors.push(...invalidVolunteers);
      }

      // Upsert em batches menores
      if (validVolunteers.length > 0) {
        for (let i = 0; i < validVolunteers.length; i += BATCH_SIZE) {
          const batch = validVolunteers.slice(i, i + BATCH_SIZE);
          try {
            const result = await upsertVolunteers(batch);
            stats.inserted += result.inserted;
            stats.updated += result.updated;
            stats.processed += batch.length;

            console.log(`   📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} registros processados`);
          } catch (error) {
            console.error(`   ❌ Erro no batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
            stats.errors.push({
              batch: Math.floor(i / BATCH_SIZE) + 1,
              error: error.message,
            });
          }
        }
      }

      offset += PAGE_SIZE;

      // Verificar limite novamente
      if (limit && stats.processed >= limit) {
        hasMore = false;
      }
    }

    // 3. Resumo final
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMO DA MIGRAÇÃO                                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Total no legado:        ${stats.totalLegacy}`);
    console.log(`✅ Processados:            ${stats.processed}`);
    console.log(`📝 Inseridos/Atualizados:  ${stats.updated}`);
    console.log(`❌ Inválidos:              ${stats.invalid}`);
    console.log(`⚠️  Erros:                  ${stats.errors.length}\n`);

    // 4. Salvar relatório
    const reportPath = path.join(__dirname, 'output', 'migrate-volunteers-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      mode: isDryRun ? 'dry-run' : 'production',
      limit: limit || 'unlimited',
      stats,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 Relatório salvo em: ${reportPath}\n`);

    if (isDryRun) {
      console.log('🔍 Modo DRY-RUN: Execute sem --dry-run para aplicar as alterações.\n');
    } else {
      console.log('✅ Migração concluída com sucesso!\n');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal durante a migração:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
