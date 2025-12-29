/**
 * Verifica status de login dos usuários migrados
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
  console.log('\n🔍 Verificando status de login dos usuários migrados...\n');

  // 1. Total de voluntários migrados
  const { count: totalVolunteers } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .not('wp_post_id', 'is', null);

  console.log(`📊 Total de voluntários migrados: ${totalVolunteers}`);

  // 2. Voluntários COM owner_profile_id (já fizeram login)
  const { count: linked } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .not('wp_post_id', 'is', null)
    .not('owner_profile_id', 'is', null);

  console.log(`✅ Voluntários vinculados (já fizeram login): ${linked}`);

  // 3. Voluntários SEM owner_profile_id (ainda não fizeram login)
  const { count: unlinked } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .not('wp_post_id', 'is', null)
    .is('owner_profile_id', null);

  console.log(`⏳ Voluntários não vinculados (ainda não fizeram login): ${unlinked}\n`);

  // 4. Verificar profiles criados de usuários WordPress
  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('origin', 'wordpress_migrated');

  console.log(`👤 Profiles criados (usuários que já fizeram login): ${totalProfiles}\n`);

  // 5. Verificar se há profiles SEM volunteers vinculados
  const { data: profilesWithWpUserId } = await supabase
    .from('profiles')
    .select('id, wp_user_id')
    .eq('origin', 'wordpress_migrated')
    .not('wp_user_id', 'is', null);

  if (profilesWithWpUserId && profilesWithWpUserId.length > 0) {
    let needsLink = 0;

    for (const profile of profilesWithWpUserId) {
      const { data: volunteer } = await supabase
        .from('volunteers')
        .select('id')
        .eq('owner_profile_id', profile.id)
        .maybeSingle();

      if (!volunteer) {
        needsLink++;
      }
    }

    if (needsLink > 0) {
      console.log(`⚠️  Profiles que precisam de link: ${needsLink}`);
      console.log('   (Usuários que fizeram login mas o auto-link falhou)\n');
      console.log('   Execute: node link-existing-volunteers.js\n');
    } else {
      console.log('✅ Todos os profiles têm volunteers vinculados!\n');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📌 RESUMO:\n');
  console.log(`   ${linked} de ${totalVolunteers} voluntários podem editar seus dados`);
  console.log(`   ${unlinked} voluntários ainda não fizeram o primeiro login\n`);

  if (unlinked > 0) {
    console.log('💡 O que acontecerá quando esses ${unlinked} usuários fizerem login:\n');
    console.log('   1. loginService.ts criará um profile');
    console.log('   2. linkVolunteerToProfileByWpUserId() vinculará automaticamente');
    console.log('   3. owner_profile_id será preenchido');
    console.log('   4. Usuário poderá editar seus dados sem problemas\n');
  }

  process.exit(0);
}

check();
