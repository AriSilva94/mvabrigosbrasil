/**
 * Script OTIMIZADO: Criar profiles para donos de abrigos
 *
 * Otimizações:
 * - Busca TODOS os dados necessários em batch (3 queries no total)
 * - Usa Maps para lookup O(1)
 * - Não chama listUsers() repetidamente
 *
 * Uso:
 *   node create-shelter-owner-profiles-optimized.js [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env.local não encontrado');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const isDryRun = process.argv.includes('--dry-run');

const stats = {
  total: 0,
  created: 0,
  alreadyExists: 0,
  noEmail: 0,
  errors: [],
};

function genPassword() {
  return crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
}

async function main() {
  console.log('\n👤 CRIAÇÃO OTIMIZADA DE PROFILES PARA DONOS DE ABRIGOS\n');
  console.log('='.repeat(80));

  if (isDryRun) {
    console.log('\n⚠️  MODO DRY RUN - Nenhuma alteração será feita\n');
  }

  const startTime = Date.now();

  // ========================================
  // PASSO 1: Coletar todos os dados em batch
  // ========================================
  console.log('📋 Coletando dados...\n');

  // 1.1. Buscar todos os wp_user_ids únicos de donos de abrigos
  const { data: shelters } = await supabase
    .from('shelters')
    .select('wp_post_author')
    .not('wp_post_author', 'is', null);

  const uniqueWpUserIds = [...new Set(shelters.map(s => s.wp_post_author))];
  stats.total = uniqueWpUserIds.length;

  console.log(`✅ ${stats.total} donos únicos encontrados`);

  // 1.2. Buscar TODOS os profiles existentes em uma query
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('wp_user_id, email')
    .in('wp_user_id', uniqueWpUserIds);

  const profilesByWpUserId = new Map(
    (existingProfiles || []).map(p => [p.wp_user_id, p])
  );

  console.log(`✅ ${profilesByWpUserId.size} profiles já existem`);

  // 1.3. Buscar TODOS os wp_users em uma query
  const { data: wpUsers } = await supabase
    .from('wp_users_raw')
    .select('id, user_email, display_name')
    .in('id', uniqueWpUserIds);

  const wpUsersByIdMap = new Map(
    (wpUsers || []).map(u => [u.id, u])
  );

  console.log(`✅ ${wpUsersByIdMap.size} usuários do WordPress carregados`);

  // 1.4. Buscar TODOS os auth users com paginação
  console.log('   Carregando auth users...');
  let allAuthUsers = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data: authData } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000
    });

    if (authData?.users && authData.users.length > 0) {
      allAuthUsers.push(...authData.users);
      page++;
    } else {
      hasMore = false;
    }
  }

  const authUsersByEmail = new Map(
    allAuthUsers.map(u => [u.email, u])
  );

  console.log(`✅ ${authUsersByEmail.size} auth users carregados\n`);

  // ========================================
  // PASSO 2: Processar cada dono
  // ========================================
  console.log('🔄 Processando donos...\n');
  console.log('='.repeat(80));

  const toCreate = [];

  for (const wpUserId of uniqueWpUserIds) {
    // 2.1. Verificar se profile já existe
    if (profilesByWpUserId.has(wpUserId)) {
      stats.alreadyExists++;
      continue;
    }

    // 2.2. Buscar dados do usuário
    const wpUser = wpUsersByIdMap.get(wpUserId);

    if (!wpUser || !wpUser.user_email) {
      stats.noEmail++;
      continue;
    }

    // 2.3. Verificar se auth user já existe
    const existingAuthUser = authUsersByEmail.get(wpUser.user_email);

    if (existingAuthUser) {
      // Auth existe, criar apenas profile
      toCreate.push({
        type: 'profile_only',
        authUserId: existingAuthUser.id,
        email: wpUser.user_email,
        fullName: wpUser.display_name,
        wpUserId: wpUserId,
      });
    } else {
      // Criar auth + profile
      toCreate.push({
        type: 'auth_and_profile',
        email: wpUser.user_email,
        fullName: wpUser.display_name,
        wpUserId: wpUserId,
      });
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Profiles já existem: ${stats.alreadyExists}`);
  console.log(`   ⚠️  Sem email: ${stats.noEmail}`);
  console.log(`   🆕 A criar: ${toCreate.length}\n`);

  if (toCreate.length === 0) {
    console.log('ℹ️  Nada a criar!\n');
    return;
  }

  if (isDryRun) {
    console.log('🔍 DRY RUN: Criaria os seguintes profiles:\n');
    toCreate.slice(0, 10).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.email} (${item.type})`);
    });
    if (toCreate.length > 10) {
      console.log(`   ... e mais ${toCreate.length - 10}`);
    }
    stats.created = toCreate.length;
  } else {
    // ========================================
    // PASSO 3: Criar em batch (OTIMIZADO)
    // ========================================
    console.log('🚀 Criando profiles...\n');

    // 3.1. IMPORTANTE: Verificar se todos os authUserIds em profile_only realmente existem
    const profileOnlyItems = toCreate.filter(item => item.type === 'profile_only');

    if (profileOnlyItems.length > 0) {
      console.log(`   📦 Verificando ${profileOnlyItems.length} auth users antes de criar profiles...\n`);

      // Verificar quais auth users realmente existem (com paginação)
      let currentAuthUsers = [];
      let checkPage = 1;
      let checkHasMore = true;

      while (checkHasMore) {
        const { data: authData } = await supabase.auth.admin.listUsers({
          page: checkPage,
          perPage: 1000
        });

        if (authData?.users && authData.users.length > 0) {
          currentAuthUsers.push(...authData.users);
          checkPage++;
        } else {
          checkHasMore = false;
        }
      }

      const currentAuthUserIds = new Set(currentAuthUsers.map(u => u.id));

      // Separar items válidos (auth existe) dos que precisam criar auth
      const validProfileOnly = [];
      const needsAuthCreation = [];

      for (const item of profileOnlyItems) {
        if (currentAuthUserIds.has(item.authUserId)) {
          validProfileOnly.push(item);
        } else {
          // Auth user não existe mais! Precisa criar
          needsAuthCreation.push({
            type: 'auth_and_profile',
            email: item.email,
            fullName: item.fullName,
            wpUserId: item.wpUserId,
          });
        }
      }

      console.log(`   ✅ ${validProfileOnly.length} auth users válidos`);
      console.log(`   ⚠️  ${needsAuthCreation.length} precisam criar auth user\n`);

      // Adicionar os que precisam criar auth à lista de auth_and_profile
      toCreate.push(...needsAuthCreation);

      if (validProfileOnly.length > 0) {
        console.log(`   📦 Criando ${validProfileOnly.length} profiles em batch...\n`);

        // Processar em chunks de 100
        const CHUNK_SIZE = 100;
        for (let i = 0; i < validProfileOnly.length; i += CHUNK_SIZE) {
          const chunk = validProfileOnly.slice(i, i + CHUNK_SIZE);

        try {
          const { error } = await supabase
            .from('profiles')
            .insert(
              chunk.map(item => ({
                id: item.authUserId,
                email: item.email,
                full_name: item.fullName,
                wp_user_id: item.wpUserId,
                origin: 'wordpress_migrated',
              }))
            );

          if (error) {
            if (error.code === '23505') {
              // Duplicata - contar como criado
              stats.created += chunk.length;
            } else {
              throw error;
            }
          } else {
            // Sucesso - contar como criado
            stats.created += chunk.length;
          }

          console.log(`   ✅ Profiles criados: ${Math.min(i + CHUNK_SIZE, validProfileOnly.length)}/${validProfileOnly.length}`);

        } catch (error) {
          // Se bulk falhar, tentar um por um para identificar o problema
          for (const item of chunk) {
            try {
              const { error: singleError } = await supabase
                .from('profiles')
                .insert({
                  id: item.authUserId,
                  email: item.email,
                  full_name: item.fullName,
                  wp_user_id: item.wpUserId,
                  origin: 'wordpress_migrated',
                });

              if (!singleError || singleError.code === '23505') {
                stats.created++;
              } else {
                throw singleError;
              }
            } catch (singleErr) {
              stats.errors.push({
                wpUserId: item.wpUserId,
                email: item.email,
                error: singleErr.message,
              });
            }
          }
        }
        }
      }
    }

    // 3.2. Criar auth users que precisam de auth + profile (paralelo em batches)
    const authAndProfileItems = toCreate.filter(item => item.type === 'auth_and_profile');

    if (authAndProfileItems.length > 0) {
      console.log(`\n   👤 Criando ${authAndProfileItems.length} auth users + profiles...\n`);

      // Processar em paralelo (5 por vez para não sobrecarregar)
      const PARALLEL_LIMIT = 5;

      for (let i = 0; i < authAndProfileItems.length; i += PARALLEL_LIMIT) {
        const batch = authAndProfileItems.slice(i, i + PARALLEL_LIMIT);

        const results = await Promise.allSettled(
          batch.map(async (item) => {
            const password = genPassword();

            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: item.email,
              password,
              email_confirm: true,
              user_metadata: {
                registerType: 'abrigo',
                teamOnly: false,
                teamDisabled: false,
                legacyMigrated: true,
              },
            });

            if (authError) {
              throw authError;
            }

            if (!authData.user) {
              throw new Error('Auth user criado sem ID');
            }

            // Criar profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: item.email,
                full_name: item.fullName,
                wp_user_id: item.wpUserId,
                origin: 'wordpress_migrated',
              });

            if (profileError && profileError.code !== '23505') {
              throw profileError;
            }

            return item;
          })
        );

        // Processar resultados
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            stats.created++;
          } else {
            const item = batch[idx];
            stats.errors.push({
              wpUserId: item.wpUserId,
              email: item.email,
              error: result.reason?.message || 'Erro desconhecido',
            });
          }
        });

        console.log(`   ✅ Auth users criados: ${Math.min(i + PARALLEL_LIMIT, authAndProfileItems.length)}/${authAndProfileItems.length}`);
      }
    }
  }

  // ========================================
  // RELATÓRIO FINAL
  // ========================================
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ CRIAÇÃO DE PROFILES CONCLUÍDA!\n');
  console.log('📊 ESTATÍSTICAS:\n');
  console.log(`   ⏱️  Tempo total: ${duration}s`);
  console.log(`   📋 Total de donos: ${stats.total}`);
  console.log(`   ✅ Profiles criados: ${stats.created}`);
  console.log(`   ℹ️  Já existiam: ${stats.alreadyExists}`);
  console.log(`   ⚠️  Sem email: ${stats.noEmail}`);
  console.log(`   ❌ Erros: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ ERROS:\n');
    stats.errors.slice(0, 10).forEach((err, i) => {
      console.log(`   ${i + 1}. WP User ID ${err.wpUserId} (${err.email})`);
      console.log(`      ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... e mais ${stats.errors.length - 10} erros`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');

  if (isDryRun) {
    console.log('⚠️  MODO DRY RUN - Execute sem --dry-run para criar de verdade\n');
  } else {
    console.log('💡 PRÓXIMO PASSO: Execute link-shelters-to-profiles.js\n');
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ ERRO FATAL:\n');
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
