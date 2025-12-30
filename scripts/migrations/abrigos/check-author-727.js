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
  console.log('Investigando author_id 727 (resgatitosbh@gmail.com)...\n');

  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title, post_type, post_status')
    .eq('post_author', 727);

  console.log(`Posts encontrados: ${posts.length}\n`);

  posts.forEach(p => {
    console.log(`ID: ${p.id} | Tipo: ${p.post_type} | Status: ${p.post_status}`);
    console.log(`  Título: ${p.post_title}`);
    console.log('');
  });

  console.log('\nVerificando abrigos migrados...\n');

  const postIds = posts.filter(p => p.post_type === 'abrigo').map(p => p.id);

  const { data: shelters } = await supabase
    .from('shelters')
    .select('wp_post_id, name')
    .in('wp_post_id', postIds);

  console.log(`Abrigos migrados: ${shelters.length}`);
  shelters.forEach(s => {
    console.log(`  wp_post_id: ${s.wp_post_id} - ${s.name}`);
  });
})();
