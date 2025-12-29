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
  console.log('Verificando status do trigger de histórico de shelters...\n');

  // Verificar se a tabela shelter_history existe
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', '%history%');

  if (tablesError) {
    console.log('Erro ao buscar tabelas:', tablesError.message);
  } else {
    console.log('Tabelas de histórico encontradas:');
    tables?.forEach(t => console.log(`  - ${t.table_name}`));
  }

  // Verificar registros na tabela shelter_history
  const { count: historyCount, error: countError } = await supabase
    .from('shelter_history')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('\n❌ Erro ao acessar shelter_history:', countError.message);
    console.log('   A tabela pode não existir ou não ter permissões');
  } else {
    console.log(`\n✅ Tabela shelter_history existe`);
    console.log(`   Total de registros: ${historyCount}`);
  }

  // Testar se o trigger está funcionando fazendo um update
  console.log('\n🧪 Testando se o trigger está ativo...\n');

  const { data: testShelter } = await supabase
    .from('shelters')
    .select('id, name, website')
    .limit(1)
    .single();

  if (!testShelter) {
    console.log('❌ Nenhum shelter encontrado para teste');
    return;
  }

  console.log(`   Testando com: ${testShelter.name}`);

  // Fazer um update trivial
  const originalWebsite = testShelter.website;
  const testWebsite = originalWebsite ? `${originalWebsite} (teste)` : 'https://teste.com';

  const { error: updateError } = await supabase
    .from('shelters')
    .update({ website: testWebsite })
    .eq('id', testShelter.id);

  if (updateError) {
    console.log('   ❌ Erro ao atualizar:', updateError.message);
    return;
  }

  // Esperar um pouco para o trigger processar
  await new Promise(resolve => setTimeout(resolve, 500));

  // Verificar se foi criado registro no histórico
  const { data: historyRecord } = await supabase
    .from('shelter_history')
    .select('*')
    .eq('shelter_id', testShelter.id)
    .order('changed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historyRecord) {
    console.log('\n   ✅ Trigger ESTÁ FUNCIONANDO!');
    console.log(`   Último registro de histórico em: ${historyRecord.changed_at}`);
  } else {
    console.log('\n   ❌ Trigger NÃO está funcionando');
    console.log('   Nenhum registro de histórico foi criado');
  }

  // Reverter o update de teste
  await supabase
    .from('shelters')
    .update({ website: originalWebsite })
    .eq('id', testShelter.id);

  console.log('\n   Update de teste revertido');
})();
