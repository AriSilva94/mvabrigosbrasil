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
  console.log('Buscando abrigos com campos específicos preenchidos...\n');

  // Buscar metadados que tenham bairro
  const { data: metasBairro } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_value')
    .eq('meta_key', 'bairro')
    .not('meta_value', 'is', null)
    .neq('meta_value', '')
    .neq('meta_value', 'null')
    .limit(5);

  console.log(`Abrigos com BAIRRO: ${metasBairro?.length || 0}`);
  if (metasBairro && metasBairro.length > 0) {
    for (const meta of metasBairro) {
      const { data: post } = await supabase
        .from('wp_posts_raw')
        .select('post_title')
        .eq('id', meta.post_id)
        .single();

      console.log(`  - ${post?.post_title} (${meta.post_id}): "${meta.meta_value}"`);
    }
  }

  // Buscar metadados que tenham cep
  const { data: metasCep } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_value')
    .eq('meta_key', 'cep')
    .not('meta_value', 'is', null)
    .neq('meta_value', '')
    .neq('meta_value', 'null')
    .limit(5);

  console.log(`\nAbrigos com CEP: ${metasCep?.length || 0}`);
  if (metasCep && metasCep.length > 0) {
    for (const meta of metasCep) {
      const { data: post } = await supabase
        .from('wp_posts_raw')
        .select('post_title')
        .eq('id', meta.post_id)
        .single();

      console.log(`  - ${post?.post_title} (${meta.post_id}): "${meta.meta_value}"`);
    }
  }

  // Buscar metadados que tenham cnpj
  const { data: metasCnpj } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_value')
    .eq('meta_key', 'cnpj')
    .not('meta_value', 'is', null)
    .neq('meta_value', '')
    .neq('meta_value', 'null')
    .limit(5);

  console.log(`\nAbrigos com CNPJ: ${metasCnpj?.length || 0}`);
  if (metasCnpj && metasCnpj.length > 0) {
    for (const meta of metasCnpj) {
      const { data: post } = await supabase
        .from('wp_posts_raw')
        .select('post_title')
        .eq('id', meta.post_id)
        .single();

      console.log(`  - ${post?.post_title} (${meta.post_id}): "${meta.meta_value}"`);
    }
  }

  // Buscar metadados que tenham cpf
  const { data: metasCpf } = await supabase
    .from('wp_postmeta_raw')
    .select('post_id, meta_value')
    .eq('meta_key', 'cpf')
    .not('meta_value', 'is', null)
    .neq('meta_value', '')
    .neq('meta_value', 'null')
    .limit(5);

  console.log(`\nAbrigos com CPF: ${metasCpf?.length || 0}`);
  if (metasCpf && metasCpf.length > 0) {
    for (const meta of metasCpf) {
      const { data: post } = await supabase
        .from('wp_posts_raw')
        .select('post_title')
        .eq('id', meta.post_id)
        .single();

      console.log(`  - ${post?.post_title} (${meta.post_id}): "${meta.meta_value}"`);
    }
  }

  // Verificar se algum foi migrado
  if (metasBairro && metasBairro.length > 0) {
    const exemplo = metasBairro[0];
    const { data: migrado } = await supabase
      .from('shelters')
      .select('district, name')
      .eq('wp_post_id', exemplo.post_id)
      .single();

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('TESTE DE MIGRAÇÃO - Bairro:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`wp_post_id: ${exemplo.post_id}`);
    console.log(`WP tinha bairro: "${exemplo.meta_value}"`);
    console.log(`Migrado tem district: "${migrado?.district}"`);
    console.log(`Status: ${migrado?.district === exemplo.meta_value ? '✅ OK' : '❌ PERDIDO'}`);
  }
})();
