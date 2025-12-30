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
  console.log('Verificando vinculação do Resgatitos...\n');

  // Buscar profile pelo email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, wp_user_id')
    .eq('email', 'resgatitosbh@gmail.com')
    .maybeSingle();

  if (!profile) {
    console.log('❌ Profile NÃO encontrado para resgatitosbh@gmail.com');
    return;
  }

  console.log('✅ Profile encontrado:');
  console.log(`   ID: ${profile.id}`);
  console.log(`   Email: ${profile.email}`);
  console.log(`   Nome: ${profile.full_name}`);
  console.log(`   wp_user_id: ${profile.wp_user_id}`);

  // Buscar shelter pelo wp_post_id
  const { data: shelter } = await supabase
    .from('shelters')
    .select('id, wp_post_id, name, profile_id')
    .eq('wp_post_id', 2151)
    .maybeSingle();

  if (!shelter) {
    console.log('\n❌ Shelter NÃO encontrado para wp_post_id 2151');
    return;
  }

  console.log('\n✅ Shelter encontrado:');
  console.log(`   ID: ${shelter.id}`);
  console.log(`   wp_post_id: ${shelter.wp_post_id}`);
  console.log(`   Nome: ${shelter.name}`);
  console.log(`   profile_id: ${shelter.profile_id}`);

  // Verificar se estão linkados
  const isLinked = shelter.profile_id === profile.id;

  console.log('\n═══════════════════════════════════════════════════════════');
  if (isLinked) {
    console.log('✅ VINCULAÇÃO OK!');
    console.log(`   Profile ${profile.id} está linkado ao Shelter ${shelter.id}`);
  } else {
    console.log('❌ VINCULAÇÃO FALTANDO!');
    console.log(`   Profile ID: ${profile.id}`);
    console.log(`   Shelter profile_id: ${shelter.profile_id || 'NULL'}`);
    console.log('\n   O auto-link NÃO funcionou ou ainda não foi executado.');
  }
  console.log('═══════════════════════════════════════════════════════════');
})();
