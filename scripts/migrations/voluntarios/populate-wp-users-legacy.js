/**
 * Script para popular wp_users_legacy a partir de wp_users_raw
 *
 * Este script copia apenas os usuários que são autores de voluntários
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

async function populateWpUsersLegacy() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Popular wp_users_legacy de voluntários                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Buscar todos os post_author de voluntários
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('post_author')
    .eq('post_type', 'voluntario');

  const authorIds = [...new Set(posts.map(p => p.post_author).filter(id => id && id !== '0'))];

  console.log(`📊 Total de autores únicos: ${authorIds.length}\n`);

  // 2. Buscar esses usuários no wp_users_raw
  const { data: users, error } = await supabase
    .from('wp_users_raw')
    .select('id, user_login, user_pass, user_email, display_name')
    .in('id', authorIds);

  if (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    process.exit(1);
  }

  console.log(`✅ Usuários encontrados no wp_users_raw: ${users.length}\n`);

  if (users.length === 0) {
    console.log('⚠️  Nenhum usuário para migrar');
    process.exit(0);
  }

  // 3. Inserir em wp_users_legacy (upsert)
  console.log('📝 Inserindo usuários em wp_users_legacy...\n');

  const usersForInsert = users.map(u => ({
    id: u.id,
    user_login: u.user_login,
    user_email: u.user_email,
    user_pass: u.user_pass,
    display_name: u.display_name || u.user_login,
    migrated: false,
    migrated_at: null,
    created_at: new Date().toISOString(),
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('wp_users_legacy')
    .upsert(usersForInsert, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

  if (insertError) {
    console.error('❌ Erro ao inserir usuários:', insertError);
    process.exit(1);
  }

  console.log(`✅ ${users.length} usuários inseridos/atualizados com sucesso!\n`);

  // 4. Mostrar amostra
  console.log('📋 Amostra de usuários migrados:\n');
  users.slice(0, 5).forEach(u => {
    console.log(`   ID: ${u.id} | Email: ${u.user_email} | Login: ${u.user_login}`);
  });

  console.log('\n✅ Processo concluído!\n');
  console.log('📌 Próximo passo: Execute o script setup-test-login.js novamente\n');

  process.exit(0);
}

populateWpUsersLegacy();
