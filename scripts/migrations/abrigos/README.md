# 🏠 Migração de Abrigos: WordPress → Supabase

Este diretório contém os scripts para migração de dados legados de **abrigos** do WordPress para o Supabase.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Execução Passo a Passo](#execução-passo-a-passo)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Validações](#validações)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### O que é migrado

| Origem (WordPress) | Destino (Supabase) |
|-------------------|--------------------|
| `wp_posts.ID` (post_type=abrigo) | `shelters.wp_post_id` |
| `post_title` | `shelters.name` |
| `meta: tipo` | `shelters.shelter_type` |
| `meta: estado` | `shelters.state` |
| `meta: cidade` | `shelters.city` |
| `meta: endereco` | `shelters.street` |
| `meta: website` | `shelters.website` |
| `meta: fundacao` | `shelters.foundation_date` |
| `meta: cnpj` | `shelters.cnpj` |
| `meta: cpf` | `shelters.cpf` |
| `post_date` | `shelters.created_at` |
| `post_modified` | `shelters.updated_at` |

### Características

- ✅ **Idempotente** - Pode executar múltiplas vezes sem duplicar
- ✅ **Incremental** - Processa em lotes
- ✅ **Validação** - Filtra registros inválidos
- ✅ **Auditoria** - Gera relatórios JSON
- ✅ **Dry-run** - Simula sem alterar dados

### O que NÃO é migrado

- ❌ Não cria usuários em `auth.users`
- ❌ Não cria perfis em `profiles`
- ❌ Não vincula `shelters.profile_id` (será feito no primeiro login)
- ❌ Não migra dinâmicas populacionais (plano separado)

---

## ⚙️ Pré-requisitos

### 1. Variáveis de Ambiente

Certifique-se de que `.env.local` está configurado na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** Use a **Service Role Key**, não a `ANON_KEY`.

### 2. Estrutura do Banco

Execute o script SQL para adicionar a coluna `wp_post_id`:

```bash
# No SQL Editor do Supabase, execute:
scripts/migrations/abrigos/add-wp-post-id-column.sql
```

---

## 🚀 Execução Passo a Passo

### Passo 1: Adicionar coluna wp_post_id

```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: add-wp-post-id-column.sql
```

Isso adiciona:
- Coluna `shelters.wp_post_id` (INTEGER)
- Constraint UNIQUE
- Índice para performance

### Passo 2: Verificar Qualidade dos Dados

```bash
node scripts/migrations/abrigos/check-shelter-data.js
```

**O que verifica:**
- Total de abrigos no legado
- Abrigos sem nome (serão rejeitados)
- Cobertura de metadados (tipo, estado, cidade, etc.)
- Formatos inválidos de data de fundação
- Distribuição por tipo e estado

**Saída:**
- Console: Relatório formatado
- Arquivo: `output/check-shelter-data-report.json`

### Passo 3: Executar Dry-run

Simula a migração sem alterar o banco:

```bash
node scripts/migrations/abrigos/migrate-shelters-wp-to-supabase.js --dry-run --limit=10
```

**Parâmetros:**
- `--dry-run`: Não altera dados
- `--limit=N`: Processa apenas N registros

### Passo 4: Migração Parcial (Teste)

Migra um lote pequeno para validação:

```bash
node scripts/migrations/abrigos/migrate-shelters-wp-to-supabase.js --limit=50
```

Depois, valide os dados no Supabase:

```sql
SELECT * FROM shelters WHERE wp_post_id IS NOT NULL LIMIT 10;
```

### Passo 5: Migração Completa

```bash
node scripts/migrations/abrigos/migrate-shelters-wp-to-supabase.js
```

Isso processa **todos** os abrigos do legado.

**Saída:**
- Console: Progresso e estatísticas
- Arquivo: `output/migrate-shelters-report.json`

### Passo 6: Verificar Migração

```bash
node scripts/migrations/abrigos/verify-migration.js
```

**O que verifica:**
- Comparação de contagens (legado vs Supabase)
- Duplicatas por `wp_post_id`
- Abrigos sem nome
- Distribuição por tipo e estado
- Amostra aleatória de 10 registros

**Saída:**
- Console: Relatório de validação
- Arquivo: `output/verify-migration-report.json`

---

## 📚 Scripts Disponíveis

### 1. `add-wp-post-id-column.sql`

Adiciona coluna `wp_post_id` à tabela `shelters`.

**Uso:**
```sql
-- Execute no SQL Editor do Supabase
```

**Resultado:**
- Coluna `wp_post_id INTEGER UNIQUE`
- Índice `idx_shelters_wp_post_id`

---

### 2. `check-shelter-data.js`

Analisa qualidade dos dados antes da migração.

**Uso:**
```bash
node scripts/migrations/abrigos/check-shelter-data.js
```

**Relatórios:**
- Total de abrigos
- Abrigos sem nome/tipo/estado
- Cobertura de metadados
- Distribuições estatísticas

---

### 3. `migrate-shelters-wp-to-supabase.js`

Script principal de migração.

**Uso:**
```bash
# Dry-run
node migrate-shelters-wp-to-supabase.js --dry-run --limit=10

# Migração parcial
node migrate-shelters-wp-to-supabase.js --limit=100

# Migração completa
node migrate-shelters-wp-to-supabase.js
```

**Transformações:**
- `tipo: "Público"` → `shelter_type: "public"`
- `tipo: "Privado"` → `shelter_type: "private"`
- `tipo: "Misto"` → `shelter_type: "mixed"`
- `tipo: "LT-PI"` → `shelter_type: "temporary"`
- `fundacao: "20/11/2017"` → `foundation_date: "2017-11-20"`
- `cnpj: "12.345.678/0001-90"` → `cnpj: "12345678000190"`

**Valores Padrão:**
- `profile_id = NULL` (vinculado no login)
- `active = true`
- `accept_terms = true`

---

### 4. `verify-migration.js`

Valida migração após execução.

**Uso:**
```bash
node scripts/migrations/abrigos/verify-migration.js
```

**Validações:**
- Contagens (legado vs migrado)
- Duplicatas
- Integridade de dados
- Distribuições

---

## ✅ Validações SQL

### 1. Contagem Total

```sql
-- Total migrado
SELECT COUNT(*) as total_migrado
FROM shelters
WHERE wp_post_id IS NOT NULL;

-- Total no legado
SELECT COUNT(*) as total_legado
FROM wp_posts_raw
WHERE post_type = 'abrigo';
```

### 2. Verificar Duplicatas

```sql
-- Não deve retornar nenhum registro
SELECT wp_post_id, COUNT(*) as duplicatas
FROM shelters
WHERE wp_post_id IS NOT NULL
GROUP BY wp_post_id
HAVING COUNT(*) > 1;
```

### 3. Abrigos sem Nome

```sql
SELECT id, wp_post_id, name
FROM shelters
WHERE wp_post_id IS NOT NULL
  AND (name IS NULL OR name = '');
```

### 4. Distribuição por Tipo

```sql
SELECT
  shelter_type,
  COUNT(*) as total
FROM shelters
WHERE wp_post_id IS NOT NULL
GROUP BY shelter_type
ORDER BY total DESC;
```

### 5. Distribuição por Estado

```sql
SELECT
  state,
  COUNT(*) as total
FROM shelters
WHERE wp_post_id IS NOT NULL
  AND state IS NOT NULL
GROUP BY state
ORDER BY total DESC
LIMIT 10;
```

### 6. Verificar Vínculos de Perfil

```sql
-- Deve retornar 0 logo após migração
SELECT COUNT(*)
FROM shelters
WHERE wp_post_id IS NOT NULL
  AND profile_id IS NOT NULL;
```

---

## 🔧 Troubleshooting

### Erro: "Coluna wp_post_id não existe"

**Solução:**
```sql
-- Execute o script SQL primeiro
-- add-wp-post-id-column.sql
```

### Erro: "Duplicatas encontradas"

**Causa:** Script foi executado múltiplas vezes sem idempotência.

**Solução:**
```sql
-- Deletar duplicatas manualmente
DELETE FROM shelters
WHERE id NOT IN (
  SELECT MIN(id)
  FROM shelters
  WHERE wp_post_id IS NOT NULL
  GROUP BY wp_post_id
);
```

### Abrigos sem nome foram migrados

**Causa:** Validação falhou.

**Solução:**
```sql
-- Deletar abrigos inválidos
DELETE FROM shelters
WHERE wp_post_id IS NOT NULL
  AND (name IS NULL OR name = '');
```

### Taxa de migração < 100%

**Possíveis causas:**
- Abrigos sem nome no legado (rejeitados)
- Erro durante processamento (verificar relatório JSON)

**Investigar:**
```bash
# Verificar relatório de migração
cat scripts/migrations/abrigos/output/migrate-shelters-report.json | grep -A5 "errors"
```

---

## 📊 Relatórios Gerados

### 1. `output/check-shelter-data-report.json`

Análise pré-migração:
```json
{
  "total": 150,
  "withName": 145,
  "withoutName": 5,
  "byType": { "Público": 80, "Privado": 60, ... },
  "metadataStats": { "hasEstado": 140, "hasTipo": 145, ... },
  "issues": { "noName": [...], "noType": [...] }
}
```

### 2. `output/migrate-shelters-report.json`

Resultado da migração:
```json
{
  "timestamp": "2025-12-29T...",
  "mode": "production",
  "limit": "unlimited",
  "stats": {
    "totalLegacy": 150,
    "processed": 145,
    "updated": 145,
    "invalid": 5,
    "errors": [...]
  }
}
```

### 3. `output/verify-migration-report.json`

Validação pós-migração:
```json
{
  "timestamp": "2025-12-29T...",
  "legacy": { "total": 150 },
  "supabase": {
    "total": 145,
    "withWpPostId": 145,
    "byType": { "public": 80, "private": 60, ... }
  },
  "validation": {
    "duplicates": [],
    "noName": [],
    "sample": [...]
  }
}
```

---

## 🔄 Próximos Passos

Após a migração de abrigos:

1. **Migração de Dinâmicas Populacionais**
   - Migrar `post_type = 'dinamica'` → `shelter_dynamics`
   - Migrar `post_type = 'dinamica_lar'` → `shelter_dynamics`

2. **Sistema de Auto-Vínculo**
   - Implementar lógica de auto-link no login
   - Vincular `shelters.profile_id` ao usuário autenticado

3. **Testes de Integração**
   - Testar login de usuários migrados
   - Validar acesso aos dados do abrigo

---

## 📚 Referências

- [PLANO_MIGRACAO.md](./PLANO_MIGRACAO.md) - Plano completo detalhado
- [Migração de Voluntários](../voluntarios/) - Padrão de referência
- [README Geral](../README.md) - Documentação das migrações

---

**Última atualização:** 2025-12-29
**Status:** ✅ Pronto para execução
