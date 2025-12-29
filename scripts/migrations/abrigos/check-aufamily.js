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
  console.log('Verificando abrigo Aufamily (wp_post_id: 685)...\n');

  // Buscar metadados do WordPress
  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key, meta_value')
    .eq('post_id', 685);

  console.log('Metadados no WordPress:');
  metas?.filter(m => !m.meta_key.startsWith('_')).forEach(m => {
    console.log(`  ${m.meta_key}: ${m.meta_value}`);
  });

  // Buscar dados atuais na tabela shelters
  const { data: shelter } = await supabase
    .from('shelters')
    .select('*')
    .eq('wp_post_id', 685)
    .single();

  console.log('\n\nDados atuais na tabela shelters:');
  console.log(`  authorized_name: ${shelter?.authorized_name}`);
  console.log(`  authorized_email: ${shelter?.authorized_email}`);
  console.log(`  authorized_phone: ${shelter?.authorized_phone}`);
  console.log(`  authorized_role: ${shelter?.authorized_role}`);
  console.log(`  district: ${shelter?.district}`);
  console.log(`  cep: ${shelter?.cep}`);
  console.log(`  species: ${shelter?.species}`);
  console.log(`  website: ${shelter?.website}`);
})();
