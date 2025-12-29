/**
 * Script de Verificação: Qualidade dos Dados de Abrigos
 *
 * Analisa os dados legados do WordPress antes da migração
 * para identificar problemas e estimar o escopo da migração.
 *
 * Uso:
 * - node scripts/migrations/abrigos/check-shelter-data.js
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
// FUNÇÕES AUXILIARES
// ========================================

function extractMeta(metaArray, key) {
  if (!Array.isArray(metaArray)) return null;
  const meta = metaArray.find(m => m.meta_key === key);
  return meta?.meta_value || null;
}

// ========================================
// ANÁLISE DE DADOS
// ========================================

async function analyzeShelterData() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Análise de Qualidade: Dados de Abrigos (WordPress)       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const report = {
    total: 0,
    withName: 0,
    withoutName: 0,
    byStatus: {},
    byType: {},
    byState: {},
    metadataStats: {
      hasEstado: 0,
      hasTipo: 0,
      hasCidade: 0,
      hasEndereco: 0,
      hasWebsite: 0,
      hasFundacao: 0,
      hasCnpj: 0,
      hasCpf: 0,
    },
    issues: {
      noName: [],
      noType: [],
      noState: [],
      invalidFoundationDate: [],
    },
  };

  try {
    // 1. Contar total de abrigos
    console.log('📊 Contando abrigos no legado...');
    const { count, error: countError } = await supabase
      .from('wp_posts_raw')
      .select('*', { count: 'exact', head: true })
      .eq('post_type', 'abrigo');

    if (countError) {
      throw new Error(`Erro ao contar: ${countError.message}`);
    }

    report.total = count || 0;
    console.log(`   Total encontrado: ${report.total}\n`);

    if (report.total === 0) {
      console.log('⚠️  Nenhum abrigo encontrado no legado.\n');
      return;
    }

    // 2. Buscar todos os abrigos com metadados
    console.log('🔍 Analisando dados...');
    const { data: posts, error: postsError } = await supabase
      .from('wp_posts_raw')
      .select('id, post_title, post_status, post_name, post_date')
      .eq('post_type', 'abrigo')
      .order('id', { ascending: true });

    if (postsError) {
      throw new Error(`Erro ao buscar posts: ${postsError.message}`);
    }

    // Buscar metadados em lotes
    const postIds = posts.map(p => p.id);
    const CHUNK_SIZE = 100;
    let allMetas = [];

    for (let i = 0; i < postIds.length; i += CHUNK_SIZE) {
      const chunk = postIds.slice(i, i + CHUNK_SIZE);
      const { data: metas } = await supabase
        .from('wp_postmeta_raw')
        .select('post_id, meta_key, meta_value')
        .in('post_id', chunk)
        .in('meta_key', [
          'estado',
          'tipo',
          'cidade',
          'endereco',
          'website',
          'fundacao',
          'cnpj',
          'cpf',
        ]);

      if (metas) {
        allMetas = allMetas.concat(metas);
      }
    }

    // Agrupar metadados por post_id
    const metasByPostId = {};
    allMetas.forEach(meta => {
      if (!metasByPostId[meta.post_id]) {
        metasByPostId[meta.post_id] = [];
      }
      metasByPostId[meta.post_id].push(meta);
    });

    // 3. Analisar cada abrigo
    posts.forEach(post => {
      const metas = metasByPostId[post.id] || [];

      // Nome
      const hasName = post.post_title && post.post_title.trim().length > 0;
      if (hasName) {
        report.withName++;
      } else {
        report.withoutName++;
        report.issues.noName.push({ id: post.id, slug: post.post_name });
      }

      // Status
      const status = post.post_status || 'unknown';
      report.byStatus[status] = (report.byStatus[status] || 0) + 1;

      // Metadados
      const estado = extractMeta(metas, 'estado');
      const tipo = extractMeta(metas, 'tipo');
      const cidade = extractMeta(metas, 'cidade');
      const endereco = extractMeta(metas, 'endereco');
      const website = extractMeta(metas, 'website');
      const fundacao = extractMeta(metas, 'fundacao');
      const cnpj = extractMeta(metas, 'cnpj');
      const cpf = extractMeta(metas, 'cpf');

      if (estado) report.metadataStats.hasEstado++;
      if (tipo) report.metadataStats.hasTipo++;
      if (cidade) report.metadataStats.hasCidade++;
      if (endereco) report.metadataStats.hasEndereco++;
      if (website) report.metadataStats.hasWebsite++;
      if (fundacao) report.metadataStats.hasFundacao++;
      if (cnpj) report.metadataStats.hasCnpj++;
      if (cpf) report.metadataStats.hasCpf++;

      // Distribuição por tipo
      if (tipo) {
        report.byType[tipo] = (report.byType[tipo] || 0) + 1;
      } else {
        report.issues.noType.push({ id: post.id, name: post.post_title });
      }

      // Distribuição por estado
      if (estado) {
        const uf = estado.toUpperCase();
        report.byState[uf] = (report.byState[uf] || 0) + 1;
      } else {
        report.issues.noState.push({ id: post.id, name: post.post_title });
      }

      // Validar data de fundação
      if (fundacao && !/^\d{2}\/\d{2}\/\d{4}$/.test(fundacao)) {
        report.issues.invalidFoundationDate.push({
          id: post.id,
          name: post.post_title,
          value: fundacao,
        });
      }
    });

    // 4. Exibir relatório
    console.log('✅ Análise concluída!\n');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMO GERAL                                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Total de abrigos:           ${report.total}`);
    console.log(`✅ Com nome:                   ${report.withName} (${((report.withName / report.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Sem nome:                   ${report.withoutName} (${((report.withoutName / report.total) * 100).toFixed(1)}%)\n`);

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  DISTRIBUIÇÃO POR STATUS                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    Object.entries(report.byStatus)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`   ${status.padEnd(15)} ${count.toString().padStart(5)} (${((count / report.total) * 100).toFixed(1)}%)`);
      });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  DISTRIBUIÇÃO POR TIPO                                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    Object.entries(report.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tipo, count]) => {
        console.log(`   ${tipo.padEnd(15)} ${count.toString().padStart(5)} (${((count / report.total) * 100).toFixed(1)}%)`);
      });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  DISTRIBUIÇÃO POR ESTADO (TOP 10)                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    Object.entries(report.byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([uf, count]) => {
        console.log(`   ${uf.padEnd(15)} ${count.toString().padStart(5)} (${((count / report.total) * 100).toFixed(1)}%)`);
      });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  COBERTURA DE METADADOS                                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    Object.entries(report.metadataStats).forEach(([field, count]) => {
      const fieldLabel = field.replace('has', '').toLowerCase();
      const percentage = ((count / report.total) * 100).toFixed(1);
      console.log(`   ${fieldLabel.padEnd(15)} ${count.toString().padStart(5)} (${percentage}%)`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  PROBLEMAS IDENTIFICADOS                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`❌ Abrigos sem nome:           ${report.issues.noName.length}`);
    if (report.issues.noName.length > 0 && report.issues.noName.length <= 10) {
      report.issues.noName.forEach(item => {
        console.log(`   - ID ${item.id}: slug="${item.slug}"`);
      });
    }

    console.log(`\n❌ Abrigos sem tipo:           ${report.issues.noType.length}`);
    if (report.issues.noType.length > 0 && report.issues.noType.length <= 10) {
      report.issues.noType.forEach(item => {
        console.log(`   - ID ${item.id}: "${item.name}"`);
      });
    }

    console.log(`\n❌ Abrigos sem estado:         ${report.issues.noState.length}`);
    if (report.issues.noState.length > 0 && report.issues.noState.length <= 10) {
      report.issues.noState.forEach(item => {
        console.log(`   - ID ${item.id}: "${item.name}"`);
      });
    }

    console.log(`\n⚠️  Datas de fundação inválidas: ${report.issues.invalidFoundationDate.length}`);
    if (report.issues.invalidFoundationDate.length > 0 && report.issues.invalidFoundationDate.length <= 10) {
      report.issues.invalidFoundationDate.forEach(item => {
        console.log(`   - ID ${item.id}: "${item.value}"`);
      });
    }

    // 5. Salvar relatório
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reportPath = path.join(outputDir, 'check-shelter-data-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 Relatório salvo em: ${reportPath}\n`);

    // 6. Recomendações
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  RECOMENDAÇÕES                                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (report.issues.noName.length > 0) {
      console.log('⚠️  Abrigos sem nome serão REJEITADOS na migração.');
      console.log('   Recomendação: Corrigir no WordPress antes de migrar.\n');
    }

    if (report.issues.noType.length > 0) {
      console.log('⚠️  Abrigos sem tipo terão shelter_type = NULL.');
      console.log('   Recomendação: Preencher manualmente após migração.\n');
    }

    if (report.issues.noState.length > 0) {
      console.log('⚠️  Abrigos sem estado terão state = NULL.');
      console.log('   Recomendação: Preencher manualmente após migração.\n');
    }

    console.log('✅ Dados prontos para migração!\n');

  } catch (error) {
    console.error('\n❌ Erro durante a análise:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
analyzeShelterData().catch(console.error);
