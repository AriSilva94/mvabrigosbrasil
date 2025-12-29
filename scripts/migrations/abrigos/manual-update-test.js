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
  console.log('Tentando atualizar manualmente o abrigo 685...\n');

  const { data, error } = await supabase
    .from('shelters')
    .update({
      authorized_name: 'Raquel Ferreira Viana',
      authorized_email: 'raquelferreiraviana@gmail.com',
      authorized_phone: '91984306006',
      authorized_role: 'Gestor',
      species: 'caes e gatos'
    })
    .eq('wp_post_id', 685)
    .select();

  if (error) {
    console.error('ERRO:', error);
  } else {
    console.log('SUCESSO! Dados atualizados:');
    console.log(JSON.stringify(data, null, 2));
  }
})();
