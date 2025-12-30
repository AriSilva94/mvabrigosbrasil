/**
 * Script para verificar quantos posts têm os campos periodo e atuacao no WordPress
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

async function checkDistribution() {
  console.log('\n🔍 Verificando distribuição de periodo e atuacao no WordPress...\n');

  // Total de posts voluntario
  const { count: totalPosts } = await supabase
    .from('wp_posts_raw')
    .select('*', { count: 'exact', head: true })
    .eq('post_type', 'voluntario');

  console.log(`📊 Total de posts (voluntario): ${totalPosts}\n`);

  // Buscar todos os post_ids de voluntários
  const { data: allPosts } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'voluntario');

  const allPostIds = allPosts.map(p => p.id);

  // Contar quantos têm meta_key "periodo"
  const { data: periodoMetas } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_value')
    .in('post_id', allPostIds)
    .eq('meta_key', 'periodo')
    .not('meta_value', 'is', null);

  // Contar quantos têm meta_key "atuacao"
  const { data: atuacaoMetas } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_value')
    .in('post_id', allPostIds)
    .eq('meta_key', 'atuacao')
    .not('meta_value', 'is', null);

  console.log(`📋 Posts com "periodo": ${periodoMetas?.length || 0}/${totalPosts}`);
  if (periodoMetas && periodoMetas.length > 0) {
    const uniqueValues = [...new Set(periodoMetas.map(m => m.meta_value))];
    console.log(`   Valores únicos: ${uniqueValues.join(', ')}\n`);

    // Mostrar 3 exemplos
    console.log('   Exemplos:');
    periodoMetas.slice(0, 3).forEach(m => {
      console.log(`   - post_id ${m.post_id}: "${m.meta_value}"`);
    });
  }

  console.log(`\n📋 Posts com "atuacao": ${atuacaoMetas?.length || 0}/${totalPosts}`);
  if (atuacaoMetas && atuacaoMetas.length > 0) {
    const uniqueValues = [...new Set(atuacaoMetas.map(m => m.meta_value))];
    console.log(`   Valores únicos: ${uniqueValues.join(', ')}\n`);

    // Mostrar 3 exemplos
    console.log('   Exemplos:');
    atuacaoMetas.slice(0, 3).forEach(m => {
      console.log(`   - post_id ${m.post_id}: "${m.meta_value}"`);
    });
  }

  console.log('\n');
  process.exit(0);
}

checkDistribution();
