/**
 * Script de Setup: Login de Teste para um email específico
 *
 * Uso:
 *   node setup-test-login-by-email.js EMAIL
 *
 * Exemplo:
 *   node setup-test-login-by-email.js analays.souza@gmail.com
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

  // Buscar post do voluntário
  const { data: wpPost } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'voluntario')
    .eq('post_author', wpUser.id)
    .maybeSingle();

  if (!wpPost) {
    console.error('⚠️  Usuário encontrado, mas não possui post de voluntário cadastrado\n');
    console.error('   Configurando senha mesmo assim para permitir login...\n');
  }

  // Buscar dados do voluntário (se existir)
  let volunteer = null;
  if (wpPost) {
    const { data: vol } = await supabase
      .from('volunteers')
      .select('wp_post_id, name, telefone, cidade, estado, profissao, escolaridade, faixa_etaria, genero, experiencia, atuacao, disponibilidade, periodo, descricao, comentarios')
      .eq('wp_post_id', wpPost.id)
      .single();

    volunteer = vol;
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

  if (volunteer) {
    console.log('📋 DADOS DO VOLUNTÁRIO (esperados no perfil após login):\n');
    console.log(`   Nome:            ${volunteer.name || '(não informado)'}`);
    console.log(`   Telefone:        ${volunteer.telefone || '(não informado)'}`);
    console.log(`   Profissão:       ${volunteer.profissao || '(não informado)'}`);
    console.log(`   Faixa Etária:    ${volunteer.faixa_etaria || '(não informado)'}`);
    console.log(`   Gênero:          ${volunteer.genero || '(não informado)'}`);
    console.log(`   Escolaridade:    ${volunteer.escolaridade || '(não informado)'}`);
    console.log(`   Estado:          ${volunteer.estado || '(não informado)'}`);
    console.log(`   Cidade:          ${volunteer.cidade || '(não informado)'}`);
    console.log(`   Disponibilidade: ${volunteer.disponibilidade || '(não informado)'}`);
    console.log(`   Período:         ${volunteer.periodo || '(não informado)'}`);
    console.log(`   Experiência:     ${volunteer.experiencia || '(não informado)'}`);
    console.log(`   Atuação:         ${volunteer.atuacao || '(não informado)'}`);
    console.log(`   Descrição:       ${volunteer.descricao ? volunteer.descricao.substring(0, 50) + '...' : '(não informado)'}`);
    console.log(`   Comentários:     ${volunteer.comentarios || '(não informado)'}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } else {
    console.log('⚠️  Este usuário não possui cadastro de voluntário migrado\n');
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

  if (volunteer) {
    console.log('📌 Após o login, verifique se:');
    console.log('   1. O perfil mostra os dados acima');
    console.log('   2. O owner_profile_id foi vinculado automaticamente');
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
  console.error('  node setup-test-login-by-email.js analays.souza@gmail.com\n');
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
