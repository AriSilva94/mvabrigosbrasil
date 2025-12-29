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
  console.log('Buscando autores de abrigos que não estão em wp_users_legacy...\n');

  // Buscar todos os post_author de abrigos publicados
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('post_author')
    .eq('post_type', 'abrigo')
    .eq('post_status', 'publish');

  const authorIds = [...new Set(posts.map(p => p.post_author))].filter(id => id && id !== 0);

  console.log(`Total de autores únicos: ${authorIds.length}\n`);

  // Verificar quais NÃO estão em wp_users_legacy
  const missing = [];

  for (const authorId of authorIds) {
    const { data: legacy } = await supabase
      .from('wp_users_legacy')
      .select('id')
      .eq('id', authorId)
      .maybeSingle();

    if (!legacy) {
      missing.push(authorId);
    }
  }

  console.log(`Autores faltando em wp_users_legacy: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log('✅ Todos os autores já estão em wp_users_legacy!');
    return;
  }

  console.log('IDs faltando:', missing.join(', '));
  console.log('\nTentando buscar esses usuários em wp_users_raw...\n');

  const { data: users } = await supabase
    .from('wp_users_raw')
    .select('id, user_login, user_email, user_pass, display_name')
    .in('id', missing);

  console.log(`Encontrados em wp_users_raw: ${users?.length || 0}`);

  if (!users || users.length === 0) {
    console.log('\n❌ PROBLEMA: Esses usuários NÃO estão em wp_users_raw!');
    console.log('   Você precisa importar a tabela wp_users do WordPress para wp_users_raw');
    console.log('   Ou adicionar esses usuários manualmente');
    return;
  }

  console.log('\n✅ Adicionando usuários a wp_users_legacy...\n');

  const usersToInsert = users.map(u => ({
    id: u.id,
    user_login: u.user_login,
    user_email: u.user_email,
    user_pass: u.user_pass,
    display_name: u.display_name || u.user_login,
    migrated: false,
  }));

  const { error } = await supabase
    .from('wp_users_legacy')
    .upsert(usersToInsert);

  if (error) {
    console.log('❌ Erro ao inserir:', error);
    return;
  }

  console.log(`✅ ${usersToInsert.length} usuários adicionados a wp_users_legacy!`);

  usersToInsert.forEach(u => {
    console.log(`   - ${u.id}: ${u.user_email}`);
  });
})();
