# 🤖 Automação de Execução de SQL

## O que mudou?

Antes você precisava **pausar a migração 4 vezes** para executar SQL manualmente no Supabase:

- ❌ PASSO 4: Pausar → Executar SQL → Continuar
- ❌ PASSO 7: Pausar → Executar SQL → Continuar
- ❌ PASSO 8: Pausar → Executar SQL → Continuar
- ❌ PASSO 11: Pausar → Executar SQL → Continuar

**Agora tudo é automático!** ✨

O script executa todos os SQLs automaticamente via conexão PostgreSQL.

---

## 📋 Configuração Necessária

### 1. Adicionar DATABASE_URL ao .env.local

Você precisa adicionar **UMA** das seguintes opções ao seu `.env.local`:

#### Opção A: DATABASE_URL completa (RECOMENDADO)

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Adicione esta linha:
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.xxxxx.supabase.co:5432/postgres
```

#### Opção B: Apenas a senha do banco

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Adicione esta linha:
SUPABASE_DB_PASSWORD=[SUA_SENHA]
```

### 2. Onde encontrar a DATABASE_URL?

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Database**
4. Procure por **Connection String**
5. Selecione a aba **URI**
6. Copie a string que aparece (formato: `postgresql://postgres:[SUA_SENHA]@db.xxxxx.supabase.co:5432/postgres`)

**⚠️ IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha real do banco de dados!

---

## 🚀 Como usar

### Antes de começar

```bash
# 1. Instalar dependências (se ainda não fez)
npm install

# 2. Testar se a conexão está funcionando
cd scripts/migrations/utils
node test-execute-sql.js
```

Se o teste passar, você verá:

```
✅ Teste 1 passou!
✅ Teste 2 passou!
✅ Teste 3 passou!
🎉 Todos os testes passaram!
```

### Executar a migração

```bash
cd scripts/migrations
node run-full-migration.js
```

Agora **NÃO haverá pausas!** Os passos 4, 7, 8 e 11 executarão SQL automaticamente.

---

## 🔧 O que foi criado?

### 1. Utilitário de execução de SQL

**Arquivo**: `scripts/migrations/utils/execute-sql.js`

Funções disponíveis:
- `executeSql(sql, options)` - Executa uma query SQL
- `executeSqlBatch(queries, options)` - Executa múltiplas queries

### 2. Script de teste

**Arquivo**: `scripts/migrations/utils/test-execute-sql.js`

Valida se a conexão com o Supabase está funcionando.

### 3. Migração atualizada

**Arquivo**: `scripts/migrations/run-full-migration.js`

Modificado para executar SQL automaticamente ao invés de pausar.

---

## ⚡ Benefícios

- ✅ **Sem interrupções**: Migração completa sem pausas
- ✅ **Menos erros**: Não há risco de esquecer de executar um SQL
- ✅ **Mais rápido**: Reduz o tempo total de migração
- ✅ **Rastreável**: Todos os SQLs executados ficam logados

---

## 🆘 Troubleshooting

### Erro: "DATABASE_URL não encontrado"

**Solução**: Adicione a `DATABASE_URL` ao `.env.local` conforme instruções acima.

### Erro: "password authentication failed"

**Solução**: Verifique se a senha na `DATABASE_URL` está correta.

### Erro: "no pg_hba.conf entry"

**Solução**: Verifique se o SSL está habilitado na connection string ou se seu IP está permitido no Supabase.

### Teste falha mas você quer continuar

Se o teste automático falhar mas você preferir executar manualmente:

1. Comente a linha `const { executeSql } = require('./utils/execute-sql');` no `run-full-migration.js`
2. Restaure a função `pause()` antiga
3. Execute a migração com pausas manuais

---

## 📊 Comparação

| Aspecto | Antes | Agora |
|---------|-------|-------|
| Pausas manuais | 4 pausas | 0 pausas ✅ |
| Tempo de execução | ~15-20 min | ~10-12 min ✅ |
| Risco de erro | Médio | Baixo ✅ |
| Configuração | .env.local básico | .env.local + DATABASE_URL |

---

## 🎯 Próximos passos

Agora você pode executar a migração completa sem interrupções!

```bash
cd scripts/migrations
node run-full-migration.js
```

O script executará automaticamente:
1. ✅ Migrar abrigos
2. ✅ Migrar dinâmicas populacionais
3. ✅ Migrar voluntários
4. ✅ **Adicionar coluna slug** (automático!)
5. ✅ Gerar slugs
6. ✅ Verificar duplicatas
7. ✅ **Criar índice único** (automático!)
8. ✅ **Adicionar coluna slug em vagas** (automático!)
9. ✅ Migrar vagas
10. ✅ Verificar duplicatas
11. ✅ **Criar índice único em vagas** (automático!)
12. ✅ Validar tudo

**Tudo sem pausas!** 🎉
