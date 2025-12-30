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

async function findAtuacao() {
  console.log('\n🔍 Buscando todos meta_keys de voluntários...\n');

  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'voluntario')
    .limit(10);

  const postIds = posts?.map(p => p.id) || [];

  const { data: allMetas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key, meta_value')
    .in('post_id', postIds);

  const uniqueKeys = [...new Set(allMetas?.map(m => m.meta_key) || [])].sort();

  console.log('📋 TODOS os meta_keys de voluntários:\n');
  uniqueKeys.forEach(key => {
    console.log(`   - ${key}`);
  });

  process.exit(0);
}

findAtuacao();
