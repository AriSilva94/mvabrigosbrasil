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
  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key, meta_value')
    .eq('post_id', 2151)
    .order('meta_key');

  console.log('TODOS os meta_keys do post 2151 (Resgatitos):\n');
  metas?.forEach(m => {
    if (!m.meta_key.startsWith('_')) {
      console.log(`${m.meta_key}: "${m.meta_value}"`);
    }
  });
})();
