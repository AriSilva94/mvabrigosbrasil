/**
 * Utilitário para executar SQL diretamente no Supabase via API
 *
 * Permite executar queries SQL programaticamente usando a Service Role Key,
 * eliminando a necessidade de pausas manuais durante a migração.
 *
 * Uso:
 * const { executeSql } = require('./utils/execute-sql');
 * await executeSql('ALTER TABLE volunteers ADD COLUMN slug TEXT;');
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Carrega variáveis de ambiente do arquivo .env.local
 */
function loadEnvFile() {
  const envPath = path.join(__dirname, '../../../.env.local');

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

// Carregar variáveis de ambiente
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

/**
 * Executa uma query SQL no Supabase usando a API REST
 *
 * @param {string} sql - Query SQL para executar
 * @param {object} options - Opções adicionais
 * @param {boolean} options.verbose - Se true, mostra logs detalhados
 * @returns {Promise<object>} Resultado da execução
 */
async function executeSql(sql, options = {}) {
  const { verbose = true } = options;

  if (verbose) {
    console.log('\n🔧 Executando SQL:');
    console.log('─'.repeat(80));
    console.log(sql.trim());
    console.log('─'.repeat(80));
  }

  try {
    // Usar o endpoint RPC do Supabase para executar SQL
    // Nota: Isso requer que você tenha uma função RPC no Supabase
    // Alternativamente, usamos o client direto quando possível

    // Para queries DDL (ALTER TABLE, CREATE INDEX, etc), precisamos usar
    // a API REST diretamente via fetch
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    // Se a função exec_sql não existir, tentamos uma abordagem alternativa
    if (response.status === 404) {
      if (verbose) {
        console.log('⚠️  Função exec_sql não encontrada, usando abordagem alternativa...');
      }

      // Para comandos DDL específicos, podemos usar o postgres REST API
      // Mas isso é limitado. A melhor opção é executar via pg client
      return await executeSqlViaPgClient(sql, { verbose });
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao executar SQL: ${response.status} - ${error}`);
    }

    const result = await response.json();

    if (verbose) {
      console.log('✅ SQL executado com sucesso!');
      if (result && Object.keys(result).length > 0) {
        console.log('Resultado:', JSON.stringify(result, null, 2));
      }
    }

    return { success: true, result };

  } catch (error) {
    if (verbose) {
      console.error('❌ Erro ao executar SQL:', error.message);
    }
    throw error;
  }
}

/**
 * Executa SQL usando o cliente PostgreSQL diretamente
 * Esta é a abordagem mais robusta para queries DDL
 */
async function executeSqlViaPgClient(sql, options = {}) {
  const { verbose = true } = options;

  try {
    // Usar o Supabase client com uma query raw
    // O Supabase JS não expõe execução de SQL arbitrário por segurança,
    // então precisamos usar a funcionalidade de RPC ou criar uma função helper

    // Por enquanto, vamos usar o método mais direto: postgres.js ou pg
    const { Pool } = require('pg');

    // Extrair as credenciais da connection string do Supabase
    // Formato: postgresql://[user]:[password]@[host]:[port]/[database]
    const connectionString = process.env.DATABASE_URL || buildConnectionString();

    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Necessário para Supabase
      }
    });

    const client = await pool.connect();

    try {
      const result = await client.query(sql);

      if (verbose) {
        console.log('✅ SQL executado com sucesso via pg client!');
        if (result.rows && result.rows.length > 0) {
          console.log(`   ${result.rows.length} linha(s) afetada(s)`);
        }
      }

      return { success: true, result: result.rows };

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error) {
    if (verbose) {
      console.error('❌ Erro ao executar SQL via pg client:', error.message);
    }
    throw error;
  }
}

/**
 * Constrói a connection string do PostgreSQL a partir das variáveis de ambiente
 */
function buildConnectionString() {
  // Se não tiver DATABASE_URL, tenta construir a partir do SUPABASE_URL
  // Formato do Supabase: https://xxxxx.supabase.co
  // Connection string: postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword) {
    throw new Error(`
❌ DATABASE_URL ou SUPABASE_DB_PASSWORD não encontrado!

Para executar SQL automaticamente, adicione ao seu .env.local:

DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.xxxxx.supabase.co:5432/postgres

Você pode encontrar a connection string em:
Supabase Dashboard → Settings → Database → Connection String → URI
    `.trim());
  }

  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('❌ Formato inválido de NEXT_PUBLIC_SUPABASE_URL');
  }

  const projectRef = match[1];
  return `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
}

/**
 * Executa múltiplas queries SQL em sequência
 *
 * @param {string[]} queries - Array de queries SQL
 * @param {object} options - Opções adicionais
 * @returns {Promise<object[]>} Array com resultados de cada query
 */
async function executeSqlBatch(queries, options = {}) {
  const results = [];

  for (let i = 0; i < queries.length; i++) {
    const sql = queries[i];
    console.log(`\n📝 Executando query ${i + 1}/${queries.length}...`);

    const result = await executeSql(sql, options);
    results.push(result);
  }

  return results;
}

/**
 * Lê e executa um arquivo SQL
 *
 * @param {string} sqlFilePath - Caminho completo para o arquivo SQL
 * @param {object} options - Opções adicionais
 * @returns {Promise<object>} Resultado da execução
 */
async function executeSqlFile(sqlFilePath, options = {}) {
  const { verbose = true } = options;

  if (verbose) {
    console.log(`\n📄 Lendo arquivo SQL: ${sqlFilePath}`);
  }

  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`Arquivo SQL não encontrado: ${sqlFilePath}`);
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  if (verbose) {
    console.log(`✅ Arquivo lido (${sqlContent.length} caracteres)`);
  }

  // Executar o SQL
  return await executeSql(sqlContent, options);
}

module.exports = {
  executeSql,
  executeSqlBatch,
  executeSqlFile
};
