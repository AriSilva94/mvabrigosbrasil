# 🔄 Scripts de Migração - MVAbrigos Brasil

Este diretório contém scripts de migração gradual do WordPress legado para o Supabase.

## 📁 Estrutura de Pastas

Os scripts estão organizados por fluxo de dados:

```plaintext
scripts/migrations/
├── voluntarios/          # Migração de voluntários
│   ├── migrate-volunteers-wp-to-supabase.js
│   ├── setup-test-login.js
│   ├── link-existing-volunteers.js
│   ├── verify-volunteer-link.js
│   └── output/          # Relatórios de migração
├── (outros fluxos no futuro, ex: abrigos/, doadores/, etc.)
└── README.md
```

## 📋 Índice

- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Voluntários (WordPress → Supabase)](#voluntários-wordpress--supabase)
- [Requisitos](#requisitos)
- [Configuração](#configuração)
- [Execução](#execução)
- [Relatórios](#relatórios)

---

## 🧑‍🤝‍🧑 Voluntários (WordPress → Supabase)

### Descrição

Migra dados de voluntários das tabelas legadas do WordPress (`wp_posts_raw` + `wp_postmeta_raw`) para a tabela `public.volunteers` do Supabase.

**Características:**
- ✅ **Idempotente** - Pode rodar múltiplas vezes sem duplicar dados
- ✅ **Incremental** - Processa em lotes (paginação)
- ✅ **Validação** - Filtra registros inválidos
- ✅ **Auditoria** - Gera relatório JSON com estatísticas
- ✅ **Dry-run** - Simula migração sem alterar dados

### O que é migrado

| Origem (WordPress) | Destino (Supabase) |
|--------------------|--------------------|
| `wp_posts.ID` (post_type=voluntario) | `volunteers.wp_post_id` |
| `post_name` (meta) | `volunteers.name` |
| `post_telefone` (meta) | `volunteers.telefone` |
| `post_cidade` (meta) | `volunteers.cidade` |
| `post_estado` (meta) | `volunteers.estado` |
| `post_profissao` (meta) | `volunteers.profissao` |
| `post_escolaridade` (meta) | `volunteers.escolaridade` |
| `post_faixa_etaria` (meta) | `volunteers.faixa_etaria` |
| `post_genero` (meta) | `volunteers.genero` |
| `post_experiencia` (meta) | `volunteers.experiencia` |
| `post_atuacao` (meta) | `volunteers.atuacao` |
| `post_disponibilidade` (meta) | `volunteers.disponibilidade` |
| `post_periodo` (meta) | `volunteers.periodo` |
| `post_descricao` ou `post_content` | `volunteers.descricao` |
| `post_comentarios` (meta) | `volunteers.comentarios` |
| `post_status == 'publish'` | `volunteers.is_public` |
| `post_date` | `volunteers.created_at` |
| `post_modified` | `volunteers.updated_at` |

**Campos não migrados agora:**
- `owner_profile_id` → fica **NULL** (será vinculado no primeiro login do usuário)

### O que NÃO é migrado

- ❌ Não cria usuários no `auth.users`
- ❌ Não cria perfis em `profiles`
- ❌ Não migra senhas (compatibilidade entre WP e Supabase Auth)

---

## ⚙️ Requisitos

- Node.js 18+
- Acesso ao banco Supabase
- Service Role Key (para bypass de RLS)

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

O script usa o arquivo `.env.local` existente na raiz do projeto.

Certifique-se de que as seguintes variáveis estão configuradas:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **ATENÇÃO:**
- Use a **Service Role Key**, NÃO a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- A Service Role tem permissão total e ignora RLS
- O script carrega automaticamente o `.env.local` da raiz do projeto

### 2. Instalar Dependências

```bash
npm install
```

---

## 🚀 Execução

### Modo Dry-run (Recomendado primeiro)

Simula a migração sem alterar o banco:

```bash
node scripts/migrations/voluntarios/migrate-volunteers-wp-to-supabase.js --dry-run --limit=50
```

- `--dry-run` - Não faz alterações no banco
- `--limit=50` - Processa apenas 50 registros

### Migração Parcial (Teste)

Migra os primeiros 500 registros:

```bash
node scripts/migrations/voluntarios/migrate-volunteers-wp-to-supabase.js --limit=500
```

### Migração Completa

Migra todos os voluntários:

```bash
node scripts/migrations/voluntarios/migrate-volunteers-wp-to-supabase.js
```

### Verificar Idempotência

Execute novamente para garantir que não duplica:

```bash
node scripts/migrations/voluntarios/migrate-volunteers-wp-to-supabase.js
```

---

## 📊 Relatórios

Após cada execução, um relatório JSON é gerado em:

```plaintext
scripts/migrations/voluntarios/output/migrate-volunteers-report.json
```

### Exemplo de Relatório

```json
{
  "timestamp": "2025-12-28T14:30:00.000Z",
  "mode": "production",
  "limit": "unlimited",
  "stats": {
    "totalLegacy": 1250,
    "processed": 1250,
    "inserted": 0,
    "updated": 1230,
    "invalid": 20,
    "errors": [
      {
        "wp_post_id": 12345,
        "reason": "name ausente ou vazio"
      }
    ]
  }
}
```

### Campos do Relatório

- `totalLegacy` - Total de voluntários no WordPress
- `processed` - Registros processados
- `updated` - Registros inseridos/atualizados no Supabase
- `invalid` - Registros que não passaram na validação
- `errors` - Lista de erros com detalhes

---

## ✅ Checklist Pós-Migração

### 1. Conferir Contagem

```sql
-- Total de voluntários migrados
SELECT COUNT(*) FROM volunteers WHERE wp_post_id IS NOT NULL;

-- Total no legado
SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'voluntario';
```

### 2. Conferir Amostras

```sql
-- 10 registros aleatórios
SELECT
  wp_post_id,
  name,
  cidade,
  estado,
  telefone,
  is_public
FROM volunteers
WHERE wp_post_id IS NOT NULL
ORDER BY RANDOM()
LIMIT 10;
```

### 3. Conferir Duplicatas

```sql
-- Não deve retornar nenhum registro
SELECT wp_post_id, COUNT(*)
FROM volunteers
WHERE wp_post_id IS NOT NULL
GROUP BY wp_post_id
HAVING COUNT(*) > 1;
```

### 4. Conferir que nenhum auth foi criado

```sql
-- Todos os owner_profile_id devem ser NULL
SELECT COUNT(*) FROM volunteers WHERE owner_profile_id IS NOT NULL;
-- Esperado: 0 (ou apenas os que já existiam antes da migração)
```

---

## 🧪 Scripts Auxiliares

### Setup de Login de Teste

Seleciona aleatoriamente um voluntário migrado e configura senha para teste:

```bash
node scripts/migrations/voluntarios/setup-test-login.js
```

O script irá:

1. Buscar 20 voluntários com dados completos
2. Selecionar um aleatoriamente
3. Configurar senha MD5 temporária
4. Exibir credenciais para teste de login

### Vincular Voluntários Existentes

Para voluntários que já foram migrados mas os usuários já fizeram login antes do auto-link ser implementado:

```bash
node scripts/migrations/voluntarios/link-existing-volunteers.js
```

### Verificar Vínculo

Para verificar se um voluntário específico foi vinculado corretamente:

```bash
node scripts/migrations/voluntarios/verify-volunteer-link.js
```

---

## 🔄 Próximos Passos (Vínculo com Auth)

Quando um usuário migrado fizer login pela primeira vez:

1. O sistema autentica com Supabase Auth (cria `auth.users` + `profiles`)
2. Backend localiza voluntário por email:
   ```sql
   SELECT * FROM volunteers WHERE email = auth.email();
   ```
3. Se encontrado, vincula:
   ```sql
   UPDATE volunteers
   SET owner_profile_id = auth.uid()
   WHERE email = auth.email() AND owner_profile_id IS NULL;
   ```

**Observação:** Como a tabela `volunteers` atual não tem coluna `email`, esse vínculo pode ser feito por outra lógica (ex: buscar por `name` + confirmação manual, ou adicionar coluna `email` se necessário).

---

## 🆘 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"

Certifique-se de que `.env.local` está configurado e carregado:

```bash
# Testar manualmente
export SUPABASE_URL=https://...
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
node scripts/migrations/migrate-volunteers-wp-to-supabase.js --dry-run
```

### Erro: "Erro ao buscar posts"

Verifique se as tabelas `wp_posts_raw` e `wp_postmeta_raw` existem e têm dados:

```sql
SELECT COUNT(*) FROM wp_posts_raw WHERE post_type = 'voluntario';
SELECT COUNT(*) FROM wp_postmeta_raw;
```

### Erro: "Erro ao fazer upsert"

Verifique se a constraint `UNIQUE (wp_post_id)` existe na tabela `volunteers`:

```sql
\d volunteers
```

Se não existir, crie:

```sql
ALTER TABLE volunteers ADD CONSTRAINT volunteers_wp_post_id_key UNIQUE (wp_post_id);
```

---

## 📚 Referências

- [SUPABASE.MD](../../SUPABASE.MD) - Documentação completa do schema
- [instrucoes_claude_migracao-b.d.md](../../docs/instrucoes_claude_migracao-b.d.md) - Instruções originais da migração

---

**Última atualização:** 2025-12-28
