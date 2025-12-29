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
  console.log('Buscando abrigos SOMENTE com população inicial de gatos...\n');

  // Buscar abrigos onde initial_cats > 0 E initial_dogs = 0
  const { data: catsOnly } = await supabase
    .from('shelters')
    .select('wp_post_id, name, initial_dogs, initial_cats, species')
    .eq('initial_dogs', 0)
    .gt('initial_cats', 0)
    .order('initial_cats', { ascending: false });

  console.log(`✅ Abrigos SOMENTE com gatos: ${catsOnly?.length || 0}\n`);

  if (catsOnly && catsOnly.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    catsOnly.forEach((shelter, index) => {
      console.log(`\n${index + 1}. ${shelter.name} (ID: ${shelter.wp_post_id})`);
      console.log(`   Cães: ${shelter.initial_dogs} | Gatos: ${shelter.initial_cats}`);
      console.log(`   Espécie: ${shelter.species}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════');
  }

  // Estatísticas gerais
  console.log('\n\nESTATÍSTICAS DE POPULAÇÃO:\n');

  const { count: totalShelters } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true });

  const { count: onlyDogs } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .gt('initial_dogs', 0)
    .eq('initial_cats', 0);

  const { count: onlyCats } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .eq('initial_dogs', 0)
    .gt('initial_cats', 0);

  const { count: both } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .gt('initial_dogs', 0)
    .gt('initial_cats', 0);

  const { count: none } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .eq('initial_dogs', 0)
    .eq('initial_cats', 0);

  console.log(`Total de abrigos: ${totalShelters}`);
  console.log(`  Apenas cães: ${onlyDogs} (${((onlyDogs / totalShelters) * 100).toFixed(1)}%)`);
  console.log(`  Apenas gatos: ${onlyCats} (${((onlyCats / totalShelters) * 100).toFixed(1)}%)`);
  console.log(`  Cães e gatos: ${both} (${((both / totalShelters) * 100).toFixed(1)}%)`);
  console.log(`  Nenhum (0/0): ${none} (${((none / totalShelters) * 100).toFixed(1)}%)`);
})();
