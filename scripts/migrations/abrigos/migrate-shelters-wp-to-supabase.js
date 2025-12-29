/**
 * Script de Migração: Abrigos (WordPress → Supabase)
 *
 * Migra dados de abrigos das tabelas legadas do WordPress
 * para a tabela `shelters` do Supabase de forma idempotente.
 *
 * Requisitos:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - Coluna wp_post_id adicionada à tabela shelters
 *
 * Uso:
 * - Dry-run: node migrate-shelters-wp-to-supabase.js --dry-run --limit=10
 * - Migração parcial: node migrate-shelters-wp-to-supabase.js --limit=100
 * - Migração completa: node migrate-shelters-wp-to-supabase.js
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
const BATCH_SIZE = 100;
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
 * Normaliza telefone (apenas dígitos)
 */
function normalizePhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Normaliza documento (apenas números)
 */
function normalizeDocument(doc) {
  if (!doc) return null;
  const cleaned = doc.replace(/\D/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Normaliza tipo de abrigo
 */
function normalizeShelterType(tipo) {
  if (!tipo) return null;

  const tipoNormalized = normalizeText(tipo);
  if (!tipoNormalized) return null;

  const map = {
    'Público': 'public',
    'público': 'public',
    'PÚBLICO': 'public',
    'Privado': 'private',
    'privado': 'private',
    'PRIVADO': 'private',
    'Misto': 'mixed',
    'misto': 'mixed',
    'MISTO': 'mixed',
    'LT-PI': 'temporary',
    'LT/PI': 'temporary',
    'lt-pi': 'temporary',
    'lt/pi': 'temporary',
  };

  return map[tipoNormalized] || null;
}

/**
 * Normaliza data de fundação (DD/MM/YYYY → YYYY-MM-DD)
 */
function normalizeFoundationDate(dateStr) {
  if (!dateStr) return null;

  const trimmed = dateStr.trim();

  // Formato esperado: DD/MM/YYYY
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;

    // Validar valores
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Rejeitar datas inválidas (0000-00-00, mês/dia = 00, ano < 1900)
    if (yearNum < 1900 || yearNum > 2100) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;

    // Tentar criar data para validar
    try {
      const date = new Date(`${year}-${month}-${day}`);
      if (isNaN(date.getTime())) return null;
      return `${year}-${month}-${day}`;
    } catch {
      return null;
    }
  }

  // Se não conseguir parsear, retorna null
  return null;
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

// ========================================
// TRANSFORMAÇÃO E VALIDAÇÃO
// ========================================

/**
 * Transforma um abrigo do WordPress para o formato Supabase
 */
function mapLegacyShelterToNew(wpPost, metaArray) {
  const name = normalizeText(wpPost.post_title);
  const tipo = extractMeta(metaArray, 'tipo');
  const shelterType = normalizeShelterType(tipo);
  const estado = normalizeState(extractMeta(metaArray, 'estado'));
  const cidade = normalizeText(extractMeta(metaArray, 'cidade'));
  const endereco = normalizeText(extractMeta(metaArray, 'endereco'));
  const bairro = normalizeText(extractMeta(metaArray, 'bairro'));
  const numeroRaw = normalizeText(extractMeta(metaArray, 'numero'));
  // Se numero tiver texto (como "apto 701"), concatenar ao endereço e deixar numero NULL
  const numero = numeroRaw && /^\d+$/.test(numeroRaw) ? numeroRaw : null;
  // Se tinha texto, adicionar ao endereço
  const enderecoFinal = numero === null && numeroRaw ? `${endereco}, ${numeroRaw}`.trim() : endereco;
  const cep = normalizeText(extractMeta(metaArray, 'cep'));
  const website = normalizeText(extractMeta(metaArray, 'website'));
  const fundacao = normalizeFoundationDate(extractMeta(metaArray, 'fundacao'));
  const cnpj = normalizeDocument(extractMeta(metaArray, 'cnpj'));
  const cpf = normalizeDocument(extractMeta(metaArray, 'cpf'));

  // Campos do responsável/gestor
  const email = normalizeText(extractMeta(metaArray, 'email') || extractMeta(metaArray, 'e-mail'));
  const telefone = normalizePhone(extractMeta(metaArray, 'telefone'));

  // Buscar responsavel, mas se for NULL (string), usar nome
  const responsavelRaw = extractMeta(metaArray, 'responsavel');
  const nomeRaw = extractMeta(metaArray, 'nome');
  const responsavel = responsavelRaw && responsavelRaw.toUpperCase() !== 'NULL'
    ? normalizeText(responsavelRaw)
    : normalizeText(nomeRaw);

  const funcao = normalizeText(extractMeta(metaArray, 'funcao'));

  // Campos de espécie e população
  const especie = normalizeText(extractMeta(metaArray, 'especie'));
  const outrasEspecies = normalizeText(extractMeta(metaArray, 'outras_especies'));
  const convenioLaresRaw = extractMeta(metaArray, 'convenio_lares_temporarios');
  const convenioLares = convenioLaresRaw && (convenioLaresRaw.toLowerCase() === 'sim' || convenioLaresRaw.toLowerCase() === 'yes') ? true : false;

  // População inicial
  const populacaoRaw = extractMeta(metaArray, 'populacao');
  const populacaoCaes = populacaoRaw && !isNaN(parseInt(populacaoRaw)) ? parseInt(populacaoRaw) : 0;

  const populacaoGatosRaw = extractMeta(metaArray, 'populacao_gatos');
  const populacaoGatos = populacaoGatosRaw && !isNaN(parseInt(populacaoGatosRaw)) ? parseInt(populacaoGatosRaw) : 0;

  const createdAt = parseWpDate(wpPost.post_date);
  const updatedAt = parseWpDate(wpPost.post_modified);

  return {
    wp_post_id: wpPost.id,
    profile_id: null, // Será vinculado no login
    shelter_type: shelterType,
    cnpj,
    cpf,
    name,
    cep,
    street: enderecoFinal,
    number: numero,
    district: bairro,
    state: estado,
    city: cidade,
    website,
    foundation_date: fundacao,
    species: especie,
    additional_species: outrasEspecies,
    temporary_agreement: convenioLares,
    initial_dogs: populacaoCaes,
    initial_cats: populacaoGatos,
    authorized_name: responsavel,
    authorized_role: funcao,
    authorized_email: email,
    authorized_phone: telefone,
    active: true, // Assumir ativo para migrados
    accept_terms: true, // Assumir aceite para migrados
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

/**
 * Valida se um registro de abrigo é válido para migração
 */
function validateShelter(shelter) {
  // Obrigatórios: wp_post_id e name
  if (!shelter.wp_post_id) {
    return { ok: false, reason: 'wp_post_id ausente' };
  }

  if (!shelter.name || shelter.name.trim().length === 0) {
    return { ok: false, reason: 'name ausente ou vazio' };
  }

  return { ok: true };
}

// ========================================
// LEITURA DO LEGADO
// ========================================

/**
 * Busca abrigos do WordPress com paginação
 */
async function fetchLegacyShelters(offset = 0, pageSize = PAGE_SIZE) {
  const { data: posts, error: postsError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author, post_date, post_content, post_title, post_name, post_status, post_modified, post_type')
    .eq('post_type', 'abrigo')
    .order('id', { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (postsError) {
    throw new Error(`Erro ao buscar posts: ${postsError.message}`);
  }

  if (!posts || posts.length === 0) {
    return [];
  }

  const postIds = posts.map(p => p.id);

  // Buscar TODOS os metadados em lotes
  let allMetas = [];
  const CHUNK_SIZE = 50;

  for (let i = 0; i < postIds.length; i += CHUNK_SIZE) {
    const chunk = postIds.slice(i, i + CHUNK_SIZE);
    const { data: metas, error: metasError } = await supabase
      .from('wp_postmeta_raw')
      .select('post_id, meta_key, meta_value')
      .in('post_id', chunk)
      .in('meta_key', [
        'estado',
        'tipo',
        'cidade',
        'endereco',
        'bairro',
        'numero',
        'cep',
        'website',
        'fundacao',
        'cnpj',
        'cpf',
        'nome',
        'email',
        'e-mail',
        'telefone',
        'funcao',
        'responsavel',
        'especie',
        'outras_especies',
        'convenio_lares_temporarios',
        'populacao',
        'populacao_gatos',
      ]);

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
 * Conta total de abrigos no legado
 */
async function countLegacyShelters() {
  const { count, error } = await supabase
    .from('wp_posts_raw')
    .select('*', { count: 'exact', head: true })
    .eq('post_type', 'abrigo');

  if (error) {
    console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
    throw new Error(`Erro ao contar abrigos: ${error.message || error.code || 'Erro desconhecido'}`);
  }

  return count || 0;
}

// ========================================
// UPSERT NO SUPABASE
// ========================================

/**
 * Faz upsert em lote de abrigos
 */
async function upsertShelters(shelters) {
  if (isDryRun) {
    console.log(`   [DRY-RUN] Simulando upsert de ${shelters.length} registros...`);
    return { inserted: 0, updated: shelters.length };
  }

  const { data, error } = await supabase
    .from('shelters')
    .upsert(shelters, {
      onConflict: 'wp_post_id',
      ignoreDuplicates: false,
    })
    .select('id, wp_post_id');

  if (error) {
    throw new Error(`Erro ao fazer upsert: ${error.message}`);
  }

  return { inserted: 0, updated: data?.length || shelters.length };
}

// ========================================
// SCRIPT PRINCIPAL
// ========================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Migração de Abrigos: WordPress → Supabase                ║');
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
    // 1. Contar total de abrigos legados
    console.log('📊 Contando abrigos no legado...');
    stats.totalLegacy = await countLegacyShelters();
    console.log(`   Total encontrado: ${stats.totalLegacy}\n`);

    if (stats.totalLegacy === 0) {
      console.log('⚠️  Nenhum abrigo encontrado no legado. Abortando.\n');
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
      const legacyShelters = await fetchLegacyShelters(offset, PAGE_SIZE);

      if (legacyShelters.length === 0) {
        hasMore = false;
        break;
      }

      // Transformar e validar
      const validShelters = [];
      const invalidShelters = [];

      for (const { post, metas } of legacyShelters) {
        const shelter = mapLegacyShelterToNew(post, metas);
        const validation = validateShelter(shelter);

        // DEBUG: Log primeiro registro
        if (post.id === 685) {
          console.log('\n[DEBUG] Abrigo 685:');
          console.log('  authorized_name:', shelter.authorized_name);
          console.log('  authorized_email:', shelter.authorized_email);
          console.log('  authorized_phone:', shelter.authorized_phone);
          console.log('  species:', shelter.species);
          console.log('\n');
        }

        if (validation.ok) {
          validShelters.push(shelter);
        } else {
          invalidShelters.push({
            wp_post_id: post.id,
            reason: validation.reason,
          });
          stats.invalid++;
        }
      }

      console.log(`   ✅ Válidos: ${validShelters.length}`);
      console.log(`   ❌ Inválidos: ${invalidShelters.length}`);

      // Registrar inválidos
      if (invalidShelters.length > 0) {
        stats.errors.push(...invalidShelters);
      }

      // Upsert em batches menores
      if (validShelters.length > 0) {
        for (let i = 0; i < validShelters.length; i += BATCH_SIZE) {
          const batch = validShelters.slice(i, i + BATCH_SIZE);
          try {
            const result = await upsertShelters(batch);
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
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'migrate-shelters-report.json');
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
