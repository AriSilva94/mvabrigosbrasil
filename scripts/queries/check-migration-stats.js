/**
 * Script para verificar estatísticas de migração de usuários WordPress
 *
 * Mostra:
 * - Total de usuários legados no sistema
 * - Quantos já fizeram login (migraram)
 * - Quantos ainda não fizeram login
 * - Breakdown por tipo (abrigo, voluntário)
 * - Lista dos últimos usuários que migraram
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
  console.log('║        ESTATÍSTICAS DE MIGRAÇÃO DE USUÁRIOS LEGADOS           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Total de usuários legados
    const { count: totalCount, error: err1 } = await supabase
      .from('wp_users_legacy')
      .select('*', { count: 'exact', head: true });

    if (err1) throw err1;

    // 2. Usuários que já migraram (fizeram login)
    const { count: migratedCount, error: err2 } = await supabase
      .from('wp_users_legacy')
      .select('*', { count: 'exact', head: true })
      .eq('migrated', true);

    if (err2) throw err2;

    // 3. Usuários que ainda não migraram
    const { count: notMigratedCount, error: err3 } = await supabase
      .from('wp_users_legacy')
      .select('*', { count: 'exact', head: true })
      .eq('migrated', false);

    if (err3) throw err3;

    // 4. Total de profiles por origin
    const { data: profilesByOrigin, error: err4 } = await supabase
      .from('profiles')
      .select('origin');

    if (err4) throw err4;

    const originCounts = profilesByOrigin.reduce((acc, p) => {
      acc[p.origin] = (acc[p.origin] || 0) + 1;
      return acc;
    }, {});

    // 5. Últimas migrações (últimos 10 usuários que migraram)
    const { data: recentMigrations, error: err5 } = await supabase
      .from('wp_users_legacy')
      .select('user_email, display_name, migrated_at')
      .eq('migrated', true)
      .order('migrated_at', { ascending: false })
      .limit(10);

    if (err5) throw err5;

    // 6. Profiles migrados com seus tipos (shelter/volunteer)
    const { data: migratedProfiles, error: err6 } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        wp_user_id,
        shelters:shelters!shelters_profile_id_fkey(id),
        volunteers:volunteers!volunteers_owner_profile_id_fkey(id)
      `)
      .eq('origin', 'wordpress_migrated');

    if (err6) throw err6;

    let shelterOwners = 0;
    let volunteerOwners = 0;
    let bothTypes = 0;
    let noLinkedData = 0;

    migratedProfiles?.forEach(profile => {
      const hasShelter = profile.shelters && profile.shelters.length > 0;
      const hasVolunteer = profile.volunteers && profile.volunteers.length > 0;

      if (hasShelter && hasVolunteer) {
        bothTypes++;
      } else if (hasShelter) {
        shelterOwners++;
      } else if (hasVolunteer) {
        volunteerOwners++;
      } else {
        noLinkedData++;
      }
    });

    // Calcular taxa de migração
    const migrationRate = totalCount > 0 ? ((migratedCount / totalCount) * 100).toFixed(1) : 0;

    // Exibir resultados
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  📊 RESUMO GERAL                                                │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│  Total de usuários WordPress legados:     ${String(totalCount).padStart(6)}              │`);
    console.log(`│  ✅ Já fizeram login (migrados):          ${String(migratedCount).padStart(6)}              │`);
    console.log(`│  ⏳ Ainda não fizeram login:              ${String(notMigratedCount).padStart(6)}              │`);
    console.log(`│  📈 Taxa de migração:                     ${String(migrationRate + '%').padStart(6)}              │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  👥 PROFILES POR ORIGEM                                         │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    Object.entries(originCounts).forEach(([origin, count]) => {
      const icon = origin === 'wordpress_migrated' ? '🔄' :
                   origin === 'supabase_native' ? '✨' : '👤';
      console.log(`│  ${icon} ${origin.padEnd(25)} ${String(count).padStart(6)}              │`);
    });
    console.log('└─────────────────────────────────────────────────────────────────┘');

    console.log('\n┌─────────────────────────────────────────────────────────────────┐');
    console.log('│  🏠 USUÁRIOS MIGRADOS POR TIPO                                  │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log(`│  🏠 Donos de Abrigo:                      ${String(shelterOwners).padStart(6)}              │`);
    console.log(`│  🙋 Voluntários:                          ${String(volunteerOwners).padStart(6)}              │`);
    console.log(`│  🏠🙋 Ambos (abrigo + voluntário):        ${String(bothTypes).padStart(6)}              │`);
    console.log(`│  ❓ Sem dados vinculados:                 ${String(noLinkedData).padStart(6)}              │`);
    console.log('└─────────────────────────────────────────────────────────────────┘');

    if (recentMigrations && recentMigrations.length > 0) {
      console.log('\n┌─────────────────────────────────────────────────────────────────┐');
      console.log('│  🕐 ÚLTIMAS MIGRAÇÕES                                           │');
      console.log('├─────────────────────────────────────────────────────────────────┤');
      recentMigrations.forEach(user => {
        const date = user.migrated_at ?
          new Date(user.migrated_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A';
        const email = user.user_email?.substring(0, 30).padEnd(30) || 'N/A'.padEnd(30);
        console.log(`│  ${date}  ${email} │`);
      });
      console.log('└─────────────────────────────────────────────────────────────────┘');
    }

    console.log('\n✅ Consulta concluída!\n');

  } catch (error) {
    console.error('\n❌ Erro ao consultar estatísticas:', error.message);
    console.error('Detalhes:', error);
    process.exit(1);
  }
}

checkMigrationStats();
