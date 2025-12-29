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
  console.log('Verificando exemplos da imagem...\n');

  // IDs das imagens que você enviou
  const testIds = [2878, 2908, 2909, 2910, 2929, 2955, 2980, 2997, 3026, 3049, 3052, 3053, 3055, 3056, 3059];

  for (const wpId of testIds) {
    const { data: shelter } = await supabase
      .from('shelters')
      .select('wp_post_id, name, initial_dogs, initial_cats')
      .eq('wp_post_id', wpId)
      .maybeSingle();

    if (shelter) {
      const dogsOk = shelter.initial_dogs !== null && shelter.initial_dogs !== 0;
      const catsOk = shelter.initial_cats !== null && shelter.initial_cats !== 0;

      console.log(`ID ${wpId} - ${shelter.name}`);
      console.log(`  Cães: ${shelter.initial_dogs} | Gatos: ${shelter.initial_cats}`);

      if (!dogsOk && !catsOk) {
        console.log(`  ⚠️  Ambos zerados ou null`);
      }
    } else {
      console.log(`ID ${wpId} - NÃO ENCONTRADO`);
    }
  }

  // Estatísticas gerais
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('ESTATÍSTICAS GERAIS:');
  console.log('═══════════════════════════════════════════════════════════\n');

  const { count: totalShelters } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true });

  const { count: withDogs } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .gt('initial_dogs', 0);

  const { count: withCats } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .gt('initial_cats', 0);

  const { count: withBoth } = await supabase
    .from('shelters')
    .select('*', { count: 'exact', head: true })
    .gt('initial_dogs', 0)
    .gt('initial_cats', 0);

  console.log(`Total de abrigos: ${totalShelters}`);
  console.log(`Com população de cães > 0: ${withDogs}`);
  console.log(`Com população de gatos > 0: ${withCats}`);
  console.log(`Com ambas populações > 0: ${withBoth}`);
})();
