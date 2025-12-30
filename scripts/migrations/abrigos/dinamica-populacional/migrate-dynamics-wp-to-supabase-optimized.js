/**
 * Script de Migração OTIMIZADO: Dinâmica Populacional (WordPress → Supabase)
 *
 * Versão otimizada que:
 * - Busca TODOS os metadados de uma vez
 * - Busca TODOS os shelters de uma vez
 * - Processa em memória
 * - Faz upsert em lotes de 100
 *
 * Performance: ~10 queries ao invés de ~3000
 *
 * Uso:
 * - Dry-run: node migrate-dynamics-wp-to-supabase-optimized.js --dry-run
 * - Migração completa: node migrate-dynamics-wp-to-supabase-optimized.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ========================================
// CARREGAMENTO DE VARIÁVEIS DE AMBIENTE
// ========================================

function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../../.env.local');

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
const BATCH_SIZE = 100; // Tamanho do lote para upsert

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

function extractReferencePeriod(postTitle, postDate) {
  const titleMatch = postTitle?.match(/-(\d{2})$/);

  if (titleMatch) {
    const month = titleMatch[1];
    const year = new Date(postDate).getFullYear();
    return `${year}-${month}`;
  }

  if (postDate) {
    const date = new Date(postDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  return null;
}

function extractReferenceDate(referencePeriod) {
  if (!referencePeriod) return null;
  return `${referencePeriod}-01`;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}

// ========================================
// FUNÇÃO PRINCIPAL DE MIGRAÇÃO
// ========================================

async function migrateDynamics() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  MIGRAÇÃO OTIMIZADA: Dinâmica Populacional               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (isDryRun) {
    console.log('🔍 MODO DRY-RUN: Nenhum dado será persistido\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // ========================================
  // ETAPA 1: Buscar todos os posts
  // ========================================
  console.log('📥 [1/4] Buscando posts de dinâmica...');

  const { data: dinamicaPosts, error: dinamicaError } = await supabase
    .from('wp_posts_raw')
    .select('id, post_author, post_title, post_type, post_date')
    .in('post_type', ['dinamica', 'dinamica_lar'])
    .order('id', { ascending: true });

  if (dinamicaError) {
    console.error('❌ Erro:', dinamicaError);
    process.exit(1);
  }

  console.log(`   ✅ ${dinamicaPosts?.length || 0} posts encontrados\n`);

  if (!dinamicaPosts || dinamicaPosts.length === 0) {
    console.log('⚠️  Nenhum post encontrado.\n');
    process.exit(0);
  }

  // ========================================
  // ETAPA 2: Buscar TODOS os metadados de uma vez
  // ========================================
  console.log('📥 [2/4] Buscando metadados (busca otimizada)...');

  const postIds = dinamicaPosts.map(p => p.id);
  const allMetas = [];

  // Buscar em lotes pequenos (100 posts por vez para não estourar limite de resultados)
  // Como cada post tem ~11 metadados, 100 posts = ~1100 metadados (dentro do limite)
  for (let i = 0; i < postIds.length; i += 100) {
    const batch = postIds.slice(i, i + 100);
    const { data: metas } = await supabase
      .from('wp_postmeta_raw')
      .select('post_id, meta_key, meta_value')
      .in('post_id', batch);

    if (metas) {
      allMetas.push(...metas);
    }
  }

  // Criar mapa de metadados: postId -> { meta_key: meta_value }
  const metasByPost = new Map();
  allMetas.forEach(meta => {
    if (!metasByPost.has(meta.post_id)) {
      metasByPost.set(meta.post_id, {});
    }
    metasByPost.get(meta.post_id)[meta.meta_key] = meta.meta_value;
  });

  console.log(`   ✅ ${allMetas.length} metadados carregados em memória\n`);

  // ========================================
  // ETAPA 3: Buscar TODOS os shelters de uma vez
  // ========================================
  console.log('📥 [3/4] Buscando shelters migrados...');

  const { data: shelters } = await supabase
    .from('shelters')
    .select('id, wp_post_id')
    .not('wp_post_id', 'is', null);

  // Criar mapa: wp_post_id -> shelter_id
  const shelterMap = new Map();
  shelters?.forEach(s => {
    shelterMap.set(String(s.wp_post_id), s.id);
  });

  console.log(`   ✅ ${shelters?.length || 0} shelters carregados em memória\n`);

  // ========================================
  // ETAPA 4: Processar e preparar registros
  // ========================================
  console.log('⚙️  [4/4] Processando registros...\n');

  const recordsToInsert = [];
  const detailedLog = [];

  let processed = 0;
  let successful = 0;
  let skipped = 0;

  const skippedReasons = {
    noIdAbrigo: 0,
    shelterNotMigrated: 0,
    noPeriod: 0,
    noMetadata: 0
  };

  for (const post of dinamicaPosts) {
    processed++;

    // Progresso a cada 100
    if (processed % 100 === 0 || processed === dinamicaPosts.length) {
      const percentage = ((processed / dinamicaPosts.length) * 100).toFixed(1);
      process.stdout.write(`\r   🔄 Processando: ${processed}/${dinamicaPosts.length} (${percentage}%)`);
    }

    const logEntry = {
      postId: post.id,
      postType: post.post_type,
      status: '',
      reason: ''
    };

    // Buscar metadados do mapa
    const metaMap = metasByPost.get(post.id);
    if (!metaMap || Object.keys(metaMap).length === 0) {
      skipped++;
      skippedReasons.noMetadata++;
      logEntry.status = 'skipped';
      logEntry.reason = 'no_metadata';
      detailedLog.push(logEntry);
      continue;
    }

    // Buscar id_abrigo
    const idAbrigo = metaMap['id_abrigo'];
    if (!idAbrigo) {
      skipped++;
      skippedReasons.noIdAbrigo++;
      logEntry.status = 'skipped';
      logEntry.reason = 'no_id_abrigo';
      detailedLog.push(logEntry);
      continue;
    }

    // Buscar shelter_id do mapa
    const shelterId = shelterMap.get(String(idAbrigo));
    if (!shelterId) {
      skipped++;
      skippedReasons.shelterNotMigrated++;
      logEntry.status = 'skipped';
      logEntry.reason = 'shelter_not_migrated';
      logEntry.wpPostId = idAbrigo;
      detailedLog.push(logEntry);
      continue;
    }

    // Extrair período
    const referencePeriod = extractReferencePeriod(post.post_title, post.post_date);
    const referenceDate = extractReferenceDate(referencePeriod);

    if (!referencePeriod || !referenceDate) {
      skipped++;
      skippedReasons.noPeriod++;
      logEntry.status = 'skipped';
      logEntry.reason = 'no_period';
      detailedLog.push(logEntry);
      continue;
    }

    // Mapear campos
    const dynamicType = post.post_type;
    const kind = post.post_type === 'dinamica_lar' ? 'lar' : 'abrigo';

    const record = {
      shelter_id: shelterId,
      dynamic_type: dynamicType,
      kind: kind,
      reference_period: referencePeriod,
      reference_date: referenceDate,

      // Campos de entrada
      entradas_de_animais: normalizeNumber(metaMap['entradas_de_animais']),
      entradas_de_gatos: normalizeNumber(metaMap['entradas_de_gatos']),

      // Campos de adoção
      adocoes_de_animais: normalizeNumber(metaMap['adocoes_de_animais']),
      adocoes_de_gatos: normalizeNumber(metaMap['adocoes_de_gatos']),

      // Campos de devolução
      devolucoes_de_animais: normalizeNumber(metaMap['devolucoes_de_animais']),
      devolucoes_de_gatos: normalizeNumber(metaMap['devolucoes_de_gatos']),

      // Campos de eutanásia
      eutanasias_de_animais: normalizeNumber(metaMap['eutanasias_de_animais']),
      eutanasias_de_gatos: normalizeNumber(metaMap['eutanasias_de_gatos']),

      // Campos de morte natural
      mortes_naturais_de_animais: normalizeNumber(metaMap['mortes_naturais_de_animais']),
      mortes_naturais_de_gatos: normalizeNumber(metaMap['mortes_naturais_de_gatos']),

      // Campos de doença
      doencas_caes: normalizeNumber(metaMap['doencas_caes']),
      doencas_gatos: normalizeNumber(metaMap['doencas_gatos']),

      // Campos novos
      retorno_de_caes: normalizeNumber(metaMap['retorno_de_caes']),
      retorno_de_gatos: normalizeNumber(metaMap['retorno_de_gatos']),
      retorno_local_caes: normalizeNumber(metaMap['retorno_local_caes']),
      retorno_local_gatos: normalizeNumber(metaMap['retorno_local_gatos']),
    };

    recordsToInsert.push(record);
    logEntry.status = 'ready';
    logEntry.shelterId = shelterId;
    logEntry.referencePeriod = referencePeriod;
    detailedLog.push(logEntry);
  }

  console.log('\n');
  console.log(`   ✅ Processamento concluído: ${recordsToInsert.length} registros prontos\n`);

  // ========================================
  // ETAPA 5: Remover duplicatas
  // ========================================
  // Pode haver múltiplos posts WP para a mesma combinação shelter_id+dynamic_type+reference_period
  // Vamos manter apenas o último (mais recente)
  const uniqueRecords = [];
  const seenKeys = new Set();

  for (let i = recordsToInsert.length - 1; i >= 0; i--) {
    const record = recordsToInsert[i];
    const key = `${record.shelter_id}|${record.dynamic_type}|${record.reference_period}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueRecords.unshift(record);
    }
  }

  const duplicatesRemoved = recordsToInsert.length - uniqueRecords.length;
  if (duplicatesRemoved > 0) {
    console.log(`   ℹ️  Removidas ${duplicatesRemoved} duplicatas (mantido registro mais recente)\n`);
  }

  // ========================================
  // ETAPA 6: Inserir em lotes
  // ========================================
  if (!isDryRun && uniqueRecords.length > 0) {
    console.log('💾 Inserindo dados em lotes...\n');

    let errors = 0;
    const totalBatches = Math.ceil(uniqueRecords.length / BATCH_SIZE);

    for (let i = 0; i < uniqueRecords.length; i += BATCH_SIZE) {
      const batch = uniqueRecords.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

      process.stdout.write(`\r   🔄 Lote ${batchNumber}/${totalBatches} (${batch.length} registros)`);

      const { error } = await supabase
        .from('shelter_dynamics')
        .upsert(batch, {
          onConflict: 'shelter_id,dynamic_type,reference_period'
        });

      if (error) {
        console.error(`\n   ❌ Erro no lote ${batchNumber}:`, error.message);
        errors++;

        // Atualizar log
        const startIdx = i;
        const endIdx = Math.min(i + BATCH_SIZE, uniqueRecords.length);
        for (let j = startIdx; j < endIdx; j++) {
          const logIdx = detailedLog.findIndex(l => l.status === 'ready');
          if (logIdx !== -1) {
            detailedLog[logIdx].status = 'error';
            detailedLog[logIdx].reason = error.message;
          }
        }
      } else {
        successful += batch.length;

        // Atualizar log
        const startIdx = i;
        const endIdx = Math.min(i + BATCH_SIZE, uniqueRecords.length);
        for (let j = startIdx; j < endIdx; j++) {
          const logIdx = detailedLog.findIndex(l => l.status === 'ready');
          if (logIdx !== -1) {
            detailedLog[logIdx].status = 'success';
          }
        }
      }
    }

    console.log('\n');

    if (errors > 0) {
      console.log(`   ⚠️  Concluído com ${errors} erros\n`);
    } else {
      console.log(`   ✅ Todos os lotes inseridos com sucesso!\n`);
    }
  } else if (isDryRun) {
    successful = uniqueRecords.length;
    detailedLog.forEach(log => {
      if (log.status === 'ready') {
        log.status = 'success';
        log.reason = 'dry_run';
      }
    });
  }

  // ========================================
  // RELATÓRIO FINAL
  // ========================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 RELATÓRIO FINAL:\n');
  console.log(`   Processados:  ${processed}`);
  console.log(`   Sucesso:      ${successful}`);
  console.log(`   Pulados:      ${skipped}\n`);

  if (skipped > 0) {
    console.log('📋 Motivos de registros pulados:\n');
    console.log(`   Sem id_abrigo:           ${skippedReasons.noIdAbrigo}`);
    console.log(`   Abrigo não migrado:      ${skippedReasons.shelterNotMigrated}`);
    console.log(`   Sem período:             ${skippedReasons.noPeriod}`);
    console.log(`   Sem metadados:           ${skippedReasons.noMetadata}\n`);
  }

  if (isDryRun) {
    console.log('🔍 MODO DRY-RUN: Nenhum dado foi persistido');
    console.log('   Execute sem --dry-run para realizar a migração real.\n');
  } else {
    console.log('✅ Migração concluída!\n');
  }

  // Exportar log
  const outputPath = path.join(__dirname, 'output', `migration-optimized-${Date.now()}.json`);
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const logData = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'production',
    optimized: true,
    batch_size: BATCH_SIZE,
    stats: {
      processed,
      successful,
      skipped,
      skippedReasons
    },
    detailedLog: detailedLog
  };

  fs.writeFileSync(outputPath, JSON.stringify(logData, null, 2));
  console.log(`💾 Log exportado para: ${outputPath}\n`);

  process.exit(0);
}

// Executar
migrateDynamics();
