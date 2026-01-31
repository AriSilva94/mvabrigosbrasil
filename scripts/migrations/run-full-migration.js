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
 * - ✅ Importar backup do WordPress nas tabelas *_raw
 * - ✅ Configurar .env.local com SUPABASE_SERVICE_ROLE_KEY e DATABASE_URL
 *
 * ESTE SCRIPT EXECUTA AUTOMATICAMENTE (22 PASSOS):
 * 0. Desabilitar triggers de histórico
 * 1. Migrar abrigos
 * 2. Migrar dinâmicas populacionais
 * 3. Migrar integrantes de equipe (WP → Supabase) - inclui gerentes
 * 4. Migrar voluntários
 * 5. Adicionar coluna slug em volunteers
 * 6. Backfill de slugs (volunteers)
 * 7. Verificar duplicatas de slugs (volunteers)
 * 8. Criar índice único em volunteers.slug
 * 9. Adicionar coluna slug em vacancies
 * 10. Migrar vagas
 * 11. Vincular vagas aos abrigos
 * 12. Verificar duplicatas de slugs (vacancies)
 * 13. Criar índice único em vacancies.slug
 * 14. Criar profiles para donos de abrigos
 * 15. Vincular abrigos aos profiles
 * 16. Migrar candidaturas de vagas
 * 17. Preencher referral_source com "outro" (campo novo)
 * 18. Validações (abrigos, dinâmicas, gerentes)
 * 19. Reabilitar triggers (SQL 06)
 * 20. Validação final completa (SQL 07)
 * 21. Popular wp_users_legacy para autenticação
 * 22. Garantir RLS e policies em todas as tabelas
 *
 * DEPOIS DESTE SCRIPT:
 * ✅ Tudo pronto! Apenas testar e fazer deploy
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
    // PASSO 0: Desabilitar Triggers
    // ========================================
    logStep(0, 'Desabilitar triggers de histórico');
    await runSql(
      `ALTER TABLE public.shelters DISABLE TRIGGER trigger_shelter_history;`,
      'Desabilitar trigger de histórico em shelters'
    );
    logSuccess('Trigger de histórico desabilitado');

    // ========================================
    // PASSO 0.5: Adicionar coluna referral_source (se não existir)
    // ========================================
    logStep('0.5', 'Adicionar coluna referral_source nas tabelas');

    await runSql(
      `ALTER TABLE public.shelters ADD COLUMN IF NOT EXISTS referral_source TEXT;`,
      'Adicionar coluna referral_source em shelters'
    );

    await runSql(
      `ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS referral_source TEXT;`,
      'Adicionar coluna referral_source em volunteers'
    );

    logSuccess('Coluna referral_source adicionada (ou já existia)');

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
    // PASSO 3: Migrar Integrantes de Equipe
    // ========================================
    logStep(3, 'Migração de Integrantes de Equipe');
    const step3 = runScript(
      'equipe/migrate-team-members-wp-to-supabase.js',
      'Migrar integrantes de equipe (WordPress para Supabase)'
    );
    stats.steps.push({ name: 'Integrantes', ...step3 });

    // ========================================
    // PASSO 4: Migrar Voluntários
    // ========================================
    logStep(4, 'Migração de Voluntários');
    const step4 = runScript(
      'voluntarios/migrate-volunteers-wp-to-supabase.js',
      'Migrar voluntários do WordPress para Supabase'
    );
    stats.steps.push({ name: 'Voluntários', ...step4 });

    // ========================================
    // PASSO 5: Adicionar coluna slug em volunteers
    // ========================================
    logStep(5, 'Adicionar coluna slug em volunteers');
    await runSql(
      'ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS slug TEXT;',
      'Adicionar coluna slug em volunteers'
    );

    // ========================================
    // PASSO 6: Backfill Slugs (Voluntários)
    // ========================================
    logStep(6, 'Backfill de Slugs para Voluntários');
    const step6 = runScript(
      'programa-de-voluntarios/backfill-slug.js',
      'Gerar slugs únicos para voluntários'
    );
    stats.steps.push({ name: 'Backfill Slugs', ...step6 });

    // ========================================
    // PASSO 7: Verificar Duplicatas de Slugs
    // ========================================
    if (!skipValidation) {
      logStep(7, 'Verificar Duplicatas de Slugs (Voluntários)');
      const step7 = runScript(
        'programa-de-voluntarios/check-slug-duplicates.js',
        'Verificar se há slugs duplicados'
      );
      stats.steps.push({ name: 'Check Duplicatas (Voluntários)', ...step7 });

      if (step7.hasWarnings) {
        logError('ATENÇÃO: Duplicatas encontradas! Não prossiga sem resolver.');
        process.exit(1);
      }
    }

    // ========================================
    // PASSO 8: Criar índice único de slug em volunteers
    // ========================================
    logStep(8, 'Criar índice único de slug em volunteers');
    await runSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_slug
       ON public.volunteers(slug)
       WHERE slug IS NOT NULL;`,
      'Criar índice único para slug em volunteers'
    );

    // ========================================
    // PASSO 9: Adicionar coluna slug em vacancies
    // ========================================
    logStep(9, 'Adicionar coluna slug em vacancies');
    await runSql(
      'ALTER TABLE public.vacancies ADD COLUMN IF NOT EXISTS slug TEXT;',
      'Adicionar coluna slug em vacancies'
    );

    // ========================================
    // PASSO 10: Migrar Vagas
    // ========================================
    logStep(10, 'Migração de Vagas de Voluntariado');
    const step10 = runScript(
      'vagas-voluntariado/migrate-vacancies-wp-to-supabase.js',
      'Migrar vagas do WordPress para Supabase'
    );
    stats.steps.push({ name: 'Vagas', ...step10 });

    // ========================================
    // PASSO 11: Vincular Vagas aos Abrigos
    // ========================================
    logStep(11, 'Vincular Vagas aos Abrigos');
    const step11 = runScript(
      'vagas-voluntariado/link-vacancies-to-shelters.js',
      'Vincular vagas migradas aos seus respectivos abrigos'
    );
    stats.steps.push({ name: 'Vincular Vagas', ...step11 });

    // ========================================
    // PASSO 12: Verificar Duplicatas de Slugs (Vagas)
    // ========================================
    if (!skipValidation) {
      logStep(12, 'Verificar Duplicatas de Slugs (Vagas)');
      const step12 = runScript(
        'vagas-voluntariado/check-slug-duplicates.js',
        'Verificar se há slugs duplicados em vagas'
      );
      stats.steps.push({ name: 'Check Duplicatas (Vagas)', ...step12 });

      if (step12.hasWarnings) {
        logError('ATENÇÃO: Duplicatas encontradas! Não prossiga sem resolver.');
        process.exit(1);
      }
    }

    // ========================================
    // PASSO 13: Criar índice único de slug em vacancies
    // ========================================
    logStep(13, 'Criar índice único de slug em vacancies');
    await runSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_vacancies_slug
       ON public.vacancies(slug)
       WHERE slug IS NOT NULL;`,
      'Criar índice único para slug em vacancies'
    );

    // ========================================
    // PASSO 14: Criar profiles para donos de abrigos
    // ========================================
    logStep(14, 'Criar profiles para donos de abrigos');
    const step14 = runScript(
      'abrigos/create-shelter-owner-profiles-optimized.js',
      'Criar auth.users + profiles para donos de abrigos sem equipe'
    );
    stats.steps.push({ name: 'Profiles Donos', ...step14 });

    // ========================================
    // PASSO 15: Vincular abrigos aos profiles
    // ========================================
    logStep(15, 'Vincular abrigos aos profiles');
    const step15 = runScript(
      'abrigos/link-shelters-to-profiles.js',
      'Atualizar shelters.profile_id com os profiles dos donos'
    );
    stats.steps.push({ name: 'Link Shelters', ...step15 });

    // ========================================
    // PASSO 16: Migrar Candidaturas de Vagas
    // ========================================
    logStep(16, 'Migração de Candidaturas de Vagas');
    const step16 = runScript(
      'vagas-voluntariado/migrate-vacancy-applications.js',
      'Migrar candidaturas de voluntários em vagas'
    );
    stats.steps.push({ name: 'Candidaturas', ...step16 });

    // ========================================
    // PASSO 17: Preencher referral_source para registros migrados
    // ========================================
    logStep(17, 'Preencher referral_source para registros migrados do WordPress');

    // IMPORTANTE: Garantir que o trigger de histórico está desabilitado
    // antes de fazer updates em shelters (alguns registros migrados não têm profile_id)
    await runSql(
      `ALTER TABLE public.shelters DISABLE TRIGGER trigger_shelter_history;`,
      'Garantir que trigger de histórico está desabilitado'
    );

    // Preencher referral_source em shelters
    await runSql(
      `UPDATE public.shelters
       SET referral_source = 'outro'
       WHERE referral_source IS NULL;`,
      'Preencher referral_source em shelters com valor "outro"'
    );
    logSuccess('referral_source preenchido em shelters');

    // Preencher referral_source em volunteers
    await runSql(
      `UPDATE public.volunteers
       SET referral_source = 'outro'
       WHERE referral_source IS NULL;`,
      'Preencher referral_source em volunteers com valor "outro"'
    );
    logSuccess('referral_source preenchido em volunteers');

    // ========================================
    // PASSO 18: Validações de Componentes
    // ========================================
    if (!skipValidation) {
      logStep(18, 'Validações de Componentes');

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

      logInfo('Validando migração de gerentes...');
      const val3 = runScript(
        'equipe/verify-manager-migration.js',
        'Validar migração de gerentes (tipo_cadastro=gerente)'
      );
      stats.steps.push({ name: 'Validação Gerentes', ...val3 });
    }

    // ========================================
    // PASSO 19: Reabilitar Triggers
    // ========================================
    logStep(19, 'Reabilitar Triggers');
    const sql06Path = path.join(__dirname, 'sql', '06-pos-migracao-reabilitar-triggers.sql');
    await executeSqlFile(sql06Path, { verbose: true });
    logSuccess('Triggers reabilitados');

    // ========================================
    // PASSO 20: Validação Final
    // ========================================
    logStep(20, 'Validação Final da Migração');
    const sql07Path = path.join(__dirname, 'sql', '07-validacao-final.sql');
    await executeSqlFile(sql07Path, { verbose: true });
    logSuccess('Validação final concluída');

    // ========================================
    // PASSO 21: Popular wp_users_legacy
    // ========================================
    logStep(21, 'Popular wp_users_legacy');
    await runSql(
      `INSERT INTO wp_users_legacy (id, user_login, user_email, user_pass, display_name)
       SELECT id, user_login, user_email, user_pass, display_name
       FROM wp_users_raw
       ON CONFLICT (id) DO NOTHING;`,
      'Popular wp_users_legacy a partir de wp_users_raw'
    );
    logSuccess('wp_users_legacy populada com sucesso');

    // ========================================
    // PASSO 22: Garantir RLS em todas as tabelas
    // ========================================
    logStep(22, 'Garantir proteção RLS em todas as tabelas');

    // Habilitar RLS
    await runSql(
      `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.vacancy_applications ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.shelter_dynamics ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.shelter_volunteers ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.shelter_history ENABLE ROW LEVEL SECURITY;
       ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;`,
      'Habilitar RLS em todas as tabelas'
    );

    // Re-criar policies principais
    await runSql(
      `-- Profiles
       DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
       CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

       DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
       CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

       -- Shelters
       DROP POLICY IF EXISTS "Shelters are viewable by everyone" ON public.shelters;
       CREATE POLICY "Shelters are viewable by everyone" ON public.shelters FOR SELECT USING (true);

       -- Volunteers
       DROP POLICY IF EXISTS "Volunteers are viewable by everyone" ON public.volunteers;
       CREATE POLICY "Volunteers are viewable by everyone" ON public.volunteers FOR SELECT USING (true);

       -- Vacancies
       DROP POLICY IF EXISTS "Vacancies are viewable by everyone" ON public.vacancies;
       CREATE POLICY "Vacancies are viewable by everyone" ON public.vacancies FOR SELECT USING (true);

       -- Shelter Dynamics
       DROP POLICY IF EXISTS "Shelter dynamics are viewable by everyone" ON public.shelter_dynamics;
       CREATE POLICY "Shelter dynamics are viewable by everyone" ON public.shelter_dynamics FOR SELECT USING (true);

       -- Shelter Volunteers
       DROP POLICY IF EXISTS "Shelter volunteers are viewable by everyone" ON public.shelter_volunteers;
       CREATE POLICY "Shelter volunteers are viewable by everyone" ON public.shelter_volunteers FOR SELECT USING (true);

       -- Shelter History
       DROP POLICY IF EXISTS "Users can view their own shelter history" ON public.shelter_history;
       CREATE POLICY "Users can view their own shelter history" ON public.shelter_history FOR SELECT USING (auth.uid() = profile_id);

       DROP POLICY IF EXISTS "System can insert shelter history" ON public.shelter_history;
       CREATE POLICY "System can insert shelter history" ON public.shelter_history FOR INSERT WITH CHECK (true);

       -- Team memberships (somente backend/service_role)
       DROP POLICY IF EXISTS "Team memberships readable by service role" ON public.team_memberships;
       CREATE POLICY "Team memberships readable by service role" ON public.team_memberships FOR SELECT USING (auth.role() = 'service_role');

       DROP POLICY IF EXISTS "Team memberships writable by service role" ON public.team_memberships;
       CREATE POLICY "Team memberships writable by service role" ON public.team_memberships FOR INSERT WITH CHECK (auth.role() = 'service_role');

       DROP POLICY IF EXISTS "Team memberships updatable by service role" ON public.team_memberships;
       CREATE POLICY "Team memberships updatable by service role" ON public.team_memberships FOR UPDATE USING (auth.role() = 'service_role');

       DROP POLICY IF EXISTS "Team memberships deletable by service role" ON public.team_memberships;
       CREATE POLICY "Team memberships deletable by service role" ON public.team_memberships FOR DELETE USING (auth.role() = 'service_role');`,
      'Restaurar políticas RLS'
    );

    // Verificar RLS
    const rlsCheck = await runSql(
      `SELECT
         tablename,
         rowsecurity as rls_enabled,
         (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND pg_policies.tablename = pg_tables.tablename) as policy_count
       FROM pg_tables
       WHERE schemaname = 'public'
         AND tablename IN ('profiles', 'shelters', 'volunteers', 'vacancies', 'shelter_dynamics', 'shelter_volunteers', 'shelter_history', 'team_memberships')
       ORDER BY tablename;`,
      'Verificar status RLS'
    );

    if (rlsCheck && rlsCheck.rows) {
      logInfo('\nStatus RLS:');
      rlsCheck.rows.forEach(row => {
        const icon = row.rls_enabled && row.policy_count > 0 ? '✅' : '❌';
        logInfo(`  ${icon} ${row.tablename}: RLS=${row.rls_enabled}, Policies=${row.policy_count}`);
      });

      // Verificar se alguma tabela está sem RLS ou policies
      const tablesWithoutRls = rlsCheck.rows.filter(r => !r.rls_enabled);
      const tablesWithoutPolicies = rlsCheck.rows.filter(r => r.policy_count === 0);

      if (tablesWithoutRls.length > 0) {
        logError(`ERRO: ${tablesWithoutRls.length} tabela(s) sem RLS: ${tablesWithoutRls.map(t => t.tablename).join(', ')}`);
        throw new Error('RLS não habilitado em todas as tabelas!');
      }

      if (tablesWithoutPolicies.length > 0) {
        logError(`ERRO: ${tablesWithoutPolicies.length} tabela(s) sem policies: ${tablesWithoutPolicies.map(t => t.tablename).join(', ')}`);
        throw new Error('Policies não configuradas em todas as tabelas!');
      }
    }

    logSuccess('RLS configurado e validado em todas as 7 tabelas');

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
