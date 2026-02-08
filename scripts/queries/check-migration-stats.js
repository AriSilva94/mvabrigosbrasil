/**
 * Script para verificar estatísticas de migração e crescimento
 *
 * Objetivo: Mostrar para os stakeholders que:
 * 1. A migração está funcionando (usuários legados conseguem fazer login)
 * 2. O sistema está crescendo (novos cadastros de abrigos e voluntários)
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
  throw new Error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkMigrationStats() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          RELATÓRIO DE MIGRAÇÃO E CRESCIMENTO                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // ==================== MIGRAÇÃO (Usuários Legados) ====================

    // Total de usuários legados que podem fazer login com senha antiga
    const { count: totalLegacyUsers, error: err1 } = await supabase
      .from('wp_users_legacy')
      .select('*', { count: 'exact', head: true });
    if (err1) throw err1;

    // Usuários legados que já fizeram login no novo sistema
    const { count: legacyLoggedIn, error: err2 } = await supabase
      .from('wp_users_legacy')
      .select('*', { count: 'exact', head: true })
      .eq('migrated', true);
    if (err2) throw err2;

    // Últimos usuários legados que fizeram login
    const { data: recentLegacyLogins, error: err3 } = await supabase
      .from('wp_users_legacy')
      .select('user_email, display_name, migrated_at')
      .eq('migrated', true)
      .order('migrated_at', { ascending: false })
      .limit(5);
    if (err3) throw err3;

    // ==================== NOVOS CADASTROS ====================

    // Novos abrigos (sem wp_post_id = criados no novo sistema)
    const { count: newShelters, error: err4 } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true })
      .is('wp_post_id', null);
    if (err4) throw err4;

    // Novos voluntários (sem wp_post_id = criados no novo sistema)
    const { count: newVolunteers, error: err5 } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
      .is('wp_post_id', null);
    if (err5) throw err5;

    // Últimos abrigos cadastrados no novo sistema
    const { data: recentNewShelters, error: err6 } = await supabase
      .from('shelters')
      .select('name, city, created_at')
      .is('wp_post_id', null)
      .order('created_at', { ascending: false })
      .limit(5);
    if (err6) throw err6;

    // Últimos voluntários cadastrados no novo sistema
    const { data: recentNewVolunteers, error: err7 } = await supabase
      .from('volunteers')
      .select('name, cidade, created_at')
      .is('wp_post_id', null)
      .order('created_at', { ascending: false })
      .limit(5);
    if (err7) throw err7;

    // ==================== TOTAIS GERAIS ====================

    const { count: totalShelters } = await supabase
      .from('shelters')
      .select('*', { count: 'exact', head: true });

    const { count: totalVolunteers } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true });

    // Taxa de migração
    const migrationRate = totalLegacyUsers > 0
      ? ((legacyLoggedIn / totalLegacyUsers) * 100).toFixed(1)
      : 0;

    // ==================== EXIBIR RESULTADOS ====================

    // Números de destaque
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  🎯 NÚMEROS DE DESTAQUE                                         │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│                                                                 │`);
    console.log(`│     ✅ ${String(legacyLoggedIn).padStart(3)} usuários legados já fizeram login no novo sistema  │`);
    console.log(`│     🏠 ${String(newShelters).padStart(3)} novos abrigos cadastrados                            │`);
    console.log(`│     🙋 ${String(newVolunteers).padStart(3)} novos voluntários cadastrados                         │`);
    console.log(`│                                                                 │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    // Migração de usuários legados
    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  🔄 MIGRAÇÃO DE USUÁRIOS LEGADOS                                │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│  Total de usuários do sistema antigo:     ${String(totalLegacyUsers).padStart(6)}              │`);
    console.log(`│  ✅ Já fizeram login no novo sistema:     ${String(legacyLoggedIn).padStart(6)}              │`);
    console.log(`│  ⏳ Ainda não fizeram login:              ${String(totalLegacyUsers - legacyLoggedIn).padStart(6)}              │`);
    console.log(`│  📈 Taxa de migração:                     ${String(migrationRate + '%').padStart(6)}              │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    if (recentLegacyLogins && recentLegacyLogins.length > 0) {
      console.log('\n  Últimos logins de usuários legados:');
      recentLegacyLogins.forEach(user => {
        const date = user.migrated_at
          ? new Date(user.migrated_at).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })
          : 'N/A';
        const email = user.user_email?.substring(0, 35) || 'N/A';
        console.log(`    ${date} - ${email}`);
      });
    }

    // Novos cadastros
    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  ✨ NOVOS CADASTROS (após migração)                             │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│  🏠 Novos abrigos:                        ${String(newShelters).padStart(6)}              │`);
    console.log(`│  🙋 Novos voluntários:                    ${String(newVolunteers).padStart(6)}              │`);
    console.log(`│  📊 Total de novos cadastros:             ${String(newShelters + newVolunteers).padStart(6)}              │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    if (recentNewShelters && recentNewShelters.length > 0) {
      console.log('\n  Últimos abrigos cadastrados:');
      recentNewShelters.forEach(shelter => {
        const date = shelter.created_at
          ? new Date(shelter.created_at).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })
          : 'N/A';
        const name = shelter.name?.substring(0, 30) || 'N/A';
        const city = shelter.city || '';
        console.log(`    ${date} - ${name} (${city})`);
      });
    }

    if (recentNewVolunteers && recentNewVolunteers.length > 0) {
      console.log('\n  Últimos voluntários cadastrados:');
      recentNewVolunteers.forEach(vol => {
        const date = vol.created_at
          ? new Date(vol.created_at).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })
          : 'N/A';
        const name = vol.name?.substring(0, 30) || 'N/A';
        const city = vol.cidade || '';
        console.log(`    ${date} - ${name} (${city})`);
      });
    }

    // Totais do sistema
    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  📊 TOTAIS DO SISTEMA                                           │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│  🏠 Total de abrigos:                     ${String(totalShelters).padStart(6)}              │`);
    console.log(`│  🙋 Total de voluntários:                 ${String(totalVolunteers).padStart(6)}              │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

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
      destaque: {
        usuariosLegadosLogados: legacyLoggedIn,
        novosAbrigos: newShelters,
        novosVoluntarios: newVolunteers
      },
      migracao: {
        totalUsuariosLegados: totalLegacyUsers,
        jaFizeramLogin: legacyLoggedIn,
        aindaNaoFizeramLogin: totalLegacyUsers - legacyLoggedIn,
        taxaMigracao: parseFloat(migrationRate),
        ultimosLogins: recentLegacyLogins?.map(u => ({
          email: u.user_email,
          nome: u.display_name,
          data: u.migrated_at
        })) || []
      },
      novosCadastros: {
        abrigos: newShelters,
        voluntarios: newVolunteers,
        total: newShelters + newVolunteers,
        ultimosAbrigos: recentNewShelters?.map(s => ({
          nome: s.name,
          cidade: s.city,
          data: s.created_at
        })) || [],
        ultimosVoluntarios: recentNewVolunteers?.map(v => ({
          nome: v.name,
          cidade: v.cidade,
          data: v.created_at
        })) || []
      },
      totais: {
        abrigos: totalShelters,
        voluntarios: totalVolunteers
      }
    };

    // Criar pasta output se não existir
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Gerar nome do arquivo com data
    const dateStr = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `relatorio-migracao-${dateStr}.json`);

    // Salvar arquivo
    fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2), 'utf8');

    console.log('\n✅ Relatório gerado com sucesso!');
    console.log(`📄 Arquivo exportado: ${outputPath}\n`);

  } catch (error) {
    console.error('\n❌ Erro ao gerar relatório:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

checkMigrationStats();
