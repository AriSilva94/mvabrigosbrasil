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
  console.log('Verificando dados de população do Resgatitos...\n');

  const { data } = await supabase
    .from('shelters')
    .select('name, initial_dogs, initial_cats, temporary_agreement')
    .eq('wp_post_id', 2151)
    .single();

  console.log('✅ Resgatitos (wp_post_id 2151):');
  console.log(`   População inicial de cães: ${data.initial_dogs}`);
  console.log(`   População inicial de gatos: ${data.initial_cats}`);
  console.log(`   Convênio lares temporários: ${data.temporary_agreement}`);

  console.log('\n\nEsperado (do WordPress):');
  console.log('   População inicial de cães: 48');
  console.log('   População inicial de gatos: 0');
  console.log('   Convênio lares temporários: false (Não)');

  const dogsMatch = data.initial_dogs === 48;
  const catsMatch = data.initial_cats === 0;
  // Aceita false, "false", null ou undefined como "não tem convênio"
  const tempMatch = !data.temporary_agreement || data.temporary_agreement === 'false';

  console.log('\n\nResultado:');
  console.log(`   Cães: ${dogsMatch ? '✅ OK' : '❌ ERRO'}`);
  console.log(`   Gatos: ${catsMatch ? '✅ OK' : '❌ ERRO'}`);
  console.log(`   Lares temporários: ${tempMatch ? '✅ OK' : '❌ ERRO'}`);
})();
