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

async function checkColumns() {
  console.log('\n🔍 Verificando post da Mariana...\n');

  const { data: user } = await supabase
    .from('wp_users_legacy')
    .select('id')
    .ilike('user_email', 'marianacmorgan@gmail.com')
    .single();

  const { data: post } = await supabase
    .from('wp_posts_raw')
    .select('*')
    .eq('post_type', 'voluntario')
    .eq('post_author', user.id)
    .single();

  console.log('📋 TODAS as colunas do post:\n');
  Object.entries(post).forEach(([key, value]) => {
    const strValue = String(value || '');
    if (strValue.length > 100) {
      console.log(key + ': ' + strValue.substring(0, 100) + '...');
    } else {
      console.log(key + ': ' + strValue);
    }
  });

  process.exit(0);
}

checkColumns();
