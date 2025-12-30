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
  console.log('Investigando dados de dinâmica populacional...\n');

  // Buscar posts de dinâmica do author 727
  const { data: dinamicaPosts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title, post_type, post_date')
    .eq('post_author', 727)
    .in('post_type', ['dinamica', 'dinamica_lar'])
    .order('post_date', { ascending: true });

  console.log(`Posts de dinâmica encontrados: ${dinamicaPosts?.length || 0}\n`);

  if (dinamicaPosts && dinamicaPosts.length > 0) {
    for (const post of dinamicaPosts) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Post ID: ${post.id} | Tipo: ${post.post_type}`);
      console.log(`Título: ${post.post_title}`);
      console.log(`Data: ${post.post_date}`);

      const { data: metas } = await supabase
        .from('wp_postmeta_raw')
        .select('meta_key, meta_value')
        .eq('post_id', post.id);

      console.log(`\nMetadados (${metas?.length || 0}):`);
      metas?.forEach(m => {
        if (m.meta_value && m.meta_value !== 'null' && !m.meta_key.startsWith('_')) {
          console.log(`  ${m.meta_key}: "${m.meta_value}"`);
        }
      });
    }
  }

  // Também verificar o post do abrigo principal
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('Verificando post ABRIGO (2151) para comparação...\n');

  const { data: abrigoMetas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key, meta_value')
    .eq('post_id', 2151);

  const relevantKeys = abrigoMetas?.filter(m =>
    m.meta_key.includes('populacao') ||
    m.meta_key.includes('inicial') ||
    m.meta_key.includes('caes') ||
    m.meta_key.includes('gatos') ||
    m.meta_key.includes('lares') ||
    m.meta_key.includes('temporarios') ||
    m.meta_key.includes('convenio')
  );

  console.log('Meta keys relacionados a população/lares:');
  if (relevantKeys && relevantKeys.length > 0) {
    relevantKeys.forEach(m => {
      console.log(`  ${m.meta_key}: "${m.meta_value}"`);
    });
  } else {
    console.log('  (nenhum encontrado no post abrigo)');
  }
})();
