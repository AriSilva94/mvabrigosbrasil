/**
 * Script: Verificar Duplicatas de Slug
 *
 * Verifica se há slugs duplicados na tabela volunteers antes de criar o índice único.
 *
 * Requisitos:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 * - node check-slug-duplicates.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ========================================
// CARREGAMENTO DE VARIÁVEIS DE AMBIENTE
// ========================================

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Erro: Arquivo .env.local não encontrado na raiz do projeto');
    process.exit(1);
  }

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

// ========================================
// CONFIGURAÇÃO
// ========================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========================================
// LÓGICA PRINCIPAL
// ========================================

async function checkDuplicates() {
  console.log('🔍 Verificando duplicatas de slug...\n');

  try {
    // Buscar todos os slugs
    const { data: volunteers, error } = await supabase
      .from('volunteers')
      .select('id, name, slug, wp_post_id')
      .not('slug', 'is', null)
      .order('slug');

    if (error) {
      console.error('❌ Erro ao buscar voluntários:', error);
      process.exit(1);
    }

    if (!volunteers || volunteers.length === 0) {
      console.log('⚠️  Nenhum voluntário com slug encontrado.');
      return;
    }

    console.log(`✅ Total de voluntários com slug: ${volunteers.length}\n`);

    // Detectar duplicatas
    const slugCount = new Map();
    volunteers.forEach(v => {
      const count = slugCount.get(v.slug) || [];
      count.push(v);
      slugCount.set(v.slug, count);
    });

    const duplicates = Array.from(slugCount.entries())
      .filter(([_, volunteers]) => volunteers.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada! Seguro criar índice único.\n');
      console.log('📋 Próximo passo:');
      console.log('   Execute o SQL: create-slug-index.sql\n');
      return;
    }

    // Exibir duplicatas
    console.log(`❌ Encontradas ${duplicates.length} duplicatas:\n`);

    duplicates.forEach(([slug, volunteers]) => {
      console.log(`═══════════════════════════════════════`);
      console.log(`Slug duplicado: "${slug}"`);
      console.log(`Total de ocorrências: ${volunteers.length}`);
      console.log('─────────────────────────────────────');
      volunteers.forEach(v => {
        console.log(`  ID: ${v.id}`);
        console.log(`  Nome: ${v.name}`);
        console.log(`  WP Post ID: ${v.wp_post_id || 'N/A'}`);
        console.log('');
      });
    });

    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  ATENÇÃO: Corrija as duplicatas antes de criar o índice único!\n');
    console.log('💡 Sugestões de correção:');
    console.log('   1. Adicione sufixo único aos slugs duplicados');
    console.log('   2. Verifique se são registros realmente diferentes');
    console.log('   3. Delete registros duplicados se necessário\n');

    process.exit(1);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

// ========================================
// EXECUÇÃO
// ========================================

checkDuplicates().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
