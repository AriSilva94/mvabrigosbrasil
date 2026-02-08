/**
 * Script para contar voluntários novos (criados no novo sistema)
 *
 * Critério: wp_post_id IS NULL (não veio do WordPress)
 *
 * Uso: node scripts/queries/count-new-volunteers.js
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

async function countNewVolunteers() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           NOVOS VOLUNTÁRIOS (criados no novo sistema)          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Total de voluntários novos (sem wp_post_id = não veio do WordPress)
    const { count: totalNew, error: err1 } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
      .is('wp_post_id', null);

    if (err1) throw err1;

    // Total geral de voluntários
    const { count: totalAll, error: err1b } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true });

    if (err1b) throw err1b;

    // Voluntários novos por estado
    const { data: volunteersByState, error: err2 } = await supabase
      .from('volunteers')
      .select('estado')
      .is('wp_post_id', null);

    if (err2) throw err2;

    const stateCounts = volunteersByState.reduce((acc, v) => {
      const state = v.estado?.toUpperCase() || 'N/A';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    // Voluntários novos por cidade
    const { data: volunteersByCity, error: err3 } = await supabase
      .from('volunteers')
      .select('cidade, estado')
      .is('wp_post_id', null);

    if (err3) throw err3;

    const cityCounts = volunteersByCity.reduce((acc, v) => {
      const city = v.cidade || 'N/A';
      const state = v.estado?.toUpperCase() || '';
      const key = state ? `${city} (${state})` : city;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Últimos 10 voluntários cadastrados
    const { data: recentVolunteers, error: err4 } = await supabase
      .from('volunteers')
      .select('name, cidade, estado, created_at')
      .is('wp_post_id', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (err4) throw err4;

    // Exibir resultados
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  📊 RESUMO                                                      │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│  🙋 Novos voluntários cadastrados:        ${String(totalNew).padStart(6)}              │`);
    console.log(`│  📁 Total de voluntários no sistema:      ${String(totalAll).padStart(6)}              │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    if (Object.keys(stateCounts).length > 0) {
      console.log('\n┌─────────────────────────────────────────────────────────────────┐');
      console.log('│  🗺️  POR ESTADO                                                  │');
      console.log('├─────────────────────────────────────────────────────────────────┤');
      Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([state, count]) => {
          console.log(`│  ${state.padEnd(30)} ${String(count).padStart(6)}              │`);
        });
      console.log('└─────────────────────────────────────────────────────────────────┘');
    }

    if (Object.keys(cityCounts).length > 0) {
      console.log('\n┌─────────────────────────────────────────────────────────────────┐');
      console.log('│  🏙️  POR CIDADE                                                  │');
      console.log('├─────────────────────────────────────────────────────────────────┤');
      Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([city, count]) => {
          console.log(`│  ${city.substring(0, 30).padEnd(30)} ${String(count).padStart(6)}              │`);
        });
      console.log('└─────────────────────────────────────────────────────────────────┘');
    }

    if (recentVolunteers && recentVolunteers.length > 0) {
      console.log('\n  Últimos voluntários cadastrados:');
      recentVolunteers.forEach((vol, i) => {
        const date = formatDate(vol.created_at);
        const name = (vol.name || 'Sem nome').substring(0, 25);
        const location = vol.cidade && vol.estado
          ? `${vol.cidade}/${vol.estado}`
          : (vol.estado || '');
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
        novosVoluntarios: totalNew,
        totalVoluntarios: totalAll
      },
      porEstado: Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([estado, quantidade]) => ({
          estado,
          quantidade
        })),
      porCidade: Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([cidade, quantidade]) => ({
          cidade,
          quantidade
        })),
      ultimosCadastros: recentVolunteers?.map(v => ({
        nome: v.name,
        cidade: v.cidade,
        estado: v.estado,
        data: v.created_at
      })) || []
    };

    // Criar pasta output se não existir
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Gerar nome do arquivo com data
    const dateStr = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `novos-voluntarios-${dateStr}.json`);

    // Salvar arquivo
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), 'utf8');

    console.log('\n✅ Relatório gerado com sucesso!');
    console.log(`📄 Arquivo exportado: ${outputPath}\n`);

  } catch (error) {
    console.error('\n❌ Erro ao consultar voluntários:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

countNewVolunteers();
