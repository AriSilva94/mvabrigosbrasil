/**
 * Script para vincular voluntários migrados a perfis já criados
 *
 * Este script é necessário para usuários que fizeram login ANTES da implementação
 * da funcionalidade de auto-link do voluntário ao profile.
 *
 * O que faz:
 * 1. Busca todos os profiles criados via migração (origin = 'wordpress_migrated')
 * 2. Para cada profile, verifica se existe um volunteer com wp_user_id correspondente
 * 3. Atualiza o volunteer.owner_profile_id se ainda estiver NULL
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

async function linkExistingVolunteers() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Vincular voluntários migrados a perfis existentes        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Buscar todos os profiles migrados do WordPress
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, wp_user_id, email')
    .eq('origin', 'wordpress_migrated')
    .not('wp_user_id', 'is', null);

  if (profilesError) {
    console.error('❌ Erro ao buscar profiles:', profilesError);
    process.exit(1);
  }

  console.log(`📊 Encontrados ${profiles.length} profiles migrados do WordPress\n`);

  let linkedCount = 0;
  let notFoundCount = 0;
  let alreadyLinkedCount = 0;
  let errorCount = 0;

  for (const profile of profiles) {
    // 2. Buscar o post do WordPress deste autor
    const { data: wpPost, error: wpPostError } = await supabase
      .from('wp_posts_raw')
      .select('id')
      .eq('post_type', 'voluntario')
      .eq('post_author', profile.wp_user_id)
      .limit(1)
      .maybeSingle();

    if (wpPostError) {
      console.error(`❌ Erro ao buscar post do wp_user_id ${profile.wp_user_id}:`, wpPostError);
      errorCount++;
      continue;
    }

    if (!wpPost) {
      // Este usuário não é autor de um volunteer - OK
      notFoundCount++;
      continue;
    }

    // 3. Verificar se o volunteer já está vinculado
    const { data: volunteer, error: volunteerError } = await supabase
      .from('volunteers')
      .select('id, owner_profile_id')
      .eq('wp_post_id', wpPost.id)
      .maybeSingle();

    if (volunteerError) {
      console.error(`❌ Erro ao buscar volunteer (wp_post_id: ${wpPost.id}):`, volunteerError);
      errorCount++;
      continue;
    }

    if (!volunteer) {
      console.log(`⚠️  Volunteer não encontrado para wp_post_id ${wpPost.id} (wp_user_id: ${profile.wp_user_id})`);
      notFoundCount++;
      continue;
    }

    if (volunteer.owner_profile_id) {
      console.log(`ℹ️  Volunteer já vinculado: wp_post_id ${wpPost.id} -> profile ${volunteer.owner_profile_id}`);
      alreadyLinkedCount++;
      continue;
    }

    // 4. Vincular o volunteer ao profile
    const { error: updateError } = await supabase
      .from('volunteers')
      .update({ owner_profile_id: profile.id })
      .eq('id', volunteer.id);

    if (updateError) {
      console.error(`❌ Erro ao vincular volunteer ${volunteer.id}:`, updateError);
      errorCount++;
      continue;
    }

    console.log(`✅ Vinculado: wp_post_id ${wpPost.id} -> profile ${profile.id} (${profile.email})`);
    linkedCount++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMO:\n');
  console.log(`   Profiles processados:     ${profiles.length}`);
  console.log(`   Voluntários vinculados:   ${linkedCount} ✅`);
  console.log(`   Já vinculados:            ${alreadyLinkedCount}`);
  console.log(`   Sem volunteer:            ${notFoundCount}`);
  console.log(`   Erros:                    ${errorCount}${errorCount > 0 ? ' ⚠️' : ''}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (linkedCount > 0) {
    console.log('✅ Volunteers vinculados com sucesso!');
    console.log('💡 Agora os usuários podem acessar /meu-cadastro e ver seus dados.\n');
  } else {
    console.log('ℹ️  Nenhum volunteer foi vinculado (todos já estavam vinculados ou não existiam).\n');
  }

  process.exit(0);
}

linkExistingVolunteers();
