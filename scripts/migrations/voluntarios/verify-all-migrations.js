/**
 * Script para verificar aleatoriamente alguns voluntários migrados
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function verifyMigrations() {
  console.log('\n🔍 Verificando qualidade da migração...\n');

  // Buscar estatísticas gerais
  const { count: total } = await supabase
    .from('volunteers')
    .select('*', { count: 'exact', head: true })
    .not('wp_post_id', 'is', null);

  console.log(`📊 Total de voluntários migrados: ${total}\n`);

  // Verificar campos NULL
  const fields = ['telefone', 'cidade', 'estado', 'profissao', 'periodo', 'atuacao', 'disponibilidade', 'experiencia'];

  console.log('📋 Estatísticas de campos preenchidos:\n');

  for (const field of fields) {
    const { count: nullCount } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
      .not('wp_post_id', 'is', null)
      .is(field, null);

    const { count: filledCount } = await supabase
      .from('volunteers')
      .select('*', { count: 'exact', head: true })
      .not('wp_post_id', 'is', null)
      .not(field, 'is', null);

    const percentage = total > 0 ? ((filledCount / total) * 100).toFixed(1) : '0.0';
    console.log(`   ${field.padEnd(20)} - Preenchidos: ${filledCount}/${total} (${percentage}%)`);
  }

  // Buscar 5 voluntários aleatórios para verificação manual
  console.log('\n🎲 Amostra aleatória de 5 voluntários:\n');

  const { data: randomSample } = await supabase
    .from('volunteers')
    .select('wp_post_id, name, telefone, cidade, estado, periodo, atuacao')
    .not('wp_post_id', 'is', null)
    .limit(5);

  randomSample?.forEach((v, i) => {
    console.log(`${i + 1}. ${v.name} (wp_post_id: ${v.wp_post_id})`);
    console.log(`   Telefone: ${v.telefone || '(vazio)'}`);
    console.log(`   Cidade: ${v.cidade || '(vazio)'}, ${v.estado || '(vazio)'}`);
    console.log(`   Período: ${v.periodo || '(vazio)'}, Atuação: ${v.atuacao || '(vazio)'}\n`);
  });

  console.log('✅ Verificação concluída!\n');
  process.exit(0);
}

verifyMigrations();
