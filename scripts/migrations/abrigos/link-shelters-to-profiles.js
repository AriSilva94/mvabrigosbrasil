/**
 * Script: Vincular abrigos aos profiles dos donos
 *
 * Lógica:
 * 1. Para cada shelter com wp_post_author preenchido
 * 2. Buscar o profile correspondente (profiles.wp_user_id = shelters.wp_post_author)
 * 3. Atualizar shelters.profile_id com o ID do profile encontrado
 *
 * Uso:
 *   node link-shelters-to-profiles.js [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
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
  linked: 0,
  profileNotFound: 0,
  alreadyLinked: 0,
  errors: [],
};

async function main() {
  console.log('\n🔗 VINCULAÇÃO OTIMIZADA DE ABRIGOS AOS PROFILES\n');
  console.log('='.repeat(80));

  if (isDryRun) {
    console.log('\n⚠️  MODO DRY RUN - Nenhuma alteração será feita\n');
  }

  const startTime = Date.now();

  // ========================================
  // PASSO 1: Coletar dados em batch
  // ========================================
  console.log('📋 Coletando dados...\n');

  // 1.1. Buscar todos os shelters com wp_post_author
  const { data: shelters } = await supabase
    .from('shelters')
    .select('id, name, profile_id, wp_post_author')
    .not('wp_post_author', 'is', null);

  stats.total = shelters?.length || 0;
  console.log(`✅ ${stats.total} abrigos encontrados`);

  if (!shelters || shelters.length === 0) {
    console.log('ℹ️  Nenhum abrigo para processar\n');
    return;
  }

  // 1.2. Buscar TODOS os profiles em uma query
  const uniqueWpUserIds = [...new Set(shelters.map(s => s.wp_post_author))];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, wp_user_id')
    .in('wp_user_id', uniqueWpUserIds);

  const profilesByWpUserId = new Map(
    (profiles || []).map(p => [p.wp_user_id, p])
  );

  console.log(`✅ ${profilesByWpUserId.size} profiles carregados\n`);

  // ========================================
  // PASSO 2: Processar vinculações
  // ========================================
  console.log('🔄 Processando vinculações...\n');
  console.log('='.repeat(80));

  const toUpdate = [];

  for (const shelter of shelters) {
    // Verificar se já tem profile vinculado
    if (shelter.profile_id) {
      stats.alreadyLinked++;
      continue;
    }

    // Buscar profile
    const profile = profilesByWpUserId.get(shelter.wp_post_author);

    if (!profile) {
      stats.profileNotFound++;
      continue;
    }

    toUpdate.push({
      shelterId: shelter.id,
      shelterName: shelter.name,
      profileId: profile.id,
      profileEmail: profile.email,
    });
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Já vinculados: ${stats.alreadyLinked}`);
  console.log(`   ⚠️  Profiles não encontrados: ${stats.profileNotFound}`);
  console.log(`   🔗 A vincular: ${toUpdate.length}\n`);

  if (toUpdate.length === 0) {
    console.log('ℹ️  Nada a vincular!\n');
  } else if (isDryRun) {
    console.log('🔍 DRY RUN: Vincularia os seguintes abrigos:\n');
    toUpdate.slice(0, 10).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.shelterName} → ${item.profileEmail}`);
    });
    if (toUpdate.length > 10) {
      console.log(`   ... e mais ${toUpdate.length - 10}`);
    }
    stats.linked = toUpdate.length;
  } else {
    // ========================================
    // PASSO 3: Atualizar em paralelo (OTIMIZADO)
    // ========================================
    console.log('🚀 Vinculando abrigos em paralelo...\n');

    // Processar em paralelo (20 por vez para não sobrecarregar)
    const PARALLEL_LIMIT = 20;

    for (let i = 0; i < toUpdate.length; i += PARALLEL_LIMIT) {
      const batch = toUpdate.slice(i, i + PARALLEL_LIMIT);

      const results = await Promise.allSettled(
        batch.map(item =>
          supabase
            .from('shelters')
            .update({ profile_id: item.profileId })
            .eq('id', item.shelterId)
        )
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          stats.linked++;
        } else {
          const item = batch[idx];
          stats.errors.push({
            shelterId: item.shelterId,
            shelterName: item.shelterName,
            error: result.reason?.message || result.value?.error?.message || 'Erro desconhecido',
          });
        }
      });

      console.log(`   ✅ Vinculados: ${Math.min(i + PARALLEL_LIMIT, toUpdate.length)}/${toUpdate.length}`);
    }
  }

  // 3. Relatório final
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ VINCULAÇÃO CONCLUÍDA!\n');
  console.log('📊 ESTATÍSTICAS:\n');
  console.log(`   ⏱️  Tempo total: ${duration}s`);
  console.log(`   📋 Total de abrigos: ${stats.total}`);
  console.log(`   ✅ Vinculados: ${stats.linked}`);
  console.log(`   ⚠️  Profiles não encontrados: ${stats.profileNotFound}`);
  console.log(`   ℹ️  Já vinculados: ${stats.alreadyLinked}`);
  console.log(`   ❌ Erros: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ ERROS:\n');
    stats.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.shelterName} (${err.shelterId})`);
      console.log(`      ${err.error}`);
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');

  if (isDryRun) {
    console.log('⚠️  MODO DRY RUN - Execute sem --dry-run para vincular de verdade\n');
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
