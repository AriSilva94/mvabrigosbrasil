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

(async () => {
  console.log('Procurando abrigos com bairro, CEP ou CNPJ preenchidos no WordPress...\n');

  // Buscar TODOS os abrigos
  const { data: shelters } = await supabase
    .from('shelters')
    .select('wp_post_id, name')
    .not('wp_post_id', 'is', null);

  console.log(`Verificando ${shelters.length} abrigos...\n`);

  const comBairro = [];
  const comCep = [];
  const comCnpj = [];

  for (const shelter of shelters) {
    const { data: metas } = await supabase
      .from('wp_postmeta_raw')
      .select('meta_key, meta_value')
      .eq('post_id', shelter.wp_post_id)
      .in('meta_key', ['bairro', 'cep', 'cnpj']);

    metas?.forEach(m => {
      const valor = m.meta_value;
      // Verificar se tem valor real (não null, não "null", não vazio)
      if (valor && valor.trim() !== '' && valor.toLowerCase() !== 'null') {
        if (m.meta_key === 'bairro') comBairro.push({ ...shelter, valor });
        if (m.meta_key === 'cep') comCep.push({ ...shelter, valor });
        if (m.meta_key === 'cnpj') comCnpj.push({ ...shelter, valor });
      }
    });
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Abrigos com BAIRRO: ${comBairro.length}`);
  if (comBairro.length > 0) {
    console.log('Exemplos:');
    comBairro.slice(0, 5).forEach(s => {
      console.log(`  - ${s.name} (${s.wp_post_id}): "${s.valor}"`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`Abrigos com CEP: ${comCep.length}`);
  if (comCep.length > 0) {
    console.log('Exemplos:');
    comCep.slice(0, 5).forEach(s => {
      console.log(`  - ${s.name} (${s.wp_post_id}): "${s.valor}"`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`Abrigos com CNPJ: ${comCnpj.length}`);
  if (comCnpj.length > 0) {
    console.log('Exemplos:');
    comCnpj.slice(0, 5).forEach(s => {
      console.log(`  - ${s.name} (${s.wp_post_id}): "${s.valor}"`);
    });
  }

  // Verificar se foram migrados
  if (comBairro.length > 0) {
    const primeiro = comBairro[0];
    const { data: migrado } = await supabase
      .from('shelters')
      .select('district, name')
      .eq('wp_post_id', primeiro.wp_post_id)
      .single();

    console.log('\n\nVERIFICAÇÃO DE MIGRAÇÃO (primeiro com bairro):');
    console.log(`  WP tinha: "${primeiro.valor}"`);
    console.log(`  Migrado tem: "${migrado?.district}"`);
    console.log(`  Status: ${migrado?.district ? '✅ OK' : '❌ PERDIDO'}`);
  }
})();
