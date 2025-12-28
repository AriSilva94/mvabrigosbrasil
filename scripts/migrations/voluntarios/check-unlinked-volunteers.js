/**
 * Verifica se há voluntários migrados sem owner_profile_id vinculado
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../.env.local');
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('\n🔍 Verificando voluntários migrados sem owner_profile_id...\n');

  // Total de voluntários migrados
  const { count: totalMigrated } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .not('wp_post_id', 'is', null);

  console.log(`📊 Total de voluntários migrados: ${totalMigrated}`);

  // Voluntários migrados SEM owner_profile_id
  const { count: unlinked } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .not('wp_post_id', 'is', null)
    .is('owner_profile_id', null);

  console.log(`⚠️  Voluntários SEM owner_profile_id: ${unlinked}\n`);

  if (unlinked > 0) {
    // Mostrar alguns exemplos
    const { data: examples } = await supabase
      .from('volunteers')
      .select('id, wp_post_id, name')
      .not('wp_post_id', 'is', null)
      .is('owner_profile_id', null)
      .limit(5);

    console.log('📋 Exemplos:\n');
    examples?.forEach(v => {
      console.log(`   - ${v.name} (wp_post_id: ${v.wp_post_id})`);
    });

    console.log('\n⚠️  ATENÇÃO: Se esses usuários tentarem editar o formulário,');
    console.log('   o código atual tentará criar um NOVO registro (INSERT)');
    console.log('   ao invés de atualizar o existente (UPDATE)!\n');
  } else {
    console.log('✅ Todos os voluntários migrados estão vinculados!\n');
  }

  process.exit(0);
}

check();
