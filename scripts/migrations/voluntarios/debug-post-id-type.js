/**
 * Debug: Verificar tipo de dados do post_id
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

async function debug() {
  console.log('\n🔍 Testando tipos de dados...\n');

  // 1. Buscar posts
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'voluntario')
    .eq('id', 1955);

  const post = posts[0];
  console.log(`Post ID: ${post.id}`);
  console.log(`Tipo: ${typeof post.id}`);

  // 2. Buscar metadados com .eq()
  const { data: metasEq } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_key, meta_value')
    .eq('post_id', 1955);

  console.log(`\nMetas com .eq(1955): ${metasEq?.length || 0}`);
  if (metasEq && metasEq.length > 0) {
    console.log(`Tipo do post_id: ${typeof metasEq[0].post_id}`);
  }

  // 3. Buscar metadados com .in() passando number
  const { data: metasInNumber } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_key, meta_value')
    .in('post_id', [1955]);

  console.log(`\nMetas com .in([1955]): ${metasInNumber?.length || 0}`);

  // 4. Buscar metadados com .in() passando array de posts
  const postIds = posts.map(p => p.id);
  const { data: metasInArray } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_key, meta_value')
    .in('post_id', postIds);

  console.log(`\nMetas com .in(postIds): ${metasInArray?.length || 0}`);
  console.log(`postIds array: ${JSON.stringify(postIds)}`);
  console.log(`postIds[0] tipo: ${typeof postIds[0]}`);

  // 5. Buscar metadados com TODOS os post_ids
  const { data: allPosts } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'voluntario');

  const allPostIds = allPosts.map(p => p.id);

  const { data: metasAll } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_key, meta_value')
    .in('post_id', allPostIds);

  console.log(`\nMetas com .in(allPostIds) - ${allPostIds.length} posts: ${metasAll?.length || 0}`);

  const metas1955 = metasAll?.filter(m => m.post_id === 1955);
  console.log(`Metas para post_id 1955 no resultado: ${metas1955?.length || 0}`);

  if (metas1955 && metas1955.length > 0) {
    console.log(`Tipo do post_id no meta: ${typeof metas1955[0].post_id}`);
  }

  console.log('\n');
  process.exit(0);
}

debug();
