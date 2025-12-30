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

(async () => {
  console.log('Investigando usuário viralataviraluxo@gmail.com...\n');

  // Verificar wp_users_raw
  const { data: wpUser } = await supabase
    .from('wp_users_raw')
    .select('id, user_login, user_email')
    .eq('user_login', 'viralataviraluxo@gmail.com')
    .maybeSingle();

  if (!wpUser) {
    console.log('❌ Usuário NÃO encontrado em wp_users_raw');

    // Tentar buscar por email
    const { data: byEmail } = await supabase
      .from('wp_users_raw')
      .select('id, user_login, user_email')
      .eq('user_email', 'viralataviraluxo@gmail.com')
      .maybeSingle();

    if (byEmail) {
      console.log('✅ Encontrado por EMAIL em wp_users_raw:');
      console.log(`   ID: ${byEmail.id}`);
      console.log(`   Login: ${byEmail.user_login}`);
      console.log(`   Email: ${byEmail.user_email}`);
    } else {
      console.log('❌ Também não encontrado por email');
      return;
    }
  } else {
    console.log('✅ Usuário encontrado em wp_users_raw:');
    console.log(`   ID: ${wpUser.id}`);
    console.log(`   Login: ${wpUser.user_login}`);
    console.log(`   Email: ${wpUser.user_email}`);
  }

  const userId = wpUser?.id || 994;

  // Verificar posts desse usuário
  console.log(`\nBuscando posts do usuário ID ${userId}...\n`);

  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title, post_type, post_status')
    .eq('post_author', userId);

  if (!posts || posts.length === 0) {
    console.log('❌ Nenhum post encontrado para esse usuário');
    console.log('   Por isso não foi populado em wp_users_legacy');
    return;
  }

  console.log(`✅ Posts encontrados: ${posts.length}\n`);
  posts.forEach(p => {
    console.log(`   ID: ${p.id} | Tipo: ${p.post_type} | Status: ${p.post_status}`);
    console.log(`   Título: ${p.post_title}\n`);
  });

  // Verificar se está em wp_users_legacy
  const { data: legacyUser } = await supabase
    .from('wp_users_legacy')
    .select('id, user_login, user_email')
    .eq('id', userId)
    .maybeSingle();

  console.log('\n═══════════════════════════════════════════════════════════');
  if (legacyUser) {
    console.log('✅ Usuário EXISTE em wp_users_legacy');
  } else {
    console.log('❌ Usuário NÃO EXISTE em wp_users_legacy');
    console.log('   Precisa ser adicionado manualmente ou rodar populate novamente');
  }
  console.log('═══════════════════════════════════════════════════════════');
})();
