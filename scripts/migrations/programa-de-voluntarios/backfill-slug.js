/**
 * Script: Backfill de Slugs na tabela volunteers
 *
 * Popula a coluna slug para todos os registros existentes na tabela volunteers:
 * 1. Para registros migrados (com wp_post_id): usa o post_name do WordPress
 * 2. Para registros novos (sem wp_post_id): gera slug a partir do nome + id
 *
 * Requisitos:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - Coluna slug já deve existir na tabela volunteers
 *
 * Uso:
 * - Dry-run: node backfill-slug.js --dry-run
 * - Execução: node backfill-slug.js
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
const BATCH_SIZE = 50;

// Argumentos CLI
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// ========================================
// VALIDAÇÃO DE AMBIENTE
// ========================================

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.error('   NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========================================
// UTILITÁRIOS
// ========================================

/**
 * Gera slug a partir do nome (mesma lógica do newVolunteersRepository.ts)
 */
function slugifyName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/**
 * Gera slug completo com sufixo de ID
 */
function generateVolunteerSlug(name, id) {
  const base = slugifyName(name || 'voluntario');
  const idSuffix = id.replace(/-/g, '').slice(0, 8) || 'novo';
  return `${base}-${idSuffix}`;
}

/**
 * Normaliza slug do WordPress (já vem formatado, só garantir)
 */
function normalizeWpSlug(postName) {
  if (!postName) return null;
  return postName.trim().toLowerCase();
}

// ========================================
// LÓGICA PRINCIPAL
// ========================================

