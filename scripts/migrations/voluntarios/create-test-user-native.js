/**
 * Script para criar um usuário de teste NATIVO no Supabase
 * e vincular a um voluntário existente
 *
 * Esta é a melhor abordagem para testar o fluxo completo sem
 * depender de senhas antigas do WordPress
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

const TEST_EMAIL = 'teste.voluntario@mvabrigosbrasil.com';
const TEST_PASSWORD = 'TesteVoluntario2025!';

async function createTestUserNative() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Criar Usuário de Teste Nativo (Supabase Auth)           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📝 Este script vai:');
  console.log('   1. Criar um usuário no Supabase Auth');
  console.log('   2. Vincular a um voluntário migrado existente');
  console.log('   3. Configurar o perfil completo\n');

  // 1. Buscar voluntário migrado
  console.log('🔍 Buscando voluntário migrado...\n');

  const { data: volunteer } = await supabase
    .from('volunteers')
    .select('*')
    .not('wp_post_id', 'is', null)
    .not('cidade', 'is', null)
    .not('estado', 'is', null)
    .eq('is_public', true)
    .is('owner_profile_id', null) // Sem vínculo ainda
    .limit(1)
    .single();

  if (!volunteer) {
    console.error('❌ Nenhum voluntário sem vínculo encontrado');
    process.exit(1);
  }

  console.log(`✅ Voluntário encontrado: ${volunteer.name}`);
  console.log(`   wp_post_id: ${volunteer.wp_post_id}\n`);

  // 2. Verificar se o email de teste já existe
  console.log('🔍 Verificando se usuário de teste já existe...\n');

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', TEST_EMAIL)
    .single();

  if (existingProfile) {
    console.log(`⚠️  Usuário de teste já existe: ${existingProfile.email}`);
    console.log(`   profile_id: ${existingProfile.id}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 CREDENCIAIS:\n');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Senha: ${TEST_PASSWORD}\n`);
    console.log('✅ Você pode fazer login com essas credenciais!\n');
    process.exit(0);
  }

  // 3. Criar usuário no Supabase Auth
  console.log('👤 Criando usuário no Supabase Auth...\n');

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (authError) {
    console.error('❌ Erro ao criar usuário:', authError);
    process.exit(1);
  }

  console.log(`✅ Usuário criado no Auth: ${authData.user.id}\n`);

  // 4. Criar perfil
  console.log('📝 Criando perfil...\n');

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: TEST_EMAIL,
      full_name: volunteer.name,
      phone: volunteer.telefone,
      role: 'voluntario',
      origin: 'admin_created',
    });

  if (profileError) {
    console.error('❌ Erro ao criar perfil:', profileError);
    process.exit(1);
  }

  console.log(`✅ Perfil criado com sucesso!\n`);

  // 5. Vincular voluntário ao perfil
  console.log('🔗 Vinculando voluntário ao perfil...\n');

  const { error: linkError } = await supabase
    .from('volunteers')
    .update({ owner_profile_id: authData.user.id })
    .eq('id', volunteer.id);

  if (linkError) {
    console.error('❌ Erro ao vincular voluntário:', linkError);
    process.exit(1);
  }

  console.log(`✅ Voluntário vinculado ao perfil!\n`);

  // 6. Resultado final
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  USUÁRIO DE TESTE CRIADO COM SUCESSO!                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('🔐 CREDENCIAIS DE LOGIN:\n');
  console.log(`   Email:    ${TEST_EMAIL}`);
  console.log(`   Senha:    ${TEST_PASSWORD}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 DADOS DO VOLUNTÁRIO VINCULADO:\n');
  console.log(`   Nome:            ${volunteer.name}`);
  console.log(`   Cidade:          ${volunteer.cidade}`);
  console.log(`   Estado:          ${volunteer.estado}`);
  console.log(`   Telefone:        ${volunteer.telefone}`);
  console.log(`   Profissão:       ${volunteer.profissao || '(não informado)'}`);
  console.log(`   Escolaridade:    ${volunteer.escolaridade || '(não informado)'}`);
  console.log(`   wp_post_id:      ${volunteer.wp_post_id}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Pronto! Faça login no site com as credenciais acima.\n');
  console.log('📌 Após o login, verifique se:');
  console.log('   1. O perfil mostra os dados do voluntário');
  console.log('   2. Todos os campos estão preenchidos corretamente');
  console.log('   3. É possível editar e salvar alterações\n');

  process.exit(0);
}

createTestUserNative();
