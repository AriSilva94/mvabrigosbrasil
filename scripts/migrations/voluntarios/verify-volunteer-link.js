/**
 * Script para verificar se o volunteer foi vinculado corretamente
 */

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

async function verifyLink() {
  console.log('\n🔍 Verificando volunteer vinculado...\n');

  const { data: volunteer, error } = await supabase
    .from('volunteers')
    .select('id, wp_post_id, owner_profile_id, name, telefone, cidade, estado, profissao, escolaridade, genero, disponibilidade')
    .eq('wp_post_id', 619)
    .single();

  if (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }

  console.log('✅ Volunteer encontrado:\n');
  console.log(`   ID: ${volunteer.id}`);
  console.log(`   wp_post_id: ${volunteer.wp_post_id}`);
  console.log(`   owner_profile_id: ${volunteer.owner_profile_id}`);
  console.log(`   Nome: ${volunteer.name}`);
  console.log(`   Telefone: ${volunteer.telefone}`);
  console.log(`   Cidade: ${volunteer.cidade}`);
  console.log(`   Estado: ${volunteer.estado}`);
  console.log(`   Profissão: ${volunteer.profissao}`);
  console.log(`   Escolaridade: ${volunteer.escolaridade}`);
  console.log(`   Gênero: ${volunteer.genero}`);
  console.log(`   Disponibilidade: ${volunteer.disponibilidade}\n`);

  if (volunteer.owner_profile_id) {
    console.log('✅ owner_profile_id está definido! O volunteer está vinculado ao profile.\n');
  } else {
    console.log('❌ owner_profile_id ainda está NULL! Algo deu errado.\n');
  }

  process.exit(0);
}

verifyLink();
