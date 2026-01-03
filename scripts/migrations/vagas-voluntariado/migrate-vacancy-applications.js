/**
 * Script de Migração: Candidaturas de Vagas (WordPress → Supabase)
 *
 * Migra as candidaturas armazenadas no campo 'inscritos' (meta_key)
 * das vagas do WordPress para a tabela vacancy_applications do Supabase.
 *
 * Estrutura no WordPress:
 * - Campo: wp_postmeta.meta_value (meta_key = 'inscritos')
 * - Formato: CSV de user_ids (ex: "585,626,719")
 * - user_ids são os autores (post_author) dos posts tipo 'voluntario'
 *
 * Requisitos:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - Tabelas volunteers e vacancies já migradas
 *
 * Uso:
 * - Dry-run: node migrate-vacancy-applications.js --dry-run
 * - Migração completa: node migrate-vacancy-applications.js
 */

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
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

// Argumentos CLI
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

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
// ESTATÍSTICAS
// ========================================

const stats = {
  totalVacanciesWithApplications: 0,
  totalApplicationsFound: 0,
  totalApplicationsCreated: 0,
  totalApplicationsSkipped: 0,
  errors: [],
  vacancyNotFound: [],
  volunteerNotFound: [],
};

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Explode CSV string em array de números
 */
function explodeCSV(csvString) {
  if (!csvString || typeof csvString !== 'string') return [];

  return csvString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
}

/**
 * Busca todas as vagas com candidaturas no WordPress
 */
async function fetchVacanciesWithApplications() {
  console.log('📋 Buscando vagas com candidaturas no WordPress...\n');

  const { data: inscritosMetas, error } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_value')
    .eq('meta_key', 'inscritos')
    .not('meta_value', 'is', null)
    .neq('meta_value', '');

  if (error) {
    throw new Error(`Erro ao buscar meta 'inscritos': ${error.message}`);
  }

  const nonEmpty = inscritosMetas.filter(m => m.meta_value && m.meta_value.trim());

  console.log(`✅ Encontradas ${nonEmpty.length} vagas com candidaturas\n`);
  stats.totalVacanciesWithApplications = nonEmpty.length;

  return nonEmpty;
}

/**
 * Mapeia wp_post_id → vacancy_id (Supabase UUID)
 */
async function mapVacancyWpIdToUuid(wpPostId) {
  const { data, error } = await supabase
    .from('vacancies')
    .select('id')
    .eq('wp_post_id', wpPostId)
    .maybeSingle();

  if (error) {
    console.error(`   ⚠️  Erro ao buscar vaga wp_post_id=${wpPostId}: ${error.message}`);
    return null;
  }

  if (!data) {
    stats.vacancyNotFound.push(wpPostId);
    return null;
  }

  return data.id;
}

/**
 * Mapeia wp_user_id → volunteer_id (Supabase UUID)
 *
 * Lógica:
 * 1. Busca post tipo 'voluntario' onde post_author = wp_user_id
 * 2. Pega o ID desse post (wp_post_id)
 * 3. Mapeia wp_post_id → volunteer.id no Supabase
 */
async function mapUserIdToVolunteerId(wpUserId) {
  // 1. Buscar post de voluntário criado por este user
  const { data: volunteerPost, error: postError } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'voluntario')
    .eq('post_author', wpUserId)
    .eq('post_status', 'publish')
    .maybeSingle();

  if (postError) {
    console.error(`   ⚠️  Erro ao buscar voluntário user_id=${wpUserId}: ${postError.message}`);
    return null;
  }

  if (!volunteerPost) {
    stats.volunteerNotFound.push(wpUserId);
    return null;
  }

  // 2. Mapear wp_post_id → volunteer.id no Supabase
  const { data: volunteer, error: volError } = await supabase
    .from('volunteers')
    .select('id')
    .eq('wp_post_id', volunteerPost.id)
    .maybeSingle();

  if (volError) {
    console.error(`   ⚠️  Erro ao mapear voluntário wp_post_id=${volunteerPost.id}: ${volError.message}`);
    return null;
  }

  if (!volunteer) {
    stats.volunteerNotFound.push(wpUserId);
    return null;
  }

  return volunteer.id;
}

/**
 * Cria uma candidatura no Supabase
 */
async function createApplication(vacancyId, volunteerId) {
  if (isDryRun) {
    return { success: true, dryRun: true };
  }

  const { data, error } = await supabase
    .from('vacancy_applications')
    .insert({
      vacancy_id: vacancyId,
      volunteer_id: volunteerId,
      status: 'pending',
      applied_at: new Date().toISOString(), // Não temos data original, usar agora
    })
    .select()
    .single();

  if (error) {
    // Se for erro de duplicata (23505), não é erro crítico
    if (error.code === '23505') {
      return { success: true, duplicate: true };
    }
    return { success: false, error };
  }

  return { success: true, data };
}

/**
 * Processa uma vaga e suas candidaturas
 */
