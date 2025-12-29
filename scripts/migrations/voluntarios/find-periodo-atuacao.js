/**
 * Script para encontrar os nomes corretos dos campos periodo e atuacao
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

async function findMetaKeys() {
  console.log('\n🔍 Buscando meta_keys que podem ser periodo ou atuacao...\n');

  // Buscar meta_keys únicos que contenham palavras relacionadas
  const { data: metaKeys } = await supabase
    .from('wp_postmeta_raw')
    .select('meta_key')
    .or('meta_key.ilike.%periodo%,meta_key.ilike.%atuacao%,meta_key.ilike.%remoto%,meta_key.ilike.%presencial%,meta_key.ilike.%diario%,meta_key.ilike.%forma%,meta_key.ilike.%disponibilidade%')
    .limit(100);

  const uniqueKeys = [...new Set(metaKeys?.map(m => m.meta_key) || [])];

  console.log('📋 Meta_keys encontrados:\n');
  uniqueKeys.forEach(key => {
    console.log(`   - ${key}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Buscar exemplos de valores para cada meta_key
  console.log('📊 Exemplos de valores:\n');

  for (const key of uniqueKeys) {
    const { data: examples } = await supabase
      .from('wp_postmeta_raw')
      .select('meta_value')
      .eq('meta_key', key)
      .not('meta_value', 'is', null)
      .limit(5);

    const values = [...new Set(examples?.map(e => e.meta_value) || [])];
    console.log(`   ${key}:`);
    values.forEach(v => console.log(`      → ${v}`));
    console.log('');
  }

  process.exit(0);
}

findMetaKeys();
