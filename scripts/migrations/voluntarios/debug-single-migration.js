/**
 * Debug script: Migrar APENAS o wp_post_id 1955 com logging detalhado
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

// Copiar as funções auxiliares do script de migração
function normalizePhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeText(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeState(state) {
  const normalized = normalizeText(state);
  return normalized ? normalized.toUpperCase() : null;
}

function parseWpDate(wpDate) {
  if (!wpDate) return new Date().toISOString();
  try {
    const date = new Date(wpDate);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function extractMeta(metaArray, key) {
  if (!Array.isArray(metaArray)) return null;
  const meta = metaArray.find(m => m.meta_key === key);
  return meta?.meta_value || null;
}

function mapLegacyVolunteerToNew(wpPost, metaArray) {
  const name = wpPost.post_title || null;
  const telefone = normalizePhone(extractMeta(metaArray, 'telefone'));
  const cidade = normalizeText(extractMeta(metaArray, 'cidade'));
  const estado = normalizeState(extractMeta(metaArray, 'estado'));
  const profissao = normalizeText(extractMeta(metaArray, 'profissao'));
  const escolaridade = normalizeText(extractMeta(metaArray, 'escolaridade'));
  const faixaEtaria = normalizeText(extractMeta(metaArray, 'faixa_etaria'));
  const genero = normalizeText(extractMeta(metaArray, 'genero'));
  const experiencia = normalizeText(extractMeta(metaArray, 'experiencia'));
  const atuacao = normalizeText(extractMeta(metaArray, 'atuacao'));
  const disponibilidade = normalizeText(extractMeta(metaArray, 'disponibilidade'));
  const periodo = normalizeText(extractMeta(metaArray, 'periodo'));
  const descricao = normalizeText(extractMeta(metaArray, 'descricao') || wpPost.post_content);
  const comentarios = normalizeText(extractMeta(metaArray, 'comentarios'));

  const isPublic = wpPost.post_status === 'publish';
  const createdAt = parseWpDate(wpPost.post_date);
  const updatedAt = parseWpDate(wpPost.post_modified);

  return {
    wp_post_id: wpPost.id,
    owner_profile_id: null,
    name,
    telefone,
    cidade,
    estado,
    profissao,
    escolaridade,
    faixa_etaria: faixaEtaria,
    genero,
    experiencia,
    atuacao,
    disponibilidade,
    periodo,
    descricao,
    comentarios,
    is_public: isPublic,
    accept_terms: true,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

async function debugSingleMigration() {
  console.log('\n🔍 DEBUG: Migrando APENAS wp_post_id 1955 com logging detalhado...\n');

  // 1. Buscar post e metadados
  const { data: posts } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author, post_date, post_content, post_title, post_status, post_modified, post_type')
    .eq('id', 1955);

  const post = posts[0];

  const { data: metas } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_key, meta_value')
    .eq('post_id', 1955);

  console.log('📋 Metadados recebidos:', metas?.length || 0);

  // 2. Mapear para o formato do volunteers
  const volunteer = mapLegacyVolunteerToNew(post, metas);

  console.log('\n📊 OBJETO MAPEADO (que será enviado ao upsert):\n');
  console.log(JSON.stringify(volunteer, null, 2));

  // 3. Fazer o upsert
  console.log('\n🔄 Executando upsert...\n');

  const { data, error } = await supabase
    .from('volunteers')
    .upsert(volunteer, {
      onConflict: 'wp_post_id',
      ignoreDuplicates: false,
    })
    .select('*');

  if (error) {
    console.error('❌ Erro no upsert:', error);
    process.exit(1);
  }

  console.log('✅ Upsert realizado com sucesso!\n');
  console.log('📊 DADOS RETORNADOS DO BANCO:\n');
  console.log(JSON.stringify(data, null, 2));

  console.log('\n');
  process.exit(0);
}

debugSingleMigration();
