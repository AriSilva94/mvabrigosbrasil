#!/usr/bin/env node

/**
 * 🚀 Executor Automático de Migração Completa
 *
 * Este script executa TODOS os scripts de migração na ordem correta,
 * seguindo o GUIA-MIGRACAO-COMPLETO.md
 *
 * PREREQUISITOS (você deve ter executado ANTES):
 * - ✅ SQL 00: Verificação inicial
 * - ✅ SQL 01: Criar tabelas legadas (wp_*_raw)
 * - ✅ SQL 02: Criar tabelas de domínio
 * - ✅ SQL 03: Criar triggers e funções
 * - ✅ SQL 04: Configurar RLS
 * - ✅ SQL 05: Desabilitar triggers
 * - ✅ Importar backup do WordPress nas tabelas *_raw
 * - ✅ Configurar .env.local com SUPABASE_SERVICE_ROLE_KEY
 *
 * ESTE SCRIPT EXECUTA:
 * 1. Migração de abrigos
 * 2. Migração de dinâmicas populacionais
 * 3. Migração de voluntários
 * 4. Backfill de slugs (volunteers)
 * 5. Verificar duplicatas de slugs (volunteers)
 * 6. Migração de vagas
 * 7. Verificar duplicatas de slugs (vacancies)
 * 8. Validação final de todas as migrações
 *
 * DEPOIS DESTE SCRIPT, VOCÊ DEVE:
 * - ⚠️  Executar SQL 06: Reabilitar triggers
 * - ⚠️  Executar SQL 07: Validação final
 *
 * USO:
 * node run-full-migration.js [--dry-run] [--skip-validation]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { executeSql, executeSqlFile } = require('./utils/execute-sql');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Parse argumentos
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipValidation = args.includes('--skip-validation');

// Log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(80));
  log(message, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logStep(step, message) {
  log(`\n[${'✓'.padEnd(3)}] PASSO ${step}: ${message}`, 'bright');
}

function logSuccess(message) {
  log(`  ✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`  ⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`  ❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ️  ${message}`, 'blue');
}

// Função para executar script e capturar output
function runScript(scriptPath, description, options = {}) {
  const fullPath = path.join(__dirname, scriptPath);

  if (!fs.existsSync(fullPath)) {
    logError(`Script não encontrado: ${scriptPath}`);
    throw new Error(`Script não encontrado: ${fullPath}`);
  }

  logInfo(`Executando: ${scriptPath}`);

  if (isDryRun) {
    logWarning('DRY RUN - Script não será executado');
    return { success: true, dryRun: true };
  }

  try {
    const startTime = Date.now();

    // Executar script
    const output = execSync(`node "${fullPath}"`, {
      cwd: path.dirname(fullPath),
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Procurar por indicadores de sucesso/erro no output
    const hasError = output.toLowerCase().includes('error') ||
                     output.toLowerCase().includes('falha') ||
                     output.toLowerCase().includes('failed');

    const hasSuccess = output.toLowerCase().includes('sucesso') ||
                       output.toLowerCase().includes('success') ||
                       output.toLowerCase().includes('concluído') ||
                       output.toLowerCase().includes('completed');

    // Salvar output em arquivo
    const outputDir = path.join(path.dirname(fullPath), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `run-${timestamp}.log`);
    fs.writeFileSync(outputFile, output);

    logSuccess(`Concluído em ${duration}s`);
    logInfo(`Output salvo em: ${path.relative(__dirname, outputFile)}`);

    if (hasError && !hasSuccess) {
      logWarning('Output contém palavras de erro - verifique o log!');
    }

    // Mostrar últimas linhas do output
    const lines = output.trim().split('\n');
    const lastLines = lines.slice(-5);
    console.log('\n  Últimas linhas do output:');
    lastLines.forEach(line => console.log(`    ${line}`));

    return {
      success: true,
      output,
      duration,
      outputFile,
      hasWarnings: hasError && hasSuccess
    };

  } catch (error) {
    logError(`Falha ao executar: ${error.message}`);

    if (error.stdout) {
      console.log('\n  Output:');
      console.log(error.stdout.toString());
    }

    if (error.stderr) {
      console.log('\n  Errors:');
      console.log(error.stderr.toString());
    }

    throw error;
  }
}

// Função para executar SQL automaticamente
async function runSql(sql, description) {
  if (isDryRun) {
    logWarning(`SQL: ${description} (pulado em dry-run)`);
    logInfo(sql.trim());
    return { success: true, dryRun: true };
  }

  logInfo(`Executando SQL: ${description}`);

  try {
    const result = await executeSql(sql, { verbose: false });
    logSuccess(`SQL executado: ${description}`);
    return result;
  } catch (error) {
    logError(`Falha ao executar SQL: ${error.message}`);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    logHeader('🚀 MIGRAÇÃO COMPLETA WORDPRESS → SUPABASE');

    if (isDryRun) {
      logWarning('MODO DRY RUN - Nenhum script será executado de verdade');
    }

    // Verificar .env.local
    const envPath = path.join(__dirname, '../../.env.local');
    if (!fs.existsSync(envPath)) {
      logError('.env.local não encontrado na raiz do projeto!');
      logError('Crie o arquivo com SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }
    logSuccess('.env.local encontrado');

    // Estatísticas finais
    const stats = {
      startTime: Date.now(),
      steps: [],
    };

    // ========================================
    // PASSO 1: Migrar Abrigos
    // ========================================
    logStep(1, 'Migração de Abrigos');
    const step1 = runScript(
      'abrigos/migrate-shelters-wp-to-supabase.js',
      'Migrar abrigos do WordPress para Supabase'
    );
    stats.steps.push({ name: 'Abrigos', ...step1 });

    // ========================================
    // PASSO 2: Migrar Dinâmicas Populacionais
    // ========================================
    logStep(2, 'Migração de Dinâmicas Populacionais');
    const step2 = runScript(
      'abrigos/dinamica-populacional/migrate-dynamics-wp-to-supabase-optimized.js',
      'Migrar dinâmicas populacionais para shelter_dynamics'
    );
    stats.steps.push({ name: 'Dinâmicas', ...step2 });

    // ========================================
    // PASSO 3: Migrar Voluntários
    // ========================================
    logStep(3, 'Migração de Voluntários');
    const step3 = runScript(
      'voluntarios/migrate-volunteers-wp-to-supabase.js',
      'Migrar voluntários do WordPress para Supabase'
    );
    stats.steps.push({ name: 'Voluntários', ...step3 });

    // ========================================
    // PASSO 4: Adicionar coluna slug em volunteers
    // ========================================
    logStep(4, 'Adicionar coluna slug em volunteers');
    await runSql(
      'ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS slug TEXT;',
      'Adicionar coluna slug em volunteers'
    );

    // ========================================
    // PASSO 5: Backfill Slugs (Voluntários)
    // ========================================
    logStep(5, 'Backfill de Slugs para Voluntários');
    const step5 = runScript(
      'programa-de-voluntarios/backfill-slug.js',
      'Gerar slugs únicos para voluntários'
    );
    stats.steps.push({ name: 'Backfill Slugs', ...step5 });

    // ========================================
    // PASSO 6: Verificar Duplicatas de Slugs
    // ========================================
    if (!skipValidation) {
      logStep(6, 'Verificar Duplicatas de Slugs (Voluntários)');
      const step6 = runScript(
        'programa-de-voluntarios/check-slug-duplicates.js',
        'Verificar se há slugs duplicados'
      );
      stats.steps.push({ name: 'Check Duplicatas (Voluntários)', ...step6 });

      if (step6.hasWarnings) {
        logError('ATENÇÃO: Duplicatas encontradas! Não prossiga sem resolver.');
        process.exit(1);
      }
    }

    // ========================================
    // PASSO 7: Criar índice único de slug em volunteers
    // ========================================
    logStep(7, 'Criar índice único de slug em volunteers');
    await runSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_slug
       ON public.volunteers(slug)
       WHERE slug IS NOT NULL;`,
      'Criar índice único para slug em volunteers'
    );

    // ========================================
    // PASSO 8: Adicionar coluna slug em vacancies
    // ========================================
    logStep(8, 'Adicionar coluna slug em vacancies');
    await runSql(
      'ALTER TABLE public.vacancies ADD COLUMN IF NOT EXISTS slug TEXT;',
      'Adicionar coluna slug em vacancies'
    );

    // ========================================
    // PASSO 9: Migrar Vagas
    // ========================================
    logStep(9, 'Migração de Vagas de Voluntariado');
    const step9 = runScript(
      'vagas-voluntariado/migrate-vacancies-wp-to-supabase.js',
      'Migrar vagas do WordPress para Supabase'
    );
    stats.steps.push({ name: 'Vagas', ...step9 });

    // ========================================
    // PASSO 10: Verificar Duplicatas de Slugs (Vagas)
    // ========================================
    if (!skipValidation) {
      logStep(10, 'Verificar Duplicatas de Slugs (Vagas)');
      const step10 = runScript(
        'vagas-voluntariado/check-slug-duplicates.js',
        'Verificar se há slugs duplicados em vagas'
      );
      stats.steps.push({ name: 'Check Duplicatas (Vagas)', ...step10 });

      if (step10.hasWarnings) {
        logError('ATENÇÃO: Duplicatas encontradas! Não prossiga sem resolver.');
        process.exit(1);
      }
    }

    // ========================================
    // PASSO 11: Criar índice único de slug em vacancies
    // ========================================
    logStep(11, 'Criar índice único de slug em vacancies');
    await runSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_vacancies_slug
       ON public.vacancies(slug)
       WHERE slug IS NOT NULL;`,
      'Criar índice único para slug em vacancies'
    );

    // ========================================
    // PASSO 12: Validações Finais
    // ========================================
    if (!skipValidation) {
      logStep(12, 'Validações Finais');

      logInfo('Validando migração de abrigos...');
      const val1 = runScript(
        'abrigos/verify-migration.js',
        'Validar migração de abrigos'
      );
      stats.steps.push({ name: 'Validação Abrigos', ...val1 });

      logInfo('Validando migração de dinâmicas...');
      const val2 = runScript(
        'abrigos/dinamica-populacional/verify-dynamics-migration.js',
        'Validar migração de dinâmicas'
      );
      stats.steps.push({ name: 'Validação Dinâmicas', ...val2 });
    }

    // ========================================
    // PASSO 13: Reabilitar Triggers
    // ========================================
    logStep(13, 'Reabilitar Triggers');
    const sql06Path = path.join(__dirname, 'sql', '06-pos-migracao-reabilitar-triggers.sql');
    await executeSqlFile(sql06Path, { verbose: true });
    logSuccess('Triggers reabilitados');

    // ========================================
    // PASSO 14: Validação Final
    // ========================================
    logStep(14, 'Validação Final da Migração');
    const sql07Path = path.join(__dirname, 'sql', '07-validacao-final.sql');
    await executeSqlFile(sql07Path, { verbose: true });
    logSuccess('Validação final concluída');

    // ========================================
    // PASSO 15: Popular wp_users_legacy
    // ========================================
    logStep(15, 'Popular wp_users_legacy');
    await runSql(
      `INSERT INTO wp_users_legacy (id, user_login, user_email, user_pass, display_name)
       SELECT id, user_login, user_email, user_pass, display_name
       FROM wp_users_raw
       ON CONFLICT (id) DO NOTHING;`,
      'Popular wp_users_legacy a partir de wp_users_raw'
    );
    logSuccess('wp_users_legacy populada com sucesso');

    // ========================================
    // RESUMO FINAL
    // ========================================
    const totalDuration = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(2);

    logHeader('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');

    console.log('\n📊 RESUMO DA EXECUÇÃO:\n');
    stats.steps.forEach((step, i) => {
      const icon = step.hasWarnings ? '⚠️ ' : '✅';
      const duration = step.duration ? ` (${step.duration}s)` : '';
      console.log(`  ${icon} ${(i + 1).toString().padStart(2)}. ${step.name}${duration}`);
    });

    console.log(`\n⏱️  Tempo total: ${totalDuration} minutos\n`);

    logSuccess('\n🎉 Migração 100% automatizada concluída!');

    logWarning('\n📋 PRÓXIMOS PASSOS:');
    logWarning('1. Testar aplicação: npm run build && npm run start');
    logWarning('2. Fazer deploy em produção');

    logInfo('\n💡 DICA:');
    logInfo('Revise os resultados da validação final (PASSO 14) acima.');
    logInfo('Todos os checks devem estar ✅ OK.');

  } catch (error) {
    logHeader('❌ ERRO NA MIGRAÇÃO');
    logError(error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { runScript };
