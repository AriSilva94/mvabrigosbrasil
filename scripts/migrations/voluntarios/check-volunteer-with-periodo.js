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
  // Buscar um voluntário que TEM periodo e atuacao
  const { data: vol } = await supabase.from('volunteers').select('wp_post_id, name, periodo, atuacao, disponibilidade').not('periodo', 'is', null).not('atuacao', 'is', null).limit(1).single();

  console.log('\nVoluntário COM periodo e atuacao:');
  console.log('  wp_post_id:', vol.wp_post_id);
  console.log('  name:', vol.name);
  console.log('  periodo:', vol.periodo);
  console.log('  atuacao:', vol.atuacao);
  console.log('  disponibilidade:', vol.disponibilidade);
  console.log('');

  // Buscar metadados
  const { data: metas } = await supabase.from('wp_postmeta_raw').select('meta_key, meta_value').eq('post_id', vol.wp_post_id).in('meta_key', ['periodo', 'atuacao', 'disponibilidade']);

  console.log('Metadados no WordPress:');
  metas.forEach(m => console.log(`  ${m.meta_key}: ${m.meta_value}`));
  console.log('');
})();
