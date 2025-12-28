/**
 * Script para verificar formato de hash de senha no WordPress
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

async function checkPasswordHash() {
  console.log('\n🔍 Verificando formato de hash de senha...\n');

  // Buscar o usuário de teste
  const { data: user } = await supabase
    .from('wp_users_legacy')
    .select('id, user_login, user_email, user_pass')
    .eq('user_email', 'rosanezim@gmail.com')
    .single();

  if (!user) {
    console.error('❌ Usuário não encontrado');
    process.exit(1);
  }

  console.log(`✅ Usuário encontrado: ${user.user_email}`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Login: ${user.user_login}\n`);

  console.log('📋 Hash da senha atual:');
  console.log(`   ${user.user_pass}\n`);

  // Verificar formato
  const hashPrefix = user.user_pass.substring(0, 4);
  console.log('🔍 Análise do hash:\n');

  if (hashPrefix === '$P$B' || hashPrefix === '$H$B') {
    console.log('   Formato: WordPress PHPass (antigo)');
    console.log('   Prefixo: ' + hashPrefix);
  } else if (hashPrefix === '$2y$' || hashPrefix === '$2a$' || hashPrefix === '$2b$') {
    console.log('   Formato: bcrypt');
  } else if (user.user_pass.length === 32) {
    console.log('   Formato: MD5 simples (32 caracteres)');
  } else if (hashPrefix === '$wp$') {
    console.log('   Formato: WordPress moderno (bcrypt + HMAC)');
  } else {
    console.log('   Formato: Desconhecido');
  }

  console.log(`   Tamanho: ${user.user_pass.length} caracteres\n`);

  // Testar MD5
  const testPassword = 'TESTE_VOLUNTARIO_2025';
  const md5Hash = crypto.createHash('md5').update(testPassword).digest('hex');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTE DE HASH MD5:\n');
  console.log(`   Senha de teste: ${testPassword}`);
  console.log(`   MD5 gerado:     ${md5Hash}`);
  console.log(`   Hash no banco:  ${user.user_pass}`);
  console.log(`   Match:          ${md5Hash === user.user_pass ? '✅ SIM' : '❌ NÃO'}\n`);

  // Buscar usuário no wp_users_raw para comparar
  const { data: rawUser } = await supabase
    .from('wp_users_raw')
    .select('user_pass')
    .eq('id', user.id)
    .single();

  if (rawUser) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 COMPARAÇÃO wp_users_raw vs wp_users_legacy:\n');
    console.log(`   Hash original (raw):    ${rawUser.user_pass.substring(0, 50)}...`);
    console.log(`   Hash atual (legacy):    ${user.user_pass.substring(0, 50)}...`);
    console.log(`   Igual:                  ${rawUser.user_pass === user.user_pass ? '✅ SIM' : '❌ NÃO (foi modificado)'}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 RECOMENDAÇÃO:\n');

  if (hashPrefix === '$P$B' || hashPrefix === '$H$B') {
    console.log('   O hash está no formato PHPass do WordPress.');
    console.log('   MD5 simples NÃO vai funcionar.');
    console.log('   Você precisa usar a biblioteca wordpress-hash-node para validar.\n');
    console.log('   Ou criar um novo usuário diretamente no Supabase Auth para teste.\n');
  } else if (user.user_pass.length === 32 && /^[a-f0-9]+$/.test(user.user_pass)) {
    console.log('   O hash parece ser MD5 simples.');
    console.log('   Verifique se a validação de senha está usando MD5.\n');
  }

  process.exit(0);
}

checkPasswordHash();
