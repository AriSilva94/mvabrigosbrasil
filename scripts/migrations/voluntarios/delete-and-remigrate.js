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

async function deleteAndCheck() {
  console.log('\n🗑️  Deletando TODOS os voluntários migrados para fazer nova migração...\n');

  const { error } = await supabase
    .from('volunteers')
    .delete()
    .not('wp_post_id', 'is', null);

  if (error) {
    console.error('❌ Erro ao deletar:', error);
    process.exit(1);
  }

  console.log('✅ Todos os voluntários migrados foram deletados!');
  console.log('\n📌 Agora rode: node migrate-volunteers-wp-to-supabase.js\n');

  process.exit(0);
}

deleteAndCheck();
