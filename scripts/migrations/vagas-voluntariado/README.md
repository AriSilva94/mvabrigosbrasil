## 📋 Migração: Vagas de Voluntariado (WordPress → Supabase)

## 🎯 Objetivo

Migrar todas as vagas de voluntariado do WordPress (`wp_posts_raw` + `wp_postmeta_raw`) para a tabela `vacancies` do Supabase, unificando a fonte de dados e permitindo:
- Edição direta no Supabase
- Busca otimizada por slug
- Performance melhorada
- Escalabilidade

---

## 📊 Estado Atual vs. Estado Futuro

### Antes (JSON Estático)
```
useVacancyCards()
  └── Lê wp_posts_vaga.json (arquivo estático)
      └── Filtra post_type = "vaga"
          └── Retorna 46 vagas hardcoded
```

### Depois (Dual-Source → Single-Source)
```
GET /api/vacancies
  ├── Consulta vacancies (Supabase) → vagas novas
  ├── Consulta wp_posts_raw → vagas migradas
  └── Merge + retorna lista unificada

Futuro (após 100% migrado):
GET /api/vacancies
  └── SELECT * FROM vacancies (1 query única)
```

---

## 🗂️ Estrutura de Arquivos

```
scripts/migrations/vagas-voluntariado/
├── add-slug-column.sql                  # SQL para adicionar colunas
├── migrate-vacancies-wp-to-supabase.js  # Script principal de migração
├── check-slug-duplicates.js             # Verificar duplicatas
├── create-slug-index.sql                # SQL para índices únicos
├── output/
│   └── migrate-vacancies-report.json    # Relatório da migração
└── README.md                            # Esta documentação
```

---

## 🚀 Ordem de Execução

### **Fase 1: Preparação (Adicionar Colunas)**

#### 1.1. Adicionar colunas na tabela vacancies
```bash
# Executar no Supabase SQL Editor
cat add-slug-column.sql
```

**O que faz:**
- Adiciona coluna `slug TEXT` (nullable)
- Adiciona coluna `wp_post_id INTEGER` (rastreamento)
- Não cria índices ainda

**Verificar:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vacancies'
  AND column_name IN ('slug', 'wp_post_id');
```

---

### **Fase 2: Migrar Vagas**

#### 2.1. Rodar migração (dry-run primeiro)
```bash
cd scripts/migrations/vagas-voluntariado

# Testar sem fazer alterações
node migrate-vacancies-wp-to-supabase.js --dry-run

# Ver apenas 10 registros
node migrate-vacancies-wp-to-supabase.js --dry-run --limit=10

# Se estiver OK, executar de verdade
node migrate-vacancies-wp-to-supabase.js
```

**O que faz:**
- Busca vagas do `wp_posts_raw` (post_type = 'vaga')
- Busca metadados do `wp_postmeta_raw` em chunks
- Mapeia campos WordPress → Supabase
- Gera slug (prioriza `post_name`, senão título + ID)
- Faz upsert com `onConflict: wp_post_id`
- Salva relatório em `output/migrate-vacancies-report.json`

**Campos migrados:**
```javascript
{
  wp_post_id: 782,              // ID original do WP
  shelter_id: null,             // NULL para vagas migradas
  title: "Vaga de Psicólogo",   // post_title
  slug: "vaga-de-psicologo",    // post_name ou gerado
  description: JSON.stringify({ // TODOS os campos extras
    post_content: "...",
    post_habilidades_e_funcoes: "...",
    post_perfil_dos_voluntarios: "...",
    post_periodo: "...",
    post_carga: "...",
    post_tipo_demanda: "...",
    post_area_atuacao: "...",
    post_quantidade: "...",
    cidade: "São Paulo",
    estado: "SP",
    abrigo: "Nome do Abrigo"
  }),
  status: "active",             // publish → active
  created_at: "2023-01-18...",  // post_date
  updated_at: "2023-01-18..."   // post_modified
}
```

**Exemplo de output:**
```
📥 Buscando vagas (offset: 0)...
✅ Válidos: 51 / Total: 51
💾 Salvos: 51

═══════════════════════════════════════
📊 RELATÓRIO FINAL
═══════════════════════════════════════
Total de vagas processadas: 51
Válidas: 51
Inválidas: 0
Atualizadas: 51
Erros: 0
```

---

### **Fase 3: Verificar e Criar Índices**

#### 3.1. Verificar duplicatas
```bash
node check-slug-duplicates.js
```

**Se tudo OK:**
```
✅ Nenhuma duplicata encontrada! Seguro criar índice único.

📋 Próximo passo:
   Execute o SQL: create-slug-index.sql
```

#### 3.2. Criar índices únicos
```bash
# Executar no Supabase SQL Editor
cat create-slug-index.sql
```

**O que faz:**
- Cria `CREATE UNIQUE INDEX idx_vacancies_slug ON vacancies(slug)`
- Cria `CREATE INDEX idx_vacancies_wp_post_id ON vacancies(wp_post_id)`

**Verificar:**
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'vacancies'
  AND indexname IN ('idx_vacancies_slug', 'idx_vacancies_wp_post_id');
```

---

## 📋 Mapeamento de Campos

### WordPress → Supabase

