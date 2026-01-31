/**
 * Script para gerar relatório de abrigos e dinâmica populacional
 * Espelha a estrutura visual da tela /banco-de-dados
 *
 * Uso: node scripts/queries/report-shelters.js [ano]
 * Exemplo: node scripts/queries/report-shelters.js 2025
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
function loadEnvFile() {
  const envPath = path.join(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('❌ Arquivo .env.local não encontrado na raiz do projeto');
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const YEAR = parseInt(process.argv[2]) || 2026;
const MONTH_LABELS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeShelterType(shelterType) {
  const typeMap = { 'public': 'Público', 'private': 'Privado', 'mixed': 'Misto', 'temporary': 'LT-PI' };
  return typeMap[shelterType] || shelterType;
}

function parseNumber(value) {
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(String(value).replace(',', '.').trim());
  return isFinite(parsed) ? parsed : 0;
}

function parseYear(dateStr) {
  if (!dateStr) return 0;
  const match = String(dateStr).match(/^(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

function parseMonth(dateStr) {
  if (!dateStr) return 0;
  const match = String(dateStr).match(/^\d{4}-(\d{2})/);
  return match ? parseInt(match[1]) : 0;
}

function formatDate(dateStr) {
  if (!dateStr) return '--/--/----';
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '--/--/----';
}

function pad(str, len) {
  return String(str).padStart(len);
}

async function fetchAllRows(table, select, pageSize = 1000) {
  const rows = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + pageSize - 1);
    if (error) throw new Error(`Falha ao carregar ${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if ((data ?? []).length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE EXIBIÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

function printHeader(title) {
  const line = '═'.repeat(78);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(line);
}

function printSubHeader(title) {
  console.log(`\n  ┌${'─'.repeat(74)}┐`);
  console.log(`  │  ${title.padEnd(72)}│`);
  console.log(`  └${'─'.repeat(74)}┘`);
}

function printTable(headers, rows, totals = null) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length), totals ? String(totals[i]).length : 0));

  const headerLine = headers.map((h, i) => h.padStart(widths[i])).join('   ');
  const separator = widths.map(w => '─'.repeat(w)).join('───');

  console.log(`\n    ${headerLine}`);
  console.log(`    ${separator}`);

  rows.forEach(row => {
    const line = row.map((cell, i) => String(cell).padStart(widths[i])).join('   ');
    console.log(`    ${line}`);
  });

  if (totals) {
    console.log(`    ${separator}`);
    const totalLine = totals.map((cell, i) => String(cell).padStart(widths[i])).join('   ');
    console.log(`    ${totalLine}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GERADOR DE RELATÓRIO
// ═══════════════════════════════════════════════════════════════════════════════

async function generateReport() {
  console.log('\n');
  console.log('  ╔════════════════════════════════════════════════════════════════════════╗');
  console.log(`  ║          BANCO DE DADOS - RELATÓRIO ${YEAR}                               ║`);
  console.log('  ║          Comparar com: /banco-de-dados                                 ║');
  console.log('  ╚════════════════════════════════════════════════════════════════════════╝');

  try {
    // Carregar dados
    console.log('\n  📥 Carregando dados...');

    const shelters = await fetchAllRows('shelters', 'id, wp_post_id, name, state, shelter_type, city, created_at, active');
    const dynamics = await fetchAllRows('shelter_dynamics', `
      id, shelter_id, kind, dynamic_type, reference_date, reference_period,
      entradas_de_animais, entradas_de_gatos, adocoes_caes, adocoes_gatos,
      devolucoes_caes, devolucoes_gatos, eutanasias_caes, eutanasias_gatos,
      mortes_naturais_caes, mortes_naturais_gatos, retorno_de_caes, retorno_de_gatos,
      retorno_local_caes, retorno_local_gatos
    `);

    const sheltersYear = shelters.filter(s => parseYear(s.created_at) === YEAR);
    const dynamicsYear = dynamics.filter(d => parseYear(d.reference_date) === YEAR);

    const shelterLookup = new Map(shelters.map(s => [s.id, s]));
    const enrichedDynamics = dynamicsYear.map(d => {
      const shelter = shelterLookup.get(d.shelter_id);
      return {
        ...d,
        shelterState: shelter?.state?.toUpperCase(),
        shelterType: normalizeShelterType(shelter?.shelter_type),
        shelterName: shelter?.name,
      };
    });

    console.log(`  ✅ ${sheltersYear.length} abrigos cadastrados em ${YEAR}`);
    console.log(`  ✅ ${dynamicsYear.length} registros de dinâmica em ${YEAR}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // CARDS DE OVERVIEW
    // ═══════════════════════════════════════════════════════════════════════════
    printHeader('OVERVIEW - Cards no topo da página');

    const overview = { total: 0, publico: 0, privado: 0, misto: 0, ltpi: 0 };
    sheltersYear.forEach(s => {
      overview.total++;
      const type = normalizeShelterType(s.shelter_type);
      if (type === 'Público') overview.publico++;
      if (type === 'Privado') overview.privado++;
      if (type === 'Misto') overview.misto++;
      if (type === 'LT-PI') overview.ltpi++;
    });

    console.log(`
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   TOTAL     │  │   PÚBLICO   │  │   PRIVADO   │  │    MISTO    │  │    LT-PI    │
    │     ${pad(overview.total, 4)}    │  │     ${pad(overview.publico, 4)}    │  │     ${pad(overview.privado, 4)}    │  │     ${pad(overview.misto, 4)}    │  │     ${pad(overview.ltpi, 4)}    │
    └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
    `);

    // ═══════════════════════════════════════════════════════════════════════════
    // GRÁFICO: FLUXO DE ANIMAIS
    // ═══════════════════════════════════════════════════════════════════════════
    printHeader('FLUXO DE ANIMAIS - Gráfico de linha');

    const monthlyFlow = {};
    MONTH_LABELS.forEach((label, i) => {
      monthlyFlow[i + 1] = { label, entradas: 0, devolucoes: 0, adocoes: 0, eutanasias: 0, mortesNaturais: 0, retornoTutor: 0, retornoLocal: 0 };
    });

    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      if (monthlyFlow[m]) {
        monthlyFlow[m].entradas += parseNumber(d.entradas_de_animais) + parseNumber(d.entradas_de_gatos);
        monthlyFlow[m].devolucoes += parseNumber(d.devolucoes_caes) + parseNumber(d.devolucoes_gatos);
        monthlyFlow[m].adocoes += parseNumber(d.adocoes_caes) + parseNumber(d.adocoes_gatos);
        monthlyFlow[m].eutanasias += parseNumber(d.eutanasias_caes) + parseNumber(d.eutanasias_gatos);
        monthlyFlow[m].mortesNaturais += parseNumber(d.mortes_naturais_caes) + parseNumber(d.mortes_naturais_gatos);
        monthlyFlow[m].retornoTutor += parseNumber(d.retorno_de_caes) + parseNumber(d.retorno_de_gatos);
        monthlyFlow[m].retornoLocal += parseNumber(d.retorno_local_caes) + parseNumber(d.retorno_local_gatos);
      }
    });

    const flowRows = Object.values(monthlyFlow).map(m => [m.label, m.entradas, m.devolucoes, m.adocoes, m.eutanasias, m.mortesNaturais, m.retornoTutor, m.retornoLocal]);
    const flowTotals = ['TOTAL', ...flowRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Entradas', 'Devol', 'Adoções', 'Eutas', 'Mortes', 'RetTut', 'RetLoc'], flowRows, flowTotals);

    // ═══════════════════════════════════════════════════════════════════════════
    // SEÇÃO: ENTRADAS DE ANIMAIS ↑
    // ═══════════════════════════════════════════════════════════════════════════
    printHeader('↑ ENTRADAS DE ANIMAIS');

    // Gráfico: Entradas por Espécie
    printSubHeader('Entradas por Espécie (Cães vs Gatos)');

    const speciesEntries = {};
    MONTH_LABELS.forEach((label, i) => { speciesEntries[i + 1] = { label, dogs: 0, cats: 0 }; });
    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      if (speciesEntries[m]) {
        speciesEntries[m].dogs += parseNumber(d.entradas_de_animais);
        speciesEntries[m].cats += parseNumber(d.entradas_de_gatos);
      }
    });

    const speciesRows = Object.values(speciesEntries).map(m => [m.label, m.dogs, m.cats, m.dogs + m.cats]);
    const speciesTotals = ['TOTAL', ...speciesRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Cães', 'Gatos', 'Total'], speciesRows, speciesTotals);

    // Gráfico: Entrada por Tipo de Abrigo - CÃO
    printSubHeader('Entrada por Tipo de Abrigo - CÃO');

    const typeEntriesDogs = {};
    MONTH_LABELS.forEach((label, i) => { typeEntriesDogs[i + 1] = { label, publico: 0, privado: 0, misto: 0, ltpi: 0 }; });
    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      const val = parseNumber(d.entradas_de_animais) + parseNumber(d.devolucoes_caes);
      if (typeEntriesDogs[m]) {
        if (d.shelterType === 'Público') typeEntriesDogs[m].publico += val;
        if (d.shelterType === 'Privado') typeEntriesDogs[m].privado += val;
        if (d.shelterType === 'Misto') typeEntriesDogs[m].misto += val;
        if (d.shelterType === 'LT-PI') typeEntriesDogs[m].ltpi += val;
      }
    });

    const dogTypeRows = Object.values(typeEntriesDogs).map(m => [m.label, m.publico, m.privado, m.misto, m.ltpi]);
    const dogTypeTotals = ['TOTAL', ...dogTypeRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Público', 'Privado', 'Misto', 'LT-PI'], dogTypeRows, dogTypeTotals);

    // Gráfico: Entrada por Tipo de Abrigo - GATO
    printSubHeader('Entrada por Tipo de Abrigo - GATO');

    const typeEntriesCats = {};
    MONTH_LABELS.forEach((label, i) => { typeEntriesCats[i + 1] = { label, publico: 0, privado: 0, misto: 0, ltpi: 0 }; });
    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      const val = parseNumber(d.entradas_de_gatos) + parseNumber(d.devolucoes_gatos);
      if (typeEntriesCats[m]) {
        if (d.shelterType === 'Público') typeEntriesCats[m].publico += val;
        if (d.shelterType === 'Privado') typeEntriesCats[m].privado += val;
        if (d.shelterType === 'Misto') typeEntriesCats[m].misto += val;
        if (d.shelterType === 'LT-PI') typeEntriesCats[m].ltpi += val;
      }
    });

    const catTypeRows = Object.values(typeEntriesCats).map(m => [m.label, m.publico, m.privado, m.misto, m.ltpi]);
    const catTypeTotals = ['TOTAL', ...catTypeRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Público', 'Privado', 'Misto', 'LT-PI'], catTypeRows, catTypeTotals);

    // ═══════════════════════════════════════════════════════════════════════════
    // SEÇÃO: SAÍDA DE ANIMAIS ↓
    // ═══════════════════════════════════════════════════════════════════════════
    printHeader('↓ SAÍDA DE ANIMAIS');

    // Gráfico: Saídas por Espécie
    printSubHeader('Saídas por Espécie (Cães vs Gatos)');

    const exitsBySpecies = {};
    MONTH_LABELS.forEach((label, i) => { exitsBySpecies[i + 1] = { label, dogs: 0, cats: 0 }; });
    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      if (exitsBySpecies[m]) {
        exitsBySpecies[m].dogs += parseNumber(d.adocoes_caes) + parseNumber(d.mortes_naturais_caes) + parseNumber(d.eutanasias_caes);
        exitsBySpecies[m].cats += parseNumber(d.adocoes_gatos) + parseNumber(d.mortes_naturais_gatos) + parseNumber(d.eutanasias_gatos);
      }
    });

    const exitsRows = Object.values(exitsBySpecies).map(m => [m.label, m.dogs, m.cats, m.dogs + m.cats]);
    const exitsTotals = ['TOTAL', ...exitsRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Cães', 'Gatos', 'Total'], exitsRows, exitsTotals);

    // Gráfico: Saída por Classificação - CÃO
    printSubHeader('Saída por Classificação (cão)');

    const outcomesDogs = {};
    MONTH_LABELS.forEach((label, i) => { outcomesDogs[i + 1] = { label, adocoes: 0, mortes: 0, eutanasias: 0, retTutor: 0, retLocal: 0 }; });
    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      if (outcomesDogs[m]) {
        outcomesDogs[m].adocoes += parseNumber(d.adocoes_caes);
        outcomesDogs[m].mortes += parseNumber(d.mortes_naturais_caes);
        outcomesDogs[m].eutanasias += parseNumber(d.eutanasias_caes);
        outcomesDogs[m].retTutor += parseNumber(d.retorno_de_caes);
        outcomesDogs[m].retLocal += parseNumber(d.retorno_local_caes);
      }
    });

    const outDogsRows = Object.values(outcomesDogs).map(m => [m.label, m.adocoes, m.mortes, m.eutanasias, m.retTutor, m.retLocal]);
    const outDogsTotals = ['TOTAL', ...outDogsRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Adoções', 'Mortes', 'Eutas', 'RetTutor', 'RetLocal'], outDogsRows, outDogsTotals);

    // Gráfico: Saída por Classificação - GATO
    printSubHeader('Saída por Classificação (gato)');

    const outcomesCats = {};
    MONTH_LABELS.forEach((label, i) => { outcomesCats[i + 1] = { label, adocoes: 0, mortes: 0, eutanasias: 0, retTutor: 0, retLocal: 0 }; });
    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      if (outcomesCats[m]) {
        outcomesCats[m].adocoes += parseNumber(d.adocoes_gatos);
        outcomesCats[m].mortes += parseNumber(d.mortes_naturais_gatos);
        outcomesCats[m].eutanasias += parseNumber(d.eutanasias_gatos);
        outcomesCats[m].retTutor += parseNumber(d.retorno_de_gatos);
        outcomesCats[m].retLocal += parseNumber(d.retorno_local_gatos);
      }
    });

    const outCatsRows = Object.values(outcomesCats).map(m => [m.label, m.adocoes, m.mortes, m.eutanasias, m.retTutor, m.retLocal]);
    const outCatsTotals = ['TOTAL', ...outCatsRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Adoções', 'Mortes', 'Eutas', 'RetTutor', 'RetLocal'], outCatsRows, outCatsTotals);

    // Gráfico: Saídas por Tipo de Abrigo
    printSubHeader('Saídas por Tipo de Abrigo');

    const exitsByType = {};
    MONTH_LABELS.forEach((label, i) => { exitsByType[i + 1] = { label, publico: 0, privado: 0, misto: 0, ltpi: 0 }; });
    enrichedDynamics.forEach(d => {
      const m = parseMonth(d.reference_date);
      const val = parseNumber(d.adocoes_caes) + parseNumber(d.mortes_naturais_caes) + parseNumber(d.eutanasias_caes) +
                  parseNumber(d.adocoes_gatos) + parseNumber(d.mortes_naturais_gatos) + parseNumber(d.eutanasias_gatos) +
                  parseNumber(d.retorno_de_caes) + parseNumber(d.retorno_de_gatos) +
                  parseNumber(d.retorno_local_caes) + parseNumber(d.retorno_local_gatos);
      if (exitsByType[m]) {
        if (d.shelterType === 'Público') exitsByType[m].publico += val;
        if (d.shelterType === 'Privado') exitsByType[m].privado += val;
        if (d.shelterType === 'Misto') exitsByType[m].misto += val;
        if (d.shelterType === 'LT-PI') exitsByType[m].ltpi += val;
      }
    });

    const exitTypeRows = Object.values(exitsByType).map(m => [m.label, m.publico, m.privado, m.misto, m.ltpi]);
    const exitTypeTotals = ['TOTAL', ...exitTypeRows.reduce((acc, row) => row.slice(1).map((v, i) => (acc[i] || 0) + v), [])];
    printTable(['Mês', 'Público', 'Privado', 'Misto', 'LT-PI'], exitTypeRows, exitTypeTotals);

    // ═══════════════════════════════════════════════════════════════════════════
    // INFORMAÇÕES ADICIONAIS
    // ═══════════════════════════════════════════════════════════════════════════
    printHeader('ABRIGOS CADASTRADOS EM ' + YEAR);

    if (sheltersYear.length === 0) {
      console.log(`\n    Nenhum abrigo cadastrado em ${YEAR}`);
    } else {
      const shelterRows = sheltersYear
        .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
        .map((s, i) => [
          i + 1,
          formatDate(s.created_at),
          s.state || '--',
          normalizeShelterType(s.shelter_type) || '--',
          (s.name || 'Sem nome').substring(0, 35)
        ]);
      printTable(['#', 'Data', 'UF', 'Tipo', 'Nome'], shelterRows);
    }

    // Resumo final
    console.log('\n');
    console.log('  ═══════════════════════════════════════════════════════════════════════════');
    console.log('  ✅ Relatório gerado com sucesso!');
    console.log('');
    console.log('  💡 Para comparar: Acesse /banco-de-dados e selecione o filtro de ano ' + YEAR);
    console.log('');
    console.log('  📌 Uso: node scripts/queries/report-shelters.js [ano]');
    console.log('  ═══════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n  ❌ Erro:', error.message);
    process.exit(1);
  }
}

generateReport();
