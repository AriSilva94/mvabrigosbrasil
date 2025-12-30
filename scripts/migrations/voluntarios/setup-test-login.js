/**
 * Script completo para configurar um login de teste
 *
 * Este script:
 * 1. Encontra um voluntário migrado com dados completos
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
  console.log('║  Setup de Login de Teste - Voluntário Migrado            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Buscar voluntários com dados completos
  console.log('🔍 Buscando voluntários migrados com usuário WordPress...\n');

  const { data: volunteers, error: volError } = await supabase
    .from('volunteers')
    .select('wp_post_id, name, cidade, estado, telefone, profissao, escolaridade, faixa_etaria, genero, experiencia, atuacao, disponibilidade, periodo, descricao, comentarios')
    .not('wp_post_id', 'is', null)
    .not('cidade', 'is', null)
    .not('estado', 'is', null)
    .eq('is_public', true)
    .limit(20);

  if (volError || !volunteers || volunteers.length === 0) {
    console.error('❌ Nenhum voluntário encontrado com dados completos');
    process.exit(1);
  }

  // 2. Para cada voluntário, tentar encontrar usuário WordPress
  const validCandidates = [];

  for (const v of volunteers) {
    // Buscar post_author
    const { data: p, error: postError } = await supabase
      .from('wp_posts_raw')
      .select('post_author')
      .eq('id', v.wp_post_id)
      .single();

    if (postError || !p || !p.post_author) continue;

    // Buscar usuário WordPress
    const { data: u, error: userError } = await supabase
      .from('wp_users_legacy')
      .select('id, user_login, user_email, display_name')
      .eq('id', p.post_author)
      .single();

    if (!userError && u && u.user_email) {
      validCandidates.push({ volunteer: v, wpUser: u, post: p });
    }
  }

  if (validCandidates.length === 0) {
    console.error('❌ Nenhum voluntário encontrado com usuário WordPress válido');
    console.error('   Voluntários migrados podem não ter post_author ou email');
    process.exit(1);
  }

  // Selecionar aleatoriamente um candidato
  const randomIndex = Math.floor(Math.random() * validCandidates.length);
  const selected = validCandidates[randomIndex];
  const volunteer = selected.volunteer;
  const wpUser = selected.wpUser;

  console.log(`📊 Encontrados ${validCandidates.length} voluntários válidos, selecionando um aleatório...\n`);

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

  console.log('📋 DADOS DO VOLUNTÁRIO (esperados no perfil após login):\n');
  console.log(`   Nome:            ${volunteer.name}`);
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

  console.log('📝 DETALHES TÉCNICOS:\n');
  console.log(`   wp_post_id:      ${volunteer.wp_post_id}`);
  console.log(`   wp_user_id:      ${wpUser.id}`);
  console.log(`   user_login:      ${wpUser.user_login}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Pronto! Você pode fazer login no site agora.\n');
  console.log('📌 Após o login, verifique se:');
  console.log('   1. O perfil mostra os dados acima');
  console.log('   2. O owner_profile_id foi vinculado automaticamente');
  console.log('   3. Os dados persistem após logout/login\n');

  process.exit(0);
}

setupTestLogin();
