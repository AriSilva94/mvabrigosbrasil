const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = '../../../.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=').trim();
  if (key && value) process.env[key] = value;
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const email = 'alves.thaisnascimento@gmail.com';

  // 1. Buscar user_id no wp_users_legacy
  const { data: wpUser } = await supabase.from('wp_users_legacy').select('id, user_email, display_name').eq('user_email', email).single();

  if (!wpUser) {
    console.log('Usuário não encontrado no wp_users_legacy');
    return;
  }

  console.log('\nUsuário WordPress:');
  console.log('  ID:', wpUser.id);
  console.log('  Email:', wpUser.user_email);
  console.log('  Nome:', wpUser.display_name);
  console.log('');

  // 2. Buscar post de voluntário
  const { data: wpPost } = await supabase.from('wp_posts_raw').select('id, post_title').eq('post_author', wpUser.id).eq('post_type', 'voluntario').single();

  if (!wpPost) {
    console.log('Post de voluntário não encontrado');
    return;
  }

  console.log('Post WordPress:');
  console.log('  ID:', wpPost.id);
  console.log('  Título:', wpPost.post_title);
  console.log('');

  // 3. Buscar voluntário migrado
  const { data: vol } = await supabase.from('volunteers').select('wp_post_id, name, disponibilidade, periodo, atuacao').eq('wp_post_id', wpPost.id).single();

  if (!vol) {
    console.log('Voluntário não encontrado na tabela migrada');
    return;
  }

  console.log('Voluntário migrado:');
  console.log('  wp_post_id:', vol.wp_post_id);
  console.log('  name:', vol.name);
  console.log('  disponibilidade:', vol.disponibilidade || '(vazio)');
  console.log('  periodo:', vol.periodo || '(vazio)');
  console.log('  atuacao:', vol.atuacao || '(vazio)');
  console.log('');

  // 2. Buscar TODAS as meta_keys no WordPress
  const { data: allMetas } = await supabase.from('wp_postmeta_raw').select('meta_key, meta_value').eq('post_id', vol.wp_post_id).order('meta_key');

  console.log('TODAS as meta_keys no WordPress:');
  if (allMetas && allMetas.length > 0) {
    allMetas.forEach(m => {
      const val = m.meta_value ? (m.meta_value.length > 50 ? m.meta_value.substring(0, 50) + '...' : m.meta_value) : '(null)';
      console.log(`  ${m.meta_key.padEnd(30)} = ${val}`);
    });
  } else {
    console.log('  (nenhuma encontrada)');
  }

  console.log('');

  // 3. Buscar meta_keys que contenham palavras-chave
  console.log('Buscando meta_keys relacionadas (período, atuação, forma):');
  const keywords = ['period', 'atu', 'forma', 'disp', 'trabalho', 'volunt'];
  const related = allMetas.filter(m =>
    keywords.some(kw => m.meta_key.toLowerCase().includes(kw))
  );

  if (related.length > 0) {
    related.forEach(m => {
      const val = m.meta_value ? (m.meta_value.length > 50 ? m.meta_value.substring(0, 50) + '...' : m.meta_value) : '(null)';
      console.log(`  ✅ ${m.meta_key.padEnd(40)} = ${val}`);
    });
  } else {
    console.log('  ❌ Nenhuma meta_key relacionada encontrada');
  }

  console.log('');
})();
