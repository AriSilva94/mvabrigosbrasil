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

function normalizeText(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

function extractMeta(metaArray, key) {
  if (!Array.isArray(metaArray)) return null;
  const meta = metaArray.find(m => m.meta_key === key);
  return meta?.meta_value || null;
}

(async () => {
  console.log('Testando mapeamento para wp_post_id: 685\n');

  // Buscar post
  const { data: post } = await supabase
    .from('wp_posts_raw')
    .select('*')
    .eq('id', 685)
    .single();

  // Buscar metas
  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key, meta_value')
    .eq('post_id', 685);

  console.log('Metadados encontrados:', metas?.length);

  // Testar extração
  const email = normalizeText(extractMeta(metas, 'email') || extractMeta(metas, 'e-mail'));
  const telefone = normalizePhone(extractMeta(metas, 'telefone'));
  const responsavelRaw = extractMeta(metas, 'responsavel');
  const nomeRaw = extractMeta(metas, 'nome');
  const responsavel = responsavelRaw && responsavelRaw.toUpperCase() !== 'NULL'
    ? normalizeText(responsavelRaw)
    : normalizeText(nomeRaw);
  const funcao = normalizeText(extractMeta(metas, 'funcao'));
  const especie = normalizeText(extractMeta(metas, 'especie'));

  console.log('\nResultados do mapeamento:');
  console.log('  email:', email);
  console.log('  telefone:', telefone);
  console.log('  responsavel:', responsavel);
  console.log('  funcao:', funcao);
  console.log('  especie:', especie);

  console.log('\n\nValores brutos:');
  console.log('  responsavelRaw:', responsavelRaw);
  console.log('  nomeRaw:', nomeRaw);
})();
