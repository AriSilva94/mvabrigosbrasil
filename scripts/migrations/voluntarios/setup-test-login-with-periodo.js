/**
 * Script de Setup: Login de Teste para voluntário COM periodo e atuacao
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

const TEST_PASSWORD = 'TESTE_VOLUNTARIO_2025';

async function setupTestLogin() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Setup - Teste com PERIODO e ATUACAO                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('🔍 Buscando voluntários que TÊM periodo e atuacao...\n');

  // Buscar voluntários COM periodo e atuacao preenchidos
  const { data: volunteers } = await supabase
    .from('volunteers')
    .select('wp_post_id, name, telefone, cidade, estado, profissao, escolaridade, faixa_etaria, genero, experiencia, atuacao, disponibilidade, periodo, descricao, comentarios')
    .not('wp_post_id', 'is', null)
    .not('periodo', 'is', null)
    .not('atuacao', 'is', null)
    .limit(20);

  if (!volunteers || volunteers.length === 0) {
    console.error('❌ Nenhum voluntário encontrado com periodo e atuacao');
    process.exit(1);
  }

  console.log(`📊 Encontrados ${volunteers.length} voluntários com periodo e atuacao, selecionando aleatório...\n`);

  // Selecionar aleatoriamente
  const randomIndex = Math.floor(Math.random() * volunteers.length);
  const selected = volunteers[randomIndex];

  // Buscar usuário WordPress
  const { data: wpPost } = await supabase
    .from('wp_posts_raw')
    .select('post_author')
    .eq('id', selected.wp_post_id)
    .single();

  const { data: wpUser } = await supabase
    .from('wp_users_legacy')
    .select('id, user_login, user_email')
    .eq('id', wpPost.post_author)
    .single();

  if (!wpUser) {
    console.error('❌ Usuário WordPress não encontrado');
    process.exit(1);
  }

  console.log(`✅ Usuário selecionado: ${wpUser.user_email}\n`);
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
  console.log('📋 DADOS DO VOLUNTÁRIO (esperados no perfil após login):\n');
  console.log(`   Nome:            ${selected.name}`);
  console.log(`   Telefone:        ${selected.telefone || '(não informado)'}`);
  console.log(`   Profissão:       ${selected.profissao || '(não informado)'}`);
  console.log(`   Faixa Etária:    ${selected.faixa_etaria || '(não informado)'}`);
  console.log(`   Gênero:          ${selected.genero || '(não informado)'}`);
  console.log(`   Escolaridade:    ${selected.escolaridade || '(não informado)'}`);
  console.log(`   Estado:          ${selected.estado || '(não informado)'}`);
  console.log(`   Cidade:          ${selected.cidade || '(não informado)'}`);
  console.log(`   Disponibilidade: ${selected.disponibilidade || '(não informado)'}`);
  console.log(`   Período:         ${selected.periodo || '(não informado)'}`);
  console.log(`   Experiência:     ${selected.experiencia || '(não informado)'}`);
  console.log(`   Atuação:         ${selected.atuacao || '(não informado)'}`);
  console.log(`   Descrição:       ${selected.descricao ? selected.descricao.substring(0, 50) + '...' : '(não informado)'}`);
  console.log(`   Comentários:     ${selected.comentarios || '(não informado)'}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 DETALHES TÉCNICOS:\n');
  console.log(`   wp_post_id:      ${selected.wp_post_id}`);
  console.log(`   wp_user_id:      ${wpUser.id}`);
  console.log(`   user_login:      ${wpUser.user_login}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Pronto! Você pode fazer login no site agora.\n');
  console.log('📌 Após o login, verifique se:');
  console.log('   1. O perfil mostra TODOS os dados acima (inclusive periodo e atuacao)');
  console.log('   2. O owner_profile_id foi vinculado automaticamente');
  console.log('   3. Os dados persistem após logout/login\n');

  process.exit(0);
}

setupTestLogin();
