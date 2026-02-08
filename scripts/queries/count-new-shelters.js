/**
 * Script para contar abrigos novos (criados no novo sistema)
 *
 * Critério: wp_post_id IS NULL (não veio do WordPress)
 *
 * Uso: node scripts/queries/count-new-shelters.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
function loadEnvFile() {
  const envPath = path.join(__dirname, '../../.env.local');

  if (!fs.existsSync(envPath)) {
    throw new Error('Arquivo .env.local não encontrado na raiz do projeto');
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function formatDate(dateStr) {
  if (!dateStr) return '--/--/----';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

async function countNewShelters() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║              NOVOS ABRIGOS (criados no novo sistema)           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Total de abrigos novos (sem wp_post_id = não veio do WordPress)
    const { count: totalNew, error: err1 } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true })
      .is('wp_post_id', null);

    if (err1) throw err1;

    // Total geral de abrigos
    const { count: totalAll, error: err1b } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true });

    if (err1b) throw err1b;

    // Abrigos novos por tipo
    const { data: sheltersByType, error: err2 } = await supabase
      .from('shelters')
      .select('shelter_type')
      .is('wp_post_id', null);

    if (err2) throw err2;

    const typeCounts = sheltersByType.reduce((acc, s) => {
      const type = s.shelter_type || 'nao_definido';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Abrigos novos por estado
    const { data: sheltersByState, error: err3 } = await supabase
      .from('shelters')
      .select('state')
      .is('wp_post_id', null);

    if (err3) throw err3;

    const stateCounts = sheltersByState.reduce((acc, s) => {
      const state = s.state?.toUpperCase() || 'N/A';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    // Últimos 10 abrigos cadastrados
    const { data: recentShelters, error: err4 } = await supabase
      .from('shelters')
      .select('name, city, state, shelter_type, created_at')
      .is('wp_post_id', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (err4) throw err4;

    // Exibir resultados
    const typeLabels = {
      'public': 'Público',
      'private': 'Privado',
      'mixed': 'Misto',
      'temporary': 'LT-PI',
      'nao_definido': 'Não definido'
    };

    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  📊 RESUMO                                                      │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│  🏠 Novos abrigos cadastrados:            ${String(totalNew).padStart(6)}              │`);
    console.log(`│  📁 Total de abrigos no sistema:          ${String(totalAll).padStart(6)}              │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  📋 POR TIPO                                                    │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const label = typeLabels[type] || type;
        console.log(`│  ${label.padEnd(30)} ${String(count).padStart(6)}              │`);
      });
    console.log('└─────────────────────────────────────────────────────────────────┘');

    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  🗺️  POR ESTADO                                                  │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([state, count]) => {
        console.log(`│  ${state.padEnd(30)} ${String(count).padStart(6)}              │`);
      });
    console.log('└─────────────────────────────────────────────────────────────────┘');

    if (recentShelters && recentShelters.length > 0) {
      console.log('\n  Últimos abrigos cadastrados:');
      recentShelters.forEach((shelter, i) => {
        const date = formatDate(shelter.created_at);
        const name = (shelter.name || 'Sem nome').substring(0, 30);
        const location = shelter.city && shelter.state
          ? `${shelter.city}/${shelter.state}`
          : (shelter.state || '');
        console.log(`    ${String(i + 1).padStart(2)}. ${date} - ${name} (${location})`);
      });
    }

    // ==================== EXPORTAR JSON ====================

    const reportData = {
      geradoEm: new Date().toISOString(),
      dataFormatada: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      resumo: {
        novosAbrigos: totalNew,
        totalAbrigos: totalAll
      },
      porTipo: Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tipo, quantidade]) => ({
          tipo,
          label: typeLabels[tipo] || tipo,
          quantidade
        })),
      porEstado: Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([estado, quantidade]) => ({
          estado,
          quantidade
        })),
      ultimosCadastros: recentShelters?.map(s => ({
        nome: s.name,
        cidade: s.city,
        estado: s.state,
        tipo: s.shelter_type,
        data: s.created_at
      })) || []
    };

    // Criar pasta output se não existir
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Gerar nome do arquivo com data
    const dateStr = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `novos-abrigos-${dateStr}.json`);

    // Salvar arquivo
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), 'utf8');

    console.log('\n✅ Relatório gerado com sucesso!');
    console.log(`📄 Arquivo exportado: ${outputPath}\n`);

  } catch (error) {
    console.error('\n❌ Erro ao consultar abrigos:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

countNewShelters();
