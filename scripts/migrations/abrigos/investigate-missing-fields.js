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
  console.log('Investigando campos faltantes...\n');

  // Buscar o abrigo "4 Patas Fortaleza" que está na imagem
  const { data: shelters } = await supabase
    .from('shelters')
    .select('*')
    .ilike('name', '%4 patas%')
    .or('name.ilike.%fortaleza%');

  console.log('Abrigos encontrados:', shelters?.length);

  if (!shelters || shelters.length === 0) {
    // Buscar pelo website
    const { data: byWebsite } = await supabase
      .from('shelters')
      .select('*')
      .ilike('website', '%4patasfortaleza%');

    if (byWebsite && byWebsite.length > 0) {
      console.log('\nEncontrado pelo website:');
      console.log(JSON.stringify(byWebsite[0], null, 2));

      // Buscar metadados do WordPress
      const wpPostId = byWebsite[0].wp_post_id;
      if (wpPostId) {
        console.log(`\n\nBuscando metadados do WordPress (wp_post_id: ${wpPostId}):\n`);

        const { data: metas } = await supabase
          .from('wp_postmeta_raw')
          .select('meta_key, meta_value')
          .eq('post_id', wpPostId);

        console.log('TODOS os metadados deste post:');
        metas?.filter(m => !m.meta_key.startsWith('_')).forEach(m => {
          console.log(`  ${m.meta_key}: ${m.meta_value}`);
        });

        // Buscar o post
        const { data: post } = await supabase
          .from('wp_posts_raw')
          .select('*')
          .eq('id', wpPostId)
          .single();

        console.log('\n\nDados do post:');
        console.log(`  post_title: ${post?.post_title}`);
        console.log(`  post_content: ${post?.post_content?.substring(0, 200)}...`);
        console.log(`  post_author: ${post?.post_author}`);
      }
    }
  } else {
    console.log('\nPrimeiro resultado:');
    console.log(JSON.stringify(shelters[0], null, 2));
  }
})();
