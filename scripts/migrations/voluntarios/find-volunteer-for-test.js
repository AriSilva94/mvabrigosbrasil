/**
 * Script para encontrar um voluntário migrado adequado para teste
 *
 * Busca um voluntário que:
 * - Foi migrado (tem wp_post_id)
 * - Tem dados completos (cidade, estado, telefone)
 * - Está ativo (is_public = true)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar .env.local
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

async function findVolunteerForTest() {
  console.log('\n🔍 Buscando voluntário migrado para teste...\n');

  // Buscar voluntários com dados completos
  const { data: volunteers, error } = await supabase
    .from('volunteers')
    .select('wp_post_id, name, cidade, estado, telefone, profissao, is_public')
    .not('wp_post_id', 'is', null)
    .not('cidade', 'is', null)
    .not('estado', 'is', null)
    .not('telefone', 'is', null)
    .eq('is_public', true)
    .limit(5);

  if (error) {
    console.error('❌ Erro ao buscar voluntários:', error);
    process.exit(1);
  }

  if (!volunteers || volunteers.length === 0) {
    console.log('❌ Nenhum voluntário encontrado com dados completos');
    process.exit(1);
  }

  console.log('✅ Voluntários encontrados:\n');
  volunteers.forEach((v, index) => {
    console.log(`${index + 1}. wp_post_id: ${v.wp_post_id}`);
    console.log(`   Nome: ${v.name}`);
    console.log(`   Cidade/Estado: ${v.cidade}/${v.estado}`);
    console.log(`   Telefone: ${v.telefone}`);
    console.log(`   Profissão: ${v.profissao || '(não informado)'}`);
    console.log('');
  });

  // Pegar o primeiro
  const selected = volunteers[0];
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 VOLUNTÁRIO SELECIONADO PARA TESTE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`wp_post_id: ${selected.wp_post_id}`);
  console.log(`Nome: ${selected.name}`);
  console.log(`Cidade/Estado: ${selected.cidade}/${selected.estado}`);
  console.log(`Telefone: ${selected.telefone}\n`);

  console.log('📋 Próximo passo: Execute o script abaixo para buscar o email:\n');
  console.log(`node scripts/migrations/get-volunteer-email.js ${selected.wp_post_id}\n`);

  process.exit(0);
}

findVolunteerForTest();
