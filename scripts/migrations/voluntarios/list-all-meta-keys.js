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

async function listAll() {
  console.log('🔍 Buscando TODOS meta_keys únicos...\n');

  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key')
    .limit(50000);

  const unique = [...new Set(metas?.map(m => m.meta_key) || [])].sort();

  console.log(`Total de meta_keys únicos: ${unique.length}\n`);
  console.log('📋 Meta_keys (sem prefixo _):\n');
  unique.filter(k => !k.startsWith('_')).forEach(k => console.log(`   - ${k}`));

  process.exit(0);
}

listAll();
