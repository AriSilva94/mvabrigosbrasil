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
  console.log('Comparando TODOS os metadados dos abrigos...\n');

  // Buscar 10 abrigos aleatórios
  const { data: shelters } = await supabase
    .from('shelters')
    .select('wp_post_id, name, district, cep, website, cnpj, cpf')
    .not('wp_post_id', 'is', null)
    .limit(20);

  console.log(`Verificando ${shelters.length} abrigos...\n`);

  let totalBairroWP = 0;
  let totalBairroMigrado = 0;
  let totalCepWP = 0;
  let totalCepMigrado = 0;
  let totalWebsiteWP = 0;
  let totalWebsiteMigrado = 0;
  let totalCnpjWP = 0;
  let totalCnpjMigrado = 0;

  for (const shelter of shelters) {
    const { data: metas } = await supabase
      .from('wp_postmeta_raw')
      .select('meta_key, meta_value')
      .eq('post_id', shelter.wp_post_id);

    const metaObj = {};
    metas?.forEach(m => {
      metaObj[m.meta_key] = m.meta_value;
    });

    // Contar
    if (metaObj.bairro && metaObj.bairro !== 'null') totalBairroWP++;
    if (shelter.district) totalBairroMigrado++;

    if (metaObj.cep && metaObj.cep !== 'null') totalCepWP++;
    if (shelter.cep) totalCepMigrado++;

    if (metaObj.website && metaObj.website !== 'null') totalWebsiteWP++;
    if (shelter.website) totalWebsiteMigrado++;

    if (metaObj.cnpj && metaObj.cnpj !== 'null') totalCnpjWP++;
    if (shelter.cnpj) totalCnpjMigrado++;

    // Mostrar exemplos de discrepância
    if ((metaObj.bairro && metaObj.bairro !== 'null' && !shelter.district) ||
        (metaObj.cep && metaObj.cep !== 'null' && !shelter.cep) ||
        (metaObj.website && metaObj.website !== 'null' && !shelter.website) ||
        (metaObj.cnpj && metaObj.cnpj !== 'null' && !shelter.cnpj)) {

      console.log(`\n📍 ${shelter.name} (wp_post_id: ${shelter.wp_post_id})`);

      if (metaObj.bairro && metaObj.bairro !== 'null' && !shelter.district) {
        console.log(`  ⚠️  BAIRRO faltando - WP tem: "${metaObj.bairro}" | Migrado tem: ${shelter.district}`);
      }

      if (metaObj.cep && metaObj.cep !== 'null' && !shelter.cep) {
        console.log(`  ⚠️  CEP faltando - WP tem: "${metaObj.cep}" | Migrado tem: ${shelter.cep}`);
      }

      if (metaObj.website && metaObj.website !== 'null' && !shelter.website) {
        console.log(`  ⚠️  WEBSITE faltando - WP tem: "${metaObj.website}" | Migrado tem: ${shelter.website}`);
      }

      if (metaObj.cnpj && metaObj.cnpj !== 'null' && !shelter.cnpj) {
        console.log(`  ⚠️  CNPJ faltando - WP tem: "${metaObj.cnpj}" | Migrado tem: ${shelter.cnpj}`);
      }

      // Mostrar TODOS os meta_keys disponíveis
      console.log(`  Todos meta_keys:`, Object.keys(metaObj).filter(k => !k.startsWith('_')).join(', '));
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('RESUMO:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Bairro   - WP: ${totalBairroWP} | Migrado: ${totalBairroMigrado} | Perdidos: ${totalBairroWP - totalBairroMigrado}`);
  console.log(`CEP      - WP: ${totalCepWP} | Migrado: ${totalCepMigrado} | Perdidos: ${totalCepWP - totalCepMigrado}`);
  console.log(`Website  - WP: ${totalWebsiteWP} | Migrado: ${totalWebsiteMigrado} | Perdidos: ${totalWebsiteWP - totalWebsiteMigrado}`);
  console.log(`CNPJ     - WP: ${totalCnpjWP} | Migrado: ${totalCnpjMigrado} | Perdidos: ${totalCnpjWP - totalCnpjMigrado}`);
  console.log('═══════════════════════════════════════════════════════════\n');
})();
