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

async function forceUpdate() {
  console.log('\n🔧 Forçando update para wp_post_id 1955...\n');

  const { data, error } = await supabase
    .from('volunteers')
    .update({
      periodo: 'Semanal',
      atuacao: 'Presencial',
      disponibilidade: '6h',
      experiencia: 'sim'
    })
    .eq('wp_post_id', 1955)
    .select();

  if (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }

  console.log('✅ Atualizado com sucesso!');
  console.log('📊 Dados:', data);

  process.exit(0);
}

forceUpdate();
