/**
 * Investiga por que alguns profiles não foram vinculados aos volunteers
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

async function investigate() {
  console.log('\n🔍 Investigando profiles sem volunteers vinculados...\n');

  // Buscar profiles criados de usuários WordPress
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, wp_user_id, origin, created_at')
    .eq('origin', 'wordpress_migrated');

  console.log(`📊 Total de profiles migrados: ${profiles?.length || 0}\n`);

  if (!profiles || profiles.length === 0) {
    console.log('Nenhum profile migrado encontrado.\n');
    process.exit(0);
  }

  let linked = 0;
  let unlinked = 0;

  for (const profile of profiles) {
    // Verificar se tem volunteer vinculado
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('id, wp_post_id, name, owner_profile_id')
      .eq('owner_profile_id', profile.id)
      .maybeSingle();

    if (volunteer) {
      linked++;
      console.log(`✅ ${profile.email}`);
      console.log(`   Profile ID: ${profile.id}`);
      console.log(`   Volunteer: ${volunteer.name} (wp_post_id: ${volunteer.wp_post_id})`);
      console.log(`   wp_user_id: ${profile.wp_user_id}\n`);
    } else {
      unlinked++;
      console.log(`❌ ${profile.email}`);
      console.log(`   Profile ID: ${profile.id}`);
      console.log(`   wp_user_id: ${profile.wp_user_id}`);
      console.log(`   Created: ${profile.created_at}`);

      // Verificar se existe um post de voluntário para esse wp_user_id
      if (profile.wp_user_id) {
        const { data: wpPost } = await supabase
          .from('wp_posts_raw')
          .select('id, post_type, post_author')
          .eq('post_type', 'voluntario')
          .eq('post_author', profile.wp_user_id)
          .maybeSingle();

        if (wpPost) {
          console.log(`   ⚠️  Post de voluntário EXISTE: wp_post_id ${wpPost.id}`);

          // Verificar se tem volunteer migrado com esse wp_post_id
          const { data: migratedVol } = await supabase
            .from('volunteers')
            .select('id, wp_post_id, name, owner_profile_id')
            .eq('wp_post_id', wpPost.id)
            .maybeSingle();

          if (migratedVol) {
            console.log(`   📦 Volunteer migrado existe: ${migratedVol.name}`);
            if (migratedVol.owner_profile_id) {
              console.log(`   🔗 JÁ VINCULADO a outro profile: ${migratedVol.owner_profile_id}`);
            } else {
              console.log(`   ⏳ Volunteer NÃO VINCULADO (owner_profile_id = NULL)`);
              console.log(`   💡 PRECISA VINCULAR!`);
            }
          } else {
            console.log(`   ❌ Volunteer NÃO foi migrado para a tabela volunteers`);
          }
        } else {
          console.log(`   ℹ️  Sem post de voluntário (pode ser abrigo ou admin)`);

          // Verificar se é abrigo
          const { data: abrigoPost } = await supabase
            .from('wp_posts_raw')
            .select('id, post_type')
            .eq('post_author', profile.wp_user_id)
            .limit(5);

          if (abrigoPost && abrigoPost.length > 0) {
            const types = [...new Set(abrigoPost.map(p => p.post_type))];
            console.log(`   Posts encontrados (tipos): ${types.join(', ')}`);
          }
        }
      } else {
        console.log(`   ⚠️  wp_user_id está NULL - não pode vincular`);
      }

      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 RESUMO:\n');
  console.log(`   ✅ Vinculados: ${linked}`);
  console.log(`   ❌ Não vinculados: ${unlinked}\n`);

  process.exit(0);
}

investigate();
