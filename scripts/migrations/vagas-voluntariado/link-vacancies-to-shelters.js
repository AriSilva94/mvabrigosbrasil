/**
 * Script: Vincular Vagas aos Abrigos
 *
 * Vincula vagas migradas aos seus respectivos abrigos usando:
 * - wp_post_id da vaga → post_author do WordPress → abrigo do usuário
 *
 * Uso:
 * - Dry-run: node link-vacancies-to-shelters.js --dry-run
 * - Execução: node link-vacancies-to-shelters.js
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

// Argumentos CLI
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// ========================================
// VALIDAÇÃO
// ========================================

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========================================
// FUNÇÕES PRINCIPAIS
// ========================================

/**
 * Cria um mapa de wp_user_id → shelter_id
 */
async function buildUserToShelterMap() {
  console.log('📊 Construindo mapa de usuários → abrigos...');

  // Buscar todos os abrigos com seus wp_post_id
  const { data: shelters, error: sheltersError } = await supabase
    .from('shelters')
    .select('id, wp_post_id, authorized_email');

  if (sheltersError) {
    throw new Error(`Erro ao buscar shelters: ${sheltersError.message}`);
  }

  console.log(`   Encontrados ${shelters.length} abrigos\n`);

  // Buscar os posts de abrigo no WordPress para pegar post_author
  const wpPostIds = shelters.map(s => s.wp_post_id).filter(Boolean);

  if (wpPostIds.length === 0) {
    console.log('   ⚠️  Nenhum abrigo com wp_post_id encontrado\n');
    return {};
  }

  const { data: wpPosts, error: wpPostsError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author')
    .in('id', wpPostIds);

  if (wpPostsError) {
    throw new Error(`Erro ao buscar wp_posts_raw: ${wpPostsError.message}`);
  }

  // Criar mapa: wp_post_id → post_author
  const postToAuthor = {};
  wpPosts.forEach(post => {
    postToAuthor[post.id] = post.post_author;
  });

  // Criar mapa: wp_user_id → shelter_id
  const userToShelter = {};
  shelters.forEach(shelter => {
    if (shelter.wp_post_id && postToAuthor[shelter.wp_post_id]) {
      const wpUserId = postToAuthor[shelter.wp_post_id];
      userToShelter[wpUserId] = shelter.id;
    }
  });

  console.log(`   ✅ Mapeados ${Object.keys(userToShelter).length} usuários para abrigos\n`);

  return userToShelter;
}

/**
 * Vincula vagas aos abrigos
 */
async function linkVacanciesToShelters() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Vincular Vagas aos Abrigos                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (isDryRun) {
    console.log('🔍 MODO DRY-RUN: Nenhuma alteração será feita no banco\n');
  }

  const stats = {
    total: 0,
    linked: 0,
    notFound: 0,
    alreadyLinked: 0,
    errors: [],
  };

  try {
    // 1. Construir mapa de usuários → abrigos
    const userToShelter = await buildUserToShelterMap();

    // 2. Buscar vagas sem vínculo
    console.log('🔍 Buscando vagas sem vínculo...');
    const { data: vacancies, error: vacanciesError } = await supabase
      .from('vacancies')
      .select('id, title, wp_post_id, shelter_id')
      .order('id');

    if (vacanciesError) {
      throw new Error(`Erro ao buscar vagas: ${vacanciesError.message}`);
    }

    stats.total = vacancies.length;
    const unlinked = vacancies.filter(v => !v.shelter_id);
    stats.alreadyLinked = vacancies.length - unlinked.length;

    console.log(`   Total de vagas: ${stats.total}`);
    console.log(`   Já vinculadas: ${stats.alreadyLinked}`);
    console.log(`   Sem vínculo: ${unlinked.length}\n`);

    if (unlinked.length === 0) {
      console.log('✅ Todas as vagas já estão vinculadas!\n');
      return;
    }

    // 3. Buscar post_author de cada vaga no WordPress
    const wpPostIds = unlinked.map(v => v.wp_post_id).filter(Boolean);

    if (wpPostIds.length === 0) {
      console.log('⚠️  Nenhuma vaga com wp_post_id encontrada\n');
      return;
    }

    console.log('📋 Buscando autores das vagas no WordPress...');
    const { data: wpVacancies, error: wpVacanciesError } = await supabase
      .from('wp_posts_raw')
      .select('id, post_author')
      .in('id', wpPostIds);

    if (wpVacanciesError) {
      throw new Error(`Erro ao buscar vagas do WordPress: ${wpVacanciesError.message}`);
    }

    // Criar mapa: wp_post_id → post_author
    const vacancyToAuthor = {};
    wpVacancies.forEach(wpVaga => {
      vacancyToAuthor[wpVaga.id] = wpVaga.post_author;
    });

    console.log(`   ✅ Encontrados ${wpVacancies.length} registros\n`);

    // 4. Vincular vagas
    console.log('🔗 Vinculando vagas aos abrigos...\n');

    for (const vacancy of unlinked) {
      if (!vacancy.wp_post_id) {
        stats.notFound++;
        stats.errors.push({
          vacancy_id: vacancy.id,
          title: vacancy.title,
          reason: 'wp_post_id ausente',
        });
        continue;
      }

      const wpUserId = vacancyToAuthor[vacancy.wp_post_id];
      if (!wpUserId) {
        stats.notFound++;
        stats.errors.push({
          vacancy_id: vacancy.id,
          title: vacancy.title,
          reason: 'post_author não encontrado',
        });
        continue;
      }

      const shelterId = userToShelter[wpUserId];
      if (!shelterId) {
        stats.notFound++;
        stats.errors.push({
          vacancy_id: vacancy.id,
          title: vacancy.title,
          reason: `abrigo não encontrado para wp_user_id ${wpUserId}`,
        });
        continue;
      }

      // Atualizar vaga
      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from('vacancies')
          .update({ shelter_id: shelterId })
          .eq('id', vacancy.id);

        if (updateError) {
          stats.errors.push({
            vacancy_id: vacancy.id,
            title: vacancy.title,
            reason: updateError.message,
          });
          continue;
        }
      }

      stats.linked++;
      console.log(`   ✅ ${vacancy.title} → vinculada ao shelter ${shelterId.substring(0, 8)}...`);
    }

    // 5. Resumo
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMO                                                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Total de vagas:        ${stats.total}`);
    console.log(`✅ Já vinculadas:         ${stats.alreadyLinked}`);
    console.log(`🔗 Vinculadas agora:      ${stats.linked}`);
    console.log(`❌ Não encontradas:       ${stats.notFound}`);
    console.log(`⚠️  Erros:                 ${stats.errors.length}\n`);

    if (stats.errors.length > 0) {
      console.log('📋 Detalhes dos erros:\n');
      stats.errors.forEach(err => {
        console.log(`   ❌ ${err.title} (ID: ${err.vacancy_id})`);
        console.log(`      Motivo: ${err.reason}\n`);
      });
    }

    if (isDryRun) {
      console.log('🔍 Modo DRY-RUN: Execute sem --dry-run para aplicar as alterações.\n');
    } else {
      console.log('✅ Vinculação concluída com sucesso!\n');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
linkVacanciesToShelters().catch(console.error);
