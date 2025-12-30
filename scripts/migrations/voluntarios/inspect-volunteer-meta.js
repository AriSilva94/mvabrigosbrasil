/**
 * Script para inspecionar metadados de voluntários
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar .env.local
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

async function inspectVolunteerMeta() {
  console.log('\n📋 Inspecionando metadados de voluntários...\n');

  // Buscar um voluntário de exemplo
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title')
    .eq('post_type', 'voluntario')
    .limit(3);

  if (!posts || posts.length === 0) {
    console.log('❌ Nenhum voluntário encontrado');
    return;
  }

  for (const post of posts) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 Voluntário: ${post.post_title} (ID: ${post.id})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Buscar todos os metadados deste voluntário
    const { data: metas } = await supabase
      .from('wp_postmeta_raw')
      .select('meta_key, meta_value')
      .eq('post_id', post.id)
      .order('meta_key');

    if (metas && metas.length > 0) {
      metas.forEach(meta => {
        const value = meta.meta_value?.length > 100
          ? meta.meta_value.substring(0, 100) + '...'
          : meta.meta_value;
        console.log(`${meta.meta_key.padEnd(40)} = ${value}`);
      });
    } else {
      console.log('(Nenhum metadado encontrado)');
    }
  }

  // Listar todas as meta_keys únicas
  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 TODAS AS META_KEYS ÚNICAS (voluntários)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const postIds = posts.map(p => p.id);
  const { data: allMetas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key')
    .in('post_id', postIds);

  const uniqueKeys = [...new Set(allMetas?.map(m => m.meta_key) || [])].sort();

  uniqueKeys.forEach((key, index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${key}`);
  });

  console.log(`\n✅ Total de meta_keys únicas: ${uniqueKeys.length}\n`);
  process.exit(0);
}

inspectVolunteerMeta();
