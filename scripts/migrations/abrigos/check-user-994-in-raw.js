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
  const { data } = await supabase
    .from('wp_users_raw')
    .select('id, user_login, user_email')
    .eq('id', 994)
    .maybeSingle();

  if (data) {
    console.log('✅ Usuario 994 encontrado em wp_users_raw:');
    console.log(`   user_login: ${data.user_login}`);
    console.log(`   user_email: ${data.user_email}`);
  } else {
    console.log('❌ Usuario 994 NAO encontrado em wp_users_raw');
    console.log('   Isso explica por que o populate-wp-users-legacy.js não o adicionou');
  }
})();
