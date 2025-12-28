/**
 * Script para verificar dados de um usuário específico
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

async function checkUser() {
  const email = 'analays.souza@gmail.com';

  console.log(`\n🔍 Verificando dados de ${email}...\n`);

  // 1. Buscar usuário WordPress
  const { data: wpUser } = await supabase
    .from('wp_users_legacy')
    .select('id, user_email')
    .ilike('user_email', email)
    .single();

  if (!wpUser) {
    console.error('❌ Usuário não encontrado em wp_users_legacy');
    process.exit(1);
  }

  console.log(`✅ Usuário WordPress encontrado: ID ${wpUser.id}\n`);

  // 2. Buscar post do voluntário
  const { data: wpPost } = await supabase
    .from('wp_posts_raw')
    .select('id')
    .eq('post_type', 'voluntario')
    .eq('post_author', wpUser.id)
    .single();

  if (!wpPost) {
    console.error('❌ Post do voluntário não encontrado');
    process.exit(1);
  }

  console.log(`✅ Post encontrado: wp_post_id ${wpPost.id}\n`);

  // 3. Buscar TODOS os metadados
  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key, meta_value')
    .eq('post_id', wpPost.id)
    .order('meta_key');

  console.log('📋 TODOS os metadados no WordPress:\n');
  metas?.forEach(meta => {
    console.log(`   ${meta.meta_key}: ${meta.meta_value || '(vazio)'}`);
  });

  // 4. Buscar voluntário migrado
  const { data: volunteer } = await supabase
    .from('volunteers')
    .select('*')
    .eq('wp_post_id', wpPost.id)
    .single();

  console.log('\n📊 TODOS os dados migrados na tabela volunteers:\n');
  if (volunteer) {
    Object.entries(volunteer).forEach(([key, value]) => {
      const displayValue = value === null ? '(NULL)' : (typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value);
      console.log(`   ${key}: ${displayValue}`);
    });
  } else {
    console.log('   ❌ Voluntário não encontrado na tabela volunteers');
  }

  console.log('\n');
  process.exit(0);
}

checkUser();
