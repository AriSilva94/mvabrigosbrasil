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
  console.log('Contando abrigos com todos os campos preenchidos...\n');

  const { count: total } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true });

  console.log(`Total de abrigos: ${total}`);

  const { count: comTudo } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .not('district', 'is', null)
    .not('cep', 'is', null)
    .not('authorized_phone', 'is', null)
    .not('authorized_email', 'is', null)
    .not('species', 'is', null);

  console.log(`Abrigos com district, cep, phone, email, species: ${comTudo}`);

  // Buscar os primeiros 10
  const { data: shelters } = await supabase
    .from('shelters')
    .select('wp_post_id, name, district, cep, authorized_email, authorized_phone, species, cnpj, cpf')
    .not('district', 'is', null)
    .not('cep', 'is', null)
    .not('authorized_phone', 'is', null)
    .not('authorized_email', 'is', null)
    .not('species', 'is', null)
    .limit(10);

  console.log('\nPrimeiros 10 exemplos:');
  shelters.forEach(s => {
    console.log(`\n  ID: ${s.wp_post_id} - ${s.name}`);
    console.log(`    Bairro: ${s.district}`);
    console.log(`    CEP: ${s.cep}`);
    console.log(`    Email: ${s.authorized_email}`);
    console.log(`    Tel: ${s.authorized_phone}`);
    console.log(`    Espécie: ${s.species}`);
    console.log(`    CNPJ: ${s.cnpj || 'n/a'}`);
    console.log(`    CPF: ${s.cpf || 'n/a'}`);
  });
})();
