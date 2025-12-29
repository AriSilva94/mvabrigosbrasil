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

(async () => {
  console.log('Debugando auto-link para wp_user_id 727...\n');

  // Simulando o que linkShelterToProfileByWpUserId faz
  const wpUserId = 727;

  console.log('1️⃣ Buscando wp_posts_raw com post_type=abrigo e post_author=727...\n');

  const { data: wpPost, error: wpPostError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title, post_author')
    .eq('post_type', 'abrigo')
    .eq('post_author', wpUserId)
    .limit(1)
    .maybeSingle();

  if (wpPostError) {
    console.log('❌ Erro ao buscar wp_posts_raw:', wpPostError);
    return;
  }

  if (!wpPost) {
    console.log('❌ Nenhum post encontrado!');
    console.log('   Isso explica por que o auto-link não funcionou.\n');

    // Verificar se existe com outro author
    const { data: allPosts } = await supabase
      .from('wp_posts_raw')
      .select('id, post_title, post_author')
      .eq('post_type', 'abrigo')
      .eq('id', 2151);

    if (allPosts && allPosts.length > 0) {
      console.log('   Mas encontrei o post 2151:');
      console.log(`   - post_title: ${allPosts[0].post_title}`);
      console.log(`   - post_author: ${allPosts[0].post_author}`);
      console.log(`\n   ❌ PROBLEMA: post_author (${allPosts[0].post_author}) != wp_user_id (${wpUserId})`);
    }

    return;
  }

  console.log('✅ Post encontrado:');
  console.log(`   ID: ${wpPost.id}`);
  console.log(`   Título: ${wpPost.post_title}`);
  console.log(`   Autor: ${wpPost.post_author}`);

  console.log('\n2️⃣ Tentando atualizar shelter com profile_id...\n');

  const profileId = '50175cf4-b434-4331-aacb-43e2e50d09b6';

  const { error: updateError, data: updated } = await supabase
    .from('shelters')
    .update({ profile_id: profileId })
    .eq('wp_post_id', wpPost.id)
    .is('profile_id', null)
    .select();

  if (updateError) {
    console.log('❌ Erro ao atualizar:', updateError);
    return;
  }

  console.log(`✅ Shelter atualizado! Linhas afetadas: ${updated?.length || 0}`);
  if (updated && updated.length > 0) {
    console.log(`   Shelter ID: ${updated[0].id}`);
    console.log(`   Nome: ${updated[0].name}`);
  }
})();
