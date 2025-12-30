/**
 * Script completo para configurar um login de teste
 *
 * Este script:
 * 1. Encontra um abrigo migrado com dados completos
 * 2. Busca o email do usuário WordPress correspondente
 * 3. Altera a senha no banco legado
 * 4. Exibe as credenciais para teste
 *
 * Uso: node setup-test-login.js [senha_opcional]
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

const TEST_PASSWORD = process.argv[2] || 'TESTE_SENHA_2025';

async function setupTestLogin() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Setup de Login de Teste - Abrigo Migrado                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Buscar abrigos com dados completos
  console.log('🔍 Buscando abrigos migrados com usuário WordPress...\n');

  const { data: shelters, error: shelterError } = await supabase
    .from('shelters')
    .select('*')
    .not('wp_post_id', 'is', null)
    .not('city', 'is', null)
    .not('state', 'is', null)
    .eq('active', true)
    .limit(20);

  if (shelterError || !shelters || shelters.length === 0) {
    console.error('❌ Nenhum abrigo encontrado com dados completos');
    process.exit(1);
  }

  // 2. Para cada abrigo, tentar encontrar usuário WordPress
  const validCandidates = [];

  for (const s of shelters) {
    // Buscar post_author
    const { data: p, error: postError } = await supabase
      .from('wp_posts_raw')
      .select('post_author')
      .eq('id', s.wp_post_id)
      .single();

    if (postError || !p || !p.post_author) continue;

    // Buscar usuário WordPress
    const { data: u, error: userError } = await supabase
      .from('wp_users_legacy')
      .select('id, user_login, user_email, display_name')
      .eq('id', p.post_author)
      .single();

    if (!userError && u && u.user_email) {
      validCandidates.push({ shelter: s, wpUser: u, post: p });
    }
  }

  if (validCandidates.length === 0) {
    console.error('❌ Nenhum abrigo encontrado com usuário WordPress válido');
    console.error('   Abrigos migrados podem não ter post_author ou email');
    process.exit(1);
  }

  // Selecionar aleatoriamente um candidato
  const randomIndex = Math.floor(Math.random() * validCandidates.length);
  const selected = validCandidates[randomIndex];
  const shelter = selected.shelter;
  const wpUser = selected.wpUser;

  console.log(`📊 Encontrados ${validCandidates.length} abrigos válidos, selecionando um aleatório...\n`);

  console.log(`✅ Usuário WordPress encontrado: ${wpUser.user_email}\n`);

  // 4. Alterar senha
  console.log('🔐 Alterando senha no banco legado...\n');

  const { error: updateError } = await supabase
    .from('wp_users_legacy')
    .update({ user_pass: require('crypto').createHash('md5').update(TEST_PASSWORD).digest('hex') })
    .eq('id', wpUser.id);

  if (updateError) {
    console.error('❌ Erro ao alterar senha:', updateError);
    process.exit(1);
  }

  console.log('✅ Senha alterada com sucesso!\n');

  // 5. Exibir resultado
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  LOGIN DE TESTE CONFIGURADO                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('🔐 CREDENCIAIS PARA LOGIN:\n');
  console.log(`   Email:    ${wpUser.user_email}`);
  console.log(`   Senha:    ${TEST_PASSWORD}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📋 DADOS DO ABRIGO (esperados no perfil após login):\n');
  console.log(`   Nome:              ${shelter.name}`);
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

  console.log('📝 DETALHES TÉCNICOS:\n');
  console.log(`   wp_post_id:      ${shelter.wp_post_id}`);
  console.log(`   wp_user_id:      ${wpUser.id}`);
  console.log(`   user_login:      ${wpUser.user_login}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Pronto! Você pode fazer login no site agora.\n');
  console.log('📌 Após o login, verifique se:');
  console.log('   1. O perfil mostra os dados acima');
  console.log('   2. O profile_id foi vinculado automaticamente');
  console.log('   3. Os dados persistem após logout/login\n');

  process.exit(0);
}

setupTestLogin();
