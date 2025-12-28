/**
 * Script para diagnosticar relação entre voluntários e usuários WordPress
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

async function diagnose() {
  console.log('\n🔍 Diagnóstico: Voluntários × Usuários WordPress\n');

  // Buscar posts de voluntários
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_title, post_author')
    .eq('post_type', 'voluntario')
    .limit(10);

  console.log(`📊 Primeiros 10 voluntários:\n`);

  for (const post of posts) {
    console.log(`ID: ${post.id} | Autor: ${post.post_author} | Título: ${post.post_title}`);

    if (post.post_author && post.post_author !== '0') {
      const { data: user } = await supabase
        .from('wp_users_legacy')
        .select('user_email, display_name')
        .eq('id', post.post_author)
        .single();

      if (user) {
        console.log(`   ✅ Email: ${user.user_email}`);
      } else {
        console.log(`   ❌ Usuário ${post.post_author} não encontrado em wp_users_legacy`);
      }
    } else {
      console.log(`   ⚠️  Sem post_author`);
    }
    console.log('');
  }

  // Estatísticas
  const { data: allPosts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author')
    .eq('post_type', 'voluntario');

  const withAuthor = allPosts.filter(p => p.post_author && p.post_author !== '0');
  const withoutAuthor = allPosts.filter(p => !p.post_author || p.post_author === '0');

  console.log(`\n📊 Estatísticas:`);
  console.log(`   Total de voluntários: ${allPosts.length}`);
  console.log(`   Com post_author: ${withAuthor.length}`);
  console.log(`   Sem post_author: ${withoutAuthor.length}\n`);

  process.exit(0);
}

diagnose();
