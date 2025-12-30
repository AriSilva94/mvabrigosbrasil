/**
 * Script para limpar voluntários migrados (com wp_post_id preenchido)
 *
 * ATENÇÃO: Este script deleta dados! Use com cuidado.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../.env.local');
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearMigratedVolunteers() {
  console.log('\n⚠️  ATENÇÃO: Este script vai deletar todos os voluntários com wp_post_id!\n');

  // Contar quantos serão deletados
  const { count } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .not('wp_post_id', 'is', null);

  console.log(`📊 Total de voluntários a serem deletados: ${count || 0}\n`);

  if (!count || count === 0) {
    console.log('✅ Nenhum voluntário migrado encontrado. Nada a fazer.\n');
    process.exit(0);
  }

  // Confirmar
  console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('🗑️  Deletando registros...\n');

  const { error } = await supabase
    .from('volunteers')
    .delete()
    .not('wp_post_id', 'is', null);

  if (error) {
    console.error('❌ Erro ao deletar:', error);
    process.exit(1);
  }

  console.log(`✅ ${count} voluntários deletados com sucesso!\n`);
  process.exit(0);
}

clearMigratedVolunteers();
