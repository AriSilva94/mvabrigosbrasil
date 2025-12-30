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
  console.log('Buscando meta keys de abrigos...\n');

  // Buscar posts de abrigos
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'abrigo')
    .limit(50);

  if (!posts || posts.length === 0) {
    console.log('Nenhum post encontrado');
    return;
  }

  const postIds = posts.map(p => p.id);

  // Buscar metadados
  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_key, meta_value')
    .in('post_id', postIds);

  const keys = [...new Set(metas.map(m => m.meta_key))].filter(k => !k.startsWith('_')).sort();

  console.log(`Total de meta_keys encontrados: ${keys.length}\n`);
  console.log('Meta keys disponíveis:');
  keys.forEach(k => console.log(`  - ${k}`));

  console.log('\n\nExemplo de um abrigo completo:');
  const firstPost = posts[0];
  const firstPostMetas = metas.filter(m => m.post_id === firstPost.id);
  console.log(`\nPost ID: ${firstPost.id}`);
  firstPostMetas.filter(m => !m.meta_key.startsWith('_')).forEach(m => {
    console.log(`  ${m.meta_key}: ${m.meta_value}`);
  });
})();
