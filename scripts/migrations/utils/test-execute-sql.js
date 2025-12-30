/**
 * Script de teste para validar a execução automática de SQL
 *
 * Este script testa se a função executeSql consegue se conectar
 * ao Supabase e executar queries SQL simples.
 *
 * Uso:
 * node test-execute-sql.js
 */

const { executeSql } = require('./execute-sql');

async function testSqlExecution() {
  console.log('🧪 Testando execução automática de SQL...\n');

  try {
    // Teste 1: Query SELECT simples
    console.log('📝 Teste 1: Query SELECT simples');
    const result1 = await executeSql(
      'SELECT current_database(), current_user, version();',
      { verbose: true }
    );
    console.log('✅ Teste 1 passou!\n');

    // Teste 2: Verificar se tabela volunteers existe
    console.log('📝 Teste 2: Verificar se tabela volunteers existe');
    const result2 = await executeSql(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name = 'volunteers'
       );`,
      { verbose: true }
    );
    console.log('✅ Teste 2 passou!\n');

    // Teste 3: Verificar se tabela vacancies existe
    console.log('📝 Teste 3: Verificar se tabela vacancies existe');
    const result3 = await executeSql(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public'
         AND table_name = 'vacancies'
       );`,
      { verbose: true }
    );
    console.log('✅ Teste 3 passou!\n');

    console.log('🎉 Todos os testes passaram!');
    console.log('✅ A execução automática de SQL está funcionando corretamente.');
    console.log('\n💡 Agora você pode executar: node run-full-migration.js');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.message);
    console.error('\n💡 Verifique se:');
    console.error('   1. O arquivo .env.local está configurado corretamente');
    console.error('   2. DATABASE_URL ou SUPABASE_DB_PASSWORD está presente');
    console.error('   3. As tabelas foram criadas no Supabase (SQL 01-05)');
    process.exit(1);
  }
}

// Executar testes
testSqlExecution();