async function backfillSlugs() {
  console.log('🚀 Iniciando backfill de slugs...\n');
  console.log(`📋 Modo: ${isDryRun ? 'DRY-RUN (sem alterações)' : 'EXECUÇÃO REAL'}\n`);

  const stats = {
    total: 0,
    withWpPostId: 0,
    withoutWpPostId: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    duplicates: new Set(),
  };

  try {
    // Buscar todos os voluntários sem slug
    console.log('📥 Buscando voluntários sem slug...');
    const { data: volunteers, error: volunteersError } = await supabase
      .from('volunteers')
      .select('id, name, wp_post_id')
      .is('slug', null);

    if (volunteersError) {
      console.error('❌ Erro ao buscar voluntários:', volunteersError);
      process.exit(1);
    }

    if (!volunteers || volunteers.length === 0) {
      console.log('✅ Nenhum voluntário sem slug encontrado. Backfill já completo!');
      return;
    }

    stats.total = volunteers.length;
    console.log(`✅ Encontrados ${stats.total} voluntários sem slug\n`);

    // Separar voluntários por origem
    const withWpPostId = volunteers.filter(v => v.wp_post_id);
    const withoutWpPostId = volunteers.filter(v => !v.wp_post_id);

    stats.withWpPostId = withWpPostId.length;
    stats.withoutWpPostId = withoutWpPostId.length;

    console.log(`📊 Estatísticas:`);
    console.log(`   - Com wp_post_id (migrados): ${stats.withWpPostId}`);
    console.log(`   - Sem wp_post_id (novos): ${stats.withoutWpPostId}\n`);

    // ========================================
    // PROCESSAR REGISTROS MIGRADOS (com wp_post_id)
    // ========================================

    if (withWpPostId.length > 0) {
      console.log('🔄 Processando registros migrados do WordPress...\n');

      // Buscar post_name dos posts do WordPress em lote
      const wpPostIds = withWpPostId.map(v => v.wp_post_id);
      const { data: wpPosts, error: wpError } = await supabase
        .from('wp_posts_raw')
        .select('id, post_name')
        .in('id', wpPostIds);

      if (wpError) {
        console.error('❌ Erro ao buscar posts do WordPress:', wpError);
      }

      // Criar mapa wp_post_id -> post_name
      const wpPostMap = new Map();
      (wpPosts || []).forEach(post => {
        if (post.post_name) {
          wpPostMap.set(post.id, normalizeWpSlug(post.post_name));
        }
      });

      // Atualizar em lotes
      for (let i = 0; i < withWpPostId.length; i += BATCH_SIZE) {
        const batch = withWpPostId.slice(i, i + BATCH_SIZE);

        for (const volunteer of batch) {
          const slug = wpPostMap.get(volunteer.wp_post_id);

          if (!slug) {
            console.log(`⚠️  Voluntário ${volunteer.id} (${volunteer.name}): wp_post_id=${volunteer.wp_post_id} não tem post_name no WordPress`);
            stats.skipped++;
            continue;
          }

          // Verificar duplicatas
          if (stats.duplicates.has(slug)) {
            console.log(`⚠️  DUPLICATA: slug "${slug}" já usado. Pulando voluntário ${volunteer.id}`);
            stats.skipped++;
            continue;
          }

          stats.duplicates.add(slug);

          if (isDryRun) {
            console.log(`[DRY-RUN] Voluntário ${volunteer.id} (${volunteer.name}) → slug: "${slug}"`);
            stats.updated++;
          } else {
            const { error: updateError } = await supabase
              .from('volunteers')
              .update({ slug })
              .eq('id', volunteer.id);

            if (updateError) {
              console.error(`❌ Erro ao atualizar ${volunteer.id}:`, updateError.message);
              stats.errors++;
            } else {
              console.log(`✅ Voluntário ${volunteer.id} (${volunteer.name}) → slug: "${slug}"`);
              stats.updated++;
            }
          }
        }
      }

      console.log('');
    }

    // ========================================
    // PROCESSAR REGISTROS NOVOS (sem wp_post_id)
    // ========================================

    if (withoutWpPostId.length > 0) {
      console.log('🔄 Processando registros novos (sem wp_post_id)...\n');

      for (let i = 0; i < withoutWpPostId.length; i += BATCH_SIZE) {
        const batch = withoutWpPostId.slice(i, i + BATCH_SIZE);

        for (const volunteer of batch) {
          const slug = generateVolunteerSlug(volunteer.name, volunteer.id);

          // Verificar duplicatas
          if (stats.duplicates.has(slug)) {
            console.log(`⚠️  DUPLICATA: slug "${slug}" já usado. Pulando voluntário ${volunteer.id}`);
            stats.skipped++;
            continue;
          }

          stats.duplicates.add(slug);

          if (isDryRun) {
            console.log(`[DRY-RUN] Voluntário ${volunteer.id} (${volunteer.name}) → slug: "${slug}"`);
            stats.updated++;
          } else {
            const { error: updateError } = await supabase
              .from('volunteers')
              .update({ slug })
              .eq('id', volunteer.id);

            if (updateError) {
              console.error(`❌ Erro ao atualizar ${volunteer.id}:`, updateError.message);
              stats.errors++;
            } else {
              console.log(`✅ Voluntário ${volunteer.id} (${volunteer.name}) → slug: "${slug}"`);
              stats.updated++;
            }
          }
        }
      }

      console.log('');
    }

    // ========================================
    // RELATÓRIO FINAL
    // ========================================

    console.log('═══════════════════════════════════════');
    console.log('📊 RELATÓRIO FINAL');
    console.log('═══════════════════════════════════════');
    console.log(`Total de registros processados: ${stats.total}`);
    console.log(`  - Migrados (WordPress): ${stats.withWpPostId}`);
    console.log(`  - Novos: ${stats.withoutWpPostId}`);
    console.log(`Atualizados com sucesso: ${stats.updated}`);
    console.log(`Pulados: ${stats.skipped}`);
    console.log(`Erros: ${stats.errors}`);
    console.log(`Slugs únicos gerados: ${stats.duplicates.size}`);
    console.log('═══════════════════════════════════════\n');

    if (isDryRun) {
      console.log('ℹ️  Este foi um DRY-RUN. Nenhuma alteração foi feita.');
      console.log('   Execute sem --dry-run para aplicar as mudanças.\n');
    } else {
      console.log('✅ Backfill concluído com sucesso!\n');
      console.log('📋 Próximos passos:');
      console.log('   1. Verifique se há duplicatas no relatório acima');
      console.log('   2. Execute: node check-slug-duplicates.js');
      console.log('   3. Se tudo OK, execute o SQL: create-slug-index.sql\n');
    }

    // Salvar relatório
    const reportPath = path.join(__dirname, 'output', 'backfill-slug-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      isDryRun,
      stats: {
        ...stats,
        duplicates: Array.from(stats.duplicates),
      },
    };

    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Relatório salvo em: ${reportPath}\n`);

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
  }
}

// ========================================
// EXECUÇÃO
// ========================================

backfillSlugs().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
