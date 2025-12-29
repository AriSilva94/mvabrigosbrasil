/**
 * Script de Verificação: Pós-Migração de Abrigos
 *
 * Valida se a migração de abrigos foi bem-sucedida,
 * comparando dados do legado com o Supabase.
 *
 * Uso:
 * - node scripts/migrations/abrigos/verify-migration.js
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
// VERIFICAÇÕES
// ========================================

async function verifyMigration() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Verificação Pós-Migração: Abrigos                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const report = {
    legacy: {
      total: 0,
    },
    supabase: {
      total: 0,
      withWpPostId: 0,
      withoutWpPostId: 0,
      withProfileId: 0,
      byType: {},
      byState: {},
    },
    validation: {
      duplicates: [],
      noName: [],
      sample: [],
    },
  };

  try {
    // 1. Contar total no legado
    console.log('📊 Contando abrigos no legado...');
    const { count: legacyCount, error: legacyError } = await supabase
      .from('wp_posts_raw')
      .select('*', { count: 'exact', head: true })
      .eq('post_type', 'abrigo');

    if (legacyError) {
      throw new Error(`Erro ao contar legado: ${legacyError.message}`);
    }

    report.legacy.total = legacyCount || 0;
    console.log(`   Total no legado: ${report.legacy.total}\n`);

    // 2. Contar total migrado no Supabase
    console.log('📊 Contando abrigos migrados no Supabase...');
    const { count: migratedCount, error: migratedError } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true })
      .not('wp_post_id', 'is', null);

    if (migratedError) {
      throw new Error(`Erro ao contar migrados: ${migratedError.message}`);
    }

    report.supabase.withWpPostId = migratedCount || 0;
    console.log(`   Total migrado: ${report.supabase.withWpPostId}\n`);

    // 3. Contar total geral no Supabase
    const { count: totalCount, error: totalError } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw new Error(`Erro ao contar total: ${totalError.message}`);
    }

    report.supabase.total = totalCount || 0;
    report.supabase.withoutWpPostId = report.supabase.total - report.supabase.withWpPostId;

    // 4. Verificar duplicatas por wp_post_id
    console.log('🔍 Verificando duplicatas...');
    const { data: duplicates, error: duplicatesError } = await supabase
      .from('shelters')
      .select('wp_post_id')
      .not('wp_post_id', 'is', null);

    if (duplicatesError) {
      throw new Error(`Erro ao buscar duplicatas: ${duplicatesError.message}`);
    }

    const wpPostIdCounts = {};
    duplicates?.forEach(item => {
      const id = item.wp_post_id;
      wpPostIdCounts[id] = (wpPostIdCounts[id] || 0) + 1;
    });

    Object.entries(wpPostIdCounts).forEach(([id, count]) => {
      if (count > 1) {
        report.validation.duplicates.push({ wp_post_id: id, count });
      }
    });

    console.log(`   Duplicatas encontradas: ${report.validation.duplicates.length}\n`);

    // 5. Verificar abrigos sem nome
    console.log('🔍 Verificando abrigos sem nome...');
    const { data: noNameShelters, error: noNameError } = await supabase
      .from('shelters')
      .select('id, wp_post_id, name')
      .not('wp_post_id', 'is', null)
      .or('name.is.null,name.eq.');

    if (noNameError) {
      throw new Error(`Erro ao buscar sem nome: ${noNameError.message}`);
    }

    report.validation.noName = noNameShelters || [];
    console.log(`   Sem nome: ${report.validation.noName.length}\n`);

    // 6. Verificar profile_id vinculado
    console.log('🔍 Verificando vínculos de perfil...');
    const { count: withProfileCount, error: profileError } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true })
      .not('wp_post_id', 'is', null)
      .not('profile_id', 'is', null);

    if (profileError) {
      throw new Error(`Erro ao contar profile_id: ${profileError.message}`);
    }

    report.supabase.withProfileId = withProfileCount || 0;
    console.log(`   Com profile_id vinculado: ${report.supabase.withProfileId}\n`);

    // 7. Distribuição por tipo
    console.log('📊 Analisando distribuição por tipo...');
    const { data: allShelters, error: allError } = await supabase
      .from('shelters')
      .select('shelter_type, state')
      .not('wp_post_id', 'is', null);

    if (allError) {
      throw new Error(`Erro ao buscar todos: ${allError.message}`);
    }

    allShelters?.forEach(shelter => {
      const type = shelter.shelter_type || 'null';
      const state = shelter.state || 'null';

      report.supabase.byType[type] = (report.supabase.byType[type] || 0) + 1;
      report.supabase.byState[state] = (report.supabase.byState[state] || 0) + 1;
    });

    console.log('   Distribuição calculada\n');

    // 8. Amostra aleatória
    console.log('🎲 Buscando amostra aleatória...');
    const { data: sample, error: sampleError } = await supabase
      .from('shelters')
      .select('id, wp_post_id, name, shelter_type, state, city, active')
      .not('wp_post_id', 'is', null)
      .limit(10);

    if (sampleError) {
      throw new Error(`Erro ao buscar amostra: ${sampleError.message}`);
    }

    report.validation.sample = sample || [];
    console.log(`   Amostra coletada: ${report.validation.sample.length} registros\n`);

    // 9. Exibir relatório
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMO DA VERIFICAÇÃO                                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 CONTAGENS:');
    console.log(`   Legado (WordPress):       ${report.legacy.total}`);
    console.log(`   Migrados (Supabase):      ${report.supabase.withWpPostId}`);
    console.log(`   Nativos (sem wp_post_id): ${report.supabase.withoutWpPostId}`);
    console.log(`   Total (Supabase):         ${report.supabase.total}\n`);

    const migrationRate = report.legacy.total > 0
      ? ((report.supabase.withWpPostId / report.legacy.total) * 100).toFixed(1)
      : 0;

    console.log(`📈 TAXA DE MIGRAÇÃO: ${migrationRate}%\n`);

    console.log('🔍 VALIDAÇÕES:');
    console.log(`   Duplicatas:               ${report.validation.duplicates.length}`);
    console.log(`   Sem nome:                 ${report.validation.noName.length}`);
    console.log(`   Com profile_id:           ${report.supabase.withProfileId}\n`);

    if (report.validation.duplicates.length > 0) {
      console.log('⚠️  DUPLICATAS ENCONTRADAS:');
      report.validation.duplicates.forEach(dup => {
        console.log(`   - wp_post_id ${dup.wp_post_id}: ${dup.count} ocorrências`);
      });
      console.log('');
    }

    if (report.validation.noName.length > 0) {
      console.log('⚠️  ABRIGOS SEM NOME:');
      report.validation.noName.slice(0, 10).forEach(shelter => {
        console.log(`   - ID ${shelter.id} (wp_post_id: ${shelter.wp_post_id})`);
      });
      if (report.validation.noName.length > 10) {
        console.log(`   ... e mais ${report.validation.noName.length - 10}`);
      }
      console.log('');
    }

    console.log('📊 DISTRIBUIÇÃO POR TIPO:');
    Object.entries(report.supabase.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = ((count / report.supabase.withWpPostId) * 100).toFixed(1);
        console.log(`   ${type.padEnd(15)} ${count.toString().padStart(5)} (${percentage}%)`);
      });

    console.log('\n📊 DISTRIBUIÇÃO POR ESTADO (TOP 10):');
    Object.entries(report.supabase.byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([state, count]) => {
        const percentage = ((count / report.supabase.withWpPostId) * 100).toFixed(1);
        console.log(`   ${state.padEnd(15)} ${count.toString().padStart(5)} (${percentage}%)`);
      });

    console.log('\n🎲 AMOSTRA ALEATÓRIA:');
    report.validation.sample.forEach((shelter, idx) => {
      console.log(`   [${idx + 1}] ${shelter.name || '(sem nome)'}`);
      console.log(`       wp_post_id: ${shelter.wp_post_id}, tipo: ${shelter.shelter_type || 'null'}`);
      console.log(`       local: ${shelter.city || '?'} - ${shelter.state || '?'}, ativo: ${shelter.active}`);
    });

    // 10. Salvar relatório
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'verify-migration-report.json');
    const fullReport = {
      timestamp: new Date().toISOString(),
      ...report,
    };

    fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2), 'utf8');
    console.log(`\n📄 Relatório salvo em: ${reportPath}\n`);

    // 11. Conclusão
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  CONCLUSÃO                                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const hasIssues =
      report.validation.duplicates.length > 0 ||
      report.validation.noName.length > 0 ||
      report.supabase.withWpPostId < report.legacy.total;

    if (!hasIssues) {
      console.log('✅ Migração VALIDADA com sucesso!');
      console.log('   Todos os abrigos foram migrados corretamente.\n');
    } else {
      console.log('⚠️  Migração CONCLUÍDA com ressalvas:');

      if (report.supabase.withWpPostId < report.legacy.total) {
        const missing = report.legacy.total - report.supabase.withWpPostId;
        console.log(`   - ${missing} abrigos não foram migrados`);
      }

      if (report.validation.duplicates.length > 0) {
        console.log(`   - ${report.validation.duplicates.length} duplicatas encontradas`);
      }

      if (report.validation.noName.length > 0) {
        console.log(`   - ${report.validation.noName.length} abrigos sem nome`);
      }

      console.log('\n   Revise o relatório JSON para mais detalhes.\n');
    }

  } catch (error) {
    console.error('\n❌ Erro durante a verificação:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
verifyMigration().catch(console.error);
