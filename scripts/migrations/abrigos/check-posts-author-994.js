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
  console.log('Verificando posts do author_id 994...\n');

  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title, post_type, post_status')
    .eq('post_author', 994);

  if (!posts || posts.length === 0) {
    console.log('❌ Nenhum post encontrado para author_id 994');
    console.log('   Isso significa que o usuário não tem posts importados');
    console.log('   Ou os posts estão com outro post_author');
    return;
  }

  console.log(`✅ Posts encontrados: ${posts.length}\n`);
  posts.forEach(p => {
    console.log(`   ID: ${p.id} | Tipo: ${p.post_type} | Status: ${p.post_status}`);
    console.log(`   Título: ${p.post_title}\n`);
  });

  // Contar abrigos
  const abrigos = posts.filter(p => p.post_type === 'abrigo' && p.post_status === 'publish');
  console.log(`\nAbrigos publicados: ${abrigos.length}`);

  if (abrigos.length > 0) {
    console.log('   Esse usuário DEVERIA estar em wp_users_legacy');
  }
})();
