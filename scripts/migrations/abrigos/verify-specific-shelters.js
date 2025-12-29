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
  // Verificar abrigos específicos que sabemos que têm dados
  const testIds = [2137, 2142, 2151, 2160, 2270, 2275, 2288];

  console.log('Verificando abrigos específicos com dados conhecidos no WP...\n');

  for (const wpId of testIds) {
    const { data: shelter } = await supabase
      .from('shelters')
      .select('wp_post_id, name, district, cep, website, cnpj, cpf, authorized_name, authorized_email, authorized_phone, species')
      .eq('wp_post_id', wpId)
      .single();

    if (shelter) {
      console.log(`\n📍 ${shelter.name} (wp_post_id: ${wpId})`);
      console.log(`  Bairro: ${shelter.district || '❌ FALTANDO'}`);
      console.log(`  CEP: ${shelter.cep || '❌ FALTANDO'}`);
      console.log(`  CNPJ: ${shelter.cnpj || '(não tem)'}`);
      console.log(`  CPF: ${shelter.cpf || '(não tem)'}`);
      console.log(`  Responsável: ${shelter.authorized_name || '❌ FALTANDO'}`);
      console.log(`  Email: ${shelter.authorized_email || '❌ FALTANDO'}`);
      console.log(`  Telefone: ${shelter.authorized_phone || '❌ FALTANDO'}`);
      console.log(`  Espécie: ${shelter.species || '❌ FALTANDO'}`);
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('Agora verificando os dados originais no WordPress...\n');

  // Verificar um exemplo no WP
  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key, meta_value')
    .eq('post_id', 2137);

  console.log('Metadados do wp_post_id 2137 (Gateiros de Santa):');
  const relevantKeys = ['bairro', 'cep', 'cnpj', 'cpf', 'nome', 'email', 'e-mail', 'telefone', 'responsavel', 'funcao', 'especie'];
  metas?.filter(m => relevantKeys.includes(m.meta_key)).forEach(m => {
    console.log(`  ${m.meta_key}: "${m.meta_value}"`);
  });
})();
