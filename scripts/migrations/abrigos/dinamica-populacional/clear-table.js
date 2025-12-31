const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=').trim();
  env[key] = value;
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function clearTable() {
  console.log('🗑️  Limpando tabela shelter_dynamics...\n');

  const { error } = await supabase
    .from('shelter_dynamics')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }

  const { count } = await supabase
    .from('shelter_dynamics')
    .select('*', { count: 'exact', head: true });

  console.log('✅ Tabela limpa!');
  console.log(`   Registros restantes: ${count}\n`);
}

clearTable();
