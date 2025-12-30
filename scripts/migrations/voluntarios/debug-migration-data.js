/**
 * Debug script: Verificar o que a migração está recebendo de dados
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

function extractMeta(metaArray, key) {
  if (!Array.isArray(metaArray)) return null;
  const meta = metaArray.find(m => m.meta_key === key);
  return meta?.meta_value || null;
}

async function debugMigration() {
  console.log('\n🔍 DEBUG: Simulando o que a migração vê para wp_post_id 1955...\n');

  // 1. Buscar o post exatamente como a migração faz
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author, post_date, post_content, post_title, post_status, post_modified, post_type')
    .eq('post_type', 'voluntario')
    .eq('id', 1955);

  if (!posts || posts.length === 0) {
    console.error('❌ Post não encontrado');
    process.exit(1);
  }

  const post = posts[0];
  console.log('📋 POST encontrado:');
  console.log(JSON.stringify(post, null, 2));

  // 2. Buscar metadados exatamente como a migração faz
  const postIds = [post.id];
  const { data: metas, error: metasError } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_key, meta_value')
    .in('post_id', postIds);

  console.log('\n📊 METADADOS retornados pela query:');
  if (metasError) {
    console.error('❌ Erro ao buscar metadados:', metasError);
  } else if (!metas || metas.length === 0) {
    console.log('⚠️  NENHUM metadado retornado! (array vazio ou null)');
  } else {
    console.log(`✅ ${metas.length} metadados encontrados:`);
    metas.forEach(meta => {
      console.log(`   ${meta.meta_key}: ${meta.meta_value}`);
    });
  }

  // 3. Testar a função extractMeta
  console.log('\n🔧 Testando extractMeta():');
  const testKeys = ['periodo', 'atuacao', 'disponibilidade', 'experiencia', 'cidade', 'estado', 'telefone'];
  testKeys.forEach(key => {
    const value = extractMeta(metas, key);
    console.log(`   extractMeta(metas, '${key}'): ${value || '(NULL)'}`);
  });

  console.log('\n');
  process.exit(0);
}

debugMigration();