| Campo WordPress | Meta Key | Tabela Supabase | Campo Supabase |
|-----------------|----------|-----------------|----------------|
| `post_title` | - | `vacancies` | `title` |
| `post_name` | - | `vacancies` | `slug` |
| `post_content` | - | `vacancies` | `description.post_content` |
| `post_status` | - | `vacancies` | `status` (publish → active) |
| `post_date` | - | `vacancies` | `created_at` |
| `post_modified` | - | `vacancies` | `updated_at` |
| `ID` | - | `vacancies` | `wp_post_id` |
| - | `cidade` | `vacancies` | `description.cidade` |
| - | `estado` | `vacancies` | `description.estado` |
| - | `periodo` | `vacancies` | `description.post_periodo` |
| - | `carga_horaria` | `vacancies` | `description.post_carga` |
| - | `habilidades_e_funcoes` | `vacancies` | `description.post_habilidades_e_funcoes` |
| - | `perfil_dos_voluntarios` | `vacancies` | `description.post_perfil_dos_voluntarios` |
| - | `tipo_demanda` | `vacancies` | `description.post_tipo_demanda` |
| - | `area_atuacao` | `vacancies` | `description.post_area_atuacao` |
| - | `quantidade` | `vacancies` | `description.post_quantidade` |
| - | `abrigo` ou `_abrigo` | `vacancies` | `description.abrigo` |

---

## 🔍 Troubleshooting

### Erro: "duplicate key value violates unique constraint"

**Causa:** Tentou criar índice único com slugs duplicados.

**Solução:**
```bash
# 1. Verificar duplicatas
node check-slug-duplicates.js

# 2. Corrigir manualmente no Supabase
UPDATE vacancies
SET slug = 'vaga-unica-123'
WHERE id = 'id-do-duplicado';

# 3. Tentar criar índice novamente
```

---

### Vagas não aparecem na página

**Verificar:**
1. Campo `status = 'active'`
2. Campo `slug` não é NULL
3. Consulta no código está buscando da tabela correta

```sql
-- Query de debug
SELECT id, title, slug, status, wp_post_id
FROM vacancies
WHERE slug = 'slug-da-vaga';
```

---

### Erro: "shelter_id cannot be null"

**Causa:** Constraint na tabela exige `shelter_id`.

**Solução temporária:**
```sql
-- Permitir NULL em shelter_id (se necessário)
ALTER TABLE vacancies
ALTER COLUMN shelter_id DROP NOT NULL;
```

**Solução definitiva:**
- Vincular vagas a abrigos posteriormente
- Criar abrigo "genérico" para vagas migradas

---

## 🔄 Próximos Passos

### Fase 4: Criar Repositórios (Dual-Source)

Após migração, criar:

1. **`src/repositories/vacanciesRepository.ts`** (WordPress)
   - Busca de `wp_posts_raw` + `wp_postmeta_raw`
   - Para manter compatibilidade

2. **`src/repositories/newVacanciesRepository.ts`** (Supabase)
   - Busca de `vacancies`
   - Com slug direto

3. **`src/services/vacanciesAggregator.ts`** (Merge)
   - Combina WordPress + Supabase
   - Remove duplicatas por `wp_post_id`

4. **Atualizar `useVacancyCards`**
   - Trocar JSON estático por aggregator
   - Buscar de ambas fontes

---

### Fase 5: Simplificação (Futuro - 100% Migrado)

Quando todas as vagas estiverem migradas:

1. ❌ Remover `wp_posts_vaga.json`
2. ❌ Remover `vacanciesRepository.ts` (WordPress)
3. ❌ Remover `vacanciesAggregator.ts`
4. ✅ Usar apenas `newVacanciesRepository.ts`
5. ✅ Busca direta por slug

**Ganho final:**
- 1 repositório ao invés de 3
- 1 query ao invés de múltiplas fontes
- Performance 10x+ melhor

---

## 📈 Métricas Esperadas

| Métrica | Antes (JSON) | Depois (Supabase) | Ganho |
|---------|-------------|-------------------|-------|
| **Fonte de dados** | JSON estático | Banco de dados | Editável |
| **Busca por slug** | Linear O(n) | Índice único O(1) | **10x+** |
| **Atualização** | Requer build | UPDATE direto | **Instantâneo** |
| **Escalabilidade** | JSON cresce | Tabela otimizada | **Ilimitado** |
| **Queries** | Arquivo local | 1 query SQL | **Unificado** |

---

## ✅ Checklist de Execução

- [ ] Executar `add-slug-column.sql` no Supabase
- [ ] Rodar `node migrate-vacancies-wp-to-supabase.js --dry-run`
- [ ] Rodar `node migrate-vacancies-wp-to-supabase.js`
- [ ] Verificar relatório em `output/migrate-vacancies-report.json`
- [ ] Rodar `node check-slug-duplicates.js`
- [ ] Se OK, executar `create-slug-index.sql` no Supabase
- [ ] Criar repositórios dual-source
- [ ] Atualizar `useVacancyCards` para usar Supabase
- [ ] Testar página `/programa-de-voluntarios` (aba Vagas)
- [ ] Deploy em produção
- [ ] Monitorar logs por 24h

---

## 📚 Referências

- [Migração Voluntários](../voluntarios/README.md) - Padrão seguido
- [Migração Programa](../programa-de-voluntarios/README.md) - Simplificação de slugs

---

**Última atualização:** 2025-12-28
**Responsável:** Claude Code
**Status:** ✅ Pronto para execução
