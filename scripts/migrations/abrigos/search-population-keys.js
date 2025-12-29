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
  console.log('Buscando meta_keys relacionados a população...\n');

  const { data } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key')
    .like('meta_key', '%populacao%');

  const uniqueKeys = [...new Set(data.map(d => d.meta_key))].sort();

  console.log(`Encontrados ${uniqueKeys.length} meta_keys únicos:\n`);
  uniqueKeys.forEach(k => console.log(`  ${k}`));

  // Buscar exemplos de abrigos com esses campos
  console.log('\n\nExemplos de valores:');
  for (const key of uniqueKeys.slice(0, 5)) {
    const { data: examples } = await supabase
      .from('wp_postmeta_raw')
      .select('post_id, meta_value')
      .eq('meta_key', key)
      .not('meta_value', 'is', null)
      .neq('meta_value', '')
      .neq('meta_value', 'null')
      .limit(3);

    console.log(`\n  ${key}:`);
    examples?.forEach(e => {
      console.log(`    post_id ${e.post_id}: "${e.meta_value}"`);
    });
  }
})();
