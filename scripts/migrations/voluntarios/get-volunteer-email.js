/**
 * Script para buscar o email de um voluntário através do wp_post_id
 *
 * Uso: node get-volunteer-email.js <wp_post_id>
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

async function getVolunteerEmail() {
  const wpPostId = process.argv[2];

  if (!wpPostId) {
    console.error('\n❌ Erro: wp_post_id não fornecido');
    console.error('Uso: node get-volunteer-email.js <wp_post_id>\n');
    process.exit(1);
  }

  console.log(`\n🔍 Buscando email do voluntário (wp_post_id: ${wpPostId})...\n`);

  // 1. Buscar o post_author do wp_posts_raw
  const { data: post, error: postError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title, post_author')
    .eq('id', wpPostId)
    .eq('post_type', 'voluntario')
    .single();

  if (postError || !post) {
    console.error('❌ Voluntário não encontrado no wp_posts_raw');
    console.error('Erro:', postError);
    process.exit(1);
  }

  console.log(`✅ Voluntário encontrado: ${post.post_title}`);
  console.log(`   post_author (user_id): ${post.post_author}\n`);

  // 2. Buscar o email no wp_users_legacy
  const { data: user, error: userError } = await supabase
    .from('wp_users_legacy')
    .select('id, user_login, user_email, display_name')
    .eq('id', post.post_author)
    .single();

  if (userError || !user) {
    console.error('❌ Usuário não encontrado no wp_users_legacy');
    console.error('Erro:', userError);
    console.log('\n⚠️  Possíveis motivos:');
    console.log('   - O post_author não corresponde a um usuário');
    console.log('   - O usuário não foi importado para wp_users_legacy\n');
    process.exit(1);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ USUÁRIO DO WORDPRESS ENCONTRADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`ID: ${user.id}`);
  console.log(`Login: ${user.user_login}`);
  console.log(`Email: ${user.user_email}`);
  console.log(`Nome: ${user.display_name || '(não informado)'}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 SCRIPT SQL PARA ALTERAR SENHA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Execute no SQL Editor do Supabase:\n');
  console.log('```sql');
  console.log(`UPDATE wp_users_legacy`);
  console.log(`SET user_pass = MD5('SENHA_TESTE_123')`);
  console.log(`WHERE id = ${user.id}`);
  console.log(`LIMIT 1;`);
  console.log('```\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 CREDENCIAIS PARA LOGIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Email: ${user.user_email}`);
  console.log(`Senha: SENHA_TESTE_123`);
  console.log(`\n⚠️  Lembre-se de executar o SQL acima primeiro!\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 DADOS DO VOLUNTÁRIO (ESPERADO NO PERFIL)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Buscar dados completos do voluntário
  const { data: volunteer } = await supabase
    .from('volunteers')
    .select('*')
    .eq('wp_post_id', wpPostId)
    .single();

  if (volunteer) {
    console.log(`Nome: ${volunteer.name}`);
    console.log(`Cidade: ${volunteer.cidade || '(não informado)'}`);
    console.log(`Estado: ${volunteer.estado || '(não informado)'}`);
    console.log(`Telefone: ${volunteer.telefone || '(não informado)'}`);
    console.log(`Profissão: ${volunteer.profissao || '(não informado)'}`);
    console.log(`Escolaridade: ${volunteer.escolaridade || '(não informado)'}`);
    console.log(`Gênero: ${volunteer.genero || '(não informado)'}`);
    console.log(`Disponibilidade: ${volunteer.disponibilidade || '(não informado)'}`);
  }

  console.log('\n✅ Processo completo!\n');
  process.exit(0);
}

getVolunteerEmail();
