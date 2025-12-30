/**
 * Script de Setup: Login de Teste para um email específico
 *
 * Uso:
 *   node setup-test-login-by-email.js EMAIL
 *
 * Exemplo:
 *   node setup-test-login-by-email.js abrigo@exemplo.com
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
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

const TEST_PASSWORD = 'TESTE_SENHA_2025';

async function setupTestLoginByEmail(email) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Setup de Login de Teste - Email Específico              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`🔍 Buscando usuário: ${email}\n`);

  // Buscar usuário WordPress
  const { data: wpUser, error: wpUserError } = await supabase
    .from('wp_users_legacy')
    .select('id, user_login, user_email')
    .ilike('user_email', email)
    .single();

  if (wpUserError || !wpUser) {
    console.error(`❌ Usuário não encontrado: ${email}`);
    console.error('   Verifique se o email está correto e existe em wp_users_legacy\n');
    process.exit(1);
  }

  console.log(`✅ Usuário WordPress encontrado: ${wpUser.user_email}\n`);

  // Buscar post do abrigo
  const { data: wpPost } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'abrigo')
    .eq('post_author', wpUser.id)
    .maybeSingle();

  if (!wpPost) {
    console.error('⚠️  Usuário encontrado, mas não possui post de abrigo cadastrado\n');
    console.error('   Configurando senha mesmo assim para permitir login...\n');
  }

  // Buscar dados do abrigo (se existir)
  let shelter = null;
  if (wpPost) {
    const { data: sh } = await supabase
      .from('shelters')
      .select('*')
      .eq('wp_post_id', wpPost.id)
      .single();

    shelter = sh;
  }

  console.log('🔐 Alterando senha no banco legado...\n');

  // Gerar hash MD5 da senha de teste
  const md5Hash = crypto.createHash('md5').update(TEST_PASSWORD).digest('hex');

  const { error } = await supabase
    .from('wp_users_legacy')
    .update({ user_pass: md5Hash })
    .eq('id', wpUser.id);

  if (error) {
    console.error('❌ Erro ao alterar senha:', error);
    process.exit(1);
  }

  console.log('✅ Senha alterada com sucesso!\n');

  // Exibir informações
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  LOGIN DE TESTE CONFIGURADO                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('🔐 CREDENCIAIS PARA LOGIN:\n');
  console.log(`   Email:    ${wpUser.user_email}`);
  console.log(`   Senha:    ${TEST_PASSWORD}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (shelter) {
    console.log('📋 DADOS DO ABRIGO (esperados no perfil após login):\n');
    console.log(`   Nome:              ${shelter.name || '(não informado)'}`);
    console.log(`   Tipo:              ${shelter.shelter_type || '(não informado)'}`);
    console.log(`   CNPJ:              ${shelter.cnpj || '(não informado)'}`);
    console.log(`   CPF:               ${shelter.cpf || '(não informado)'}`);
    console.log(`   Fundação:          ${shelter.foundation_date || '(não informado)'}`);
    console.log(`\n   📍 Endereço:`);
    console.log(`   Estado:            ${shelter.state || '(não informado)'}`);
    console.log(`   Cidade:            ${shelter.city || '(não informado)'}`);
    console.log(`   Rua:               ${shelter.street || '(não informado)'}`);
    console.log(`   Número:            ${shelter.number || '(não informado)'}`);
    console.log(`   Bairro:            ${shelter.district || '(não informado)'}`);
    console.log(`   CEP:               ${shelter.cep || '(não informado)'}`);
    console.log(`\n   👤 Responsável:`);
    console.log(`   Nome:              ${shelter.authorized_name || '(não informado)'}`);
    console.log(`   Função:            ${shelter.authorized_role || '(não informado)'}`);
    console.log(`   Email:             ${shelter.authorized_email || '(não informado)'}`);
    console.log(`   Telefone:          ${shelter.authorized_phone || '(não informado)'}`);
    console.log(`\n   🐾 Sobre os Animais:`);
    console.log(`   Espécies:          ${shelter.species || '(não informado)'}`);
    console.log(`   Outras espécies:   ${shelter.additional_species || '(não informado)'}`);
    console.log(`   População cães:    ${shelter.initial_dogs || 0}`);
    console.log(`   População gatos:   ${shelter.initial_cats || 0}`);
    console.log(`   Lares temporários: ${shelter.temporary_agreement ? 'Sim' : 'Não'}`);
    console.log(`\n   🌐 Outros:`);
    console.log(`   Website:           ${shelter.website || '(não informado)'}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } else {
    console.log('⚠️  Este usuário não possui cadastro de abrigo migrado\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  console.log('📝 DETALHES TÉCNICOS:\n');
  console.log(`   wp_user_id:      ${wpUser.id}`);
  console.log(`   user_login:      ${wpUser.user_login}`);
  if (wpPost) {
    console.log(`   wp_post_id:      ${wpPost.id}`);
  }
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Pronto! Você pode fazer login no site agora.\n');

  if (shelter) {
    console.log('📌 Após o login, verifique se:');
    console.log('   1. O perfil mostra os dados acima');
    console.log('   2. O profile_id foi vinculado automaticamente');
    console.log('   3. Os dados persistem após logout/login\n');
  }

  process.exit(0);
}

// Validar argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('\n❌ Erro: Email não fornecido\n');
  console.error('Uso:');
  console.error('  node setup-test-login-by-email.js EMAIL\n');
  console.error('Exemplo:');
  console.error('  node setup-test-login-by-email.js abrigo@exemplo.com\n');
  process.exit(1);
}

const email = args[0];

// Validar formato básico de email
if (!email.includes('@') || !email.includes('.')) {
  console.error('\n❌ Erro: Email inválido\n');
  console.error(`   "${email}" não parece ser um email válido\n`);
  process.exit(1);
}

setupTestLoginByEmail(email);