async function processVacancy(inscritoMeta, index, total) {
  const { post_id: wpVacancyId, meta_value: inscritosCSV } = inscritoMeta;

  console.log(`\n[${ index + 1}/${total}] Processando vaga WordPress ID: ${wpVacancyId}`);

  // 1. Mapear vaga WordPress → Supabase
  const vacancyId = await mapVacancyWpIdToUuid(wpVacancyId);
  if (!vacancyId) {
    console.log(`   ⚠️  Vaga não encontrada no Supabase (wp_post_id=${wpVacancyId})`);
    return;
  }

  console.log(`   ✅ Vaga Supabase ID: ${vacancyId}`);

  // 2. Explodir CSV de user_ids
  const userIds = explodeCSV(inscritosCSV);
  console.log(`   📋 Candidaturas encontradas: ${userIds.length} (${inscritosCSV})`);
  stats.totalApplicationsFound += userIds.length;

  // 3. Processar cada candidatura
  let created = 0;
  let skipped = 0;

  for (const wpUserId of userIds) {
    // 3.1. Mapear user_id → volunteer_id
    const volunteerId = await mapUserIdToVolunteerId(wpUserId);

    if (!volunteerId) {
      console.log(`   ⚠️  Voluntário não encontrado para user_id=${wpUserId}`);
      skipped++;
      continue;
    }

    // 3.2. Criar candidatura
    const result = await createApplication(vacancyId, volunteerId);

    if (result.success) {
      if (result.duplicate) {
        console.log(`   ⚠️  Candidatura já existe (volunteer_id=${volunteerId})`);
        skipped++;
      } else if (result.dryRun) {
        console.log(`   🔍 DRY RUN: Criaria candidatura (volunteer_id=${volunteerId})`);
        created++;
      } else {
        console.log(`   ✅ Candidatura criada (volunteer_id=${volunteerId})`);
        created++;
      }
    } else {
      console.log(`   ❌ Erro ao criar candidatura: ${result.error?.message}`);
      stats.errors.push({
        vacancyId,
        volunteerId,
        error: result.error?.message,
      });
      skipped++;
    }
  }

  stats.totalApplicationsCreated += created;
  stats.totalApplicationsSkipped += skipped;

  console.log(`   📊 Resultado: ${created} criadas, ${skipped} ignoradas`);
}

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function main() {
  try {
    console.log('\n🚀 MIGRAÇÃO DE CANDIDATURAS DE VAGAS\n');
    console.log('='.repeat(80));

    if (isDryRun) {
      console.log('\n⚠️  MODO DRY RUN - Nenhuma candidatura será criada de verdade\n');
    }

    const startTime = Date.now();

    // 1. Buscar vagas com candidaturas
    const vacanciesWithApps = await fetchVacanciesWithApplications();

    if (vacanciesWithApps.length === 0) {
      console.log('ℹ️  Nenhuma vaga com candidaturas encontrada. Nada a migrar.');
      return;
    }

    // 2. Processar cada vaga
    console.log('📝 Processando candidaturas...\n');
    console.log('='.repeat(80));

    for (let i = 0; i < vacanciesWithApps.length; i++) {
      await processVacancy(vacanciesWithApps[i], i, vacanciesWithApps.length);
    }

    // 3. Relatório final
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ MIGRAÇÃO CONCLUÍDA!\n');
    console.log('📊 ESTATÍSTICAS:\n');
    console.log(`   ⏱️  Tempo total: ${duration}s`);
    console.log(`   📋 Vagas com candidaturas: ${stats.totalVacanciesWithApplications}`);
    console.log(`   🔍 Candidaturas encontradas: ${stats.totalApplicationsFound}`);
    console.log(`   ✅ Candidaturas criadas: ${stats.totalApplicationsCreated}`);
    console.log(`   ⚠️  Candidaturas ignoradas: ${stats.totalApplicationsSkipped}`);
    console.log(`   ❌ Erros: ${stats.errors.length}`);

    if (stats.vacancyNotFound.length > 0) {
      console.log(`\n   ⚠️  Vagas não encontradas no Supabase (${stats.vacancyNotFound.length}):`);
      console.log(`       WP Post IDs: ${stats.vacancyNotFound.join(', ')}`);
    }

    if (stats.volunteerNotFound.length > 0) {
      console.log(`\n   ⚠️  Voluntários não encontrados (${stats.volunteerNotFound.length}):`);
      console.log(`       WP User IDs: ${[...new Set(stats.volunteerNotFound)].join(', ')}`);
    }

    if (stats.errors.length > 0) {
      console.log('\n   ❌ Erros detalhados:');
      stats.errors.forEach((err, i) => {
        console.log(`       ${i + 1}. Vaga ${err.vacancyId}, Voluntário ${err.volunteerId}: ${err.error}`);
      });
    }

    console.log('\n' + '='.repeat(80) + '\n');

    if (isDryRun) {
      console.log('⚠️  MODO DRY RUN - Execute sem --dry-run para migrar de verdade\n');
    }

  } catch (error) {
    console.error('\n❌ ERRO FATAL:\n');
    console.error(error);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { main };
