# 📊 Migração de Dinâmica Populacional

Scripts para migrar dados de dinâmica populacional do WordPress para Supabase.

---

## 📁 Arquivos

### Scripts Principais

1. **`migrate-dynamics-wp-to-supabase-optimized.js`**
   - Migra dinâmicas populacionais do WP para `shelter_dynamics`
   - Versão otimizada com batch processing
   - Performance: ~10 queries ao invés de ~3000
   - **Status**: ✅ Corrigido e testado

2. **`verify-dynamics-migration.js`**
   - Valida a migração comparando dados WP vs Supabase
   - Mostra estatísticas e amostra de registros
   - **Status**: ✅ Corrigido e testado

### Documentação

- **`CORRECOES-APLICADAS.md`**: Detalhes das correções de mapeamento de campos
- **`README.md`**: Este arquivo

---

## 🚀 Como Usar

### Opção 1: Via Script Unificado (Recomendado)

A migração de dinâmica populacional é executada **automaticamente** no PASSO 2 do script unificado:

```bash
cd scripts/migrations
node run-full-migration.js
```

### Opção 2: Executar Manualmente

```bash
cd scripts/migrations/abrigos/dinamica-populacional

# Migrar dados
node migrate-dynamics-wp-to-supabase-optimized.js

# Verificar migração
node verify-dynamics-migration.js
```

### Modo Dry-Run

Para testar sem persistir dados:

```bash
node migrate-dynamics-wp-to-supabase-optimized.js --dry-run
```

---

## 📋 Dados Migrados

### Origem (WordPress)

**Tabelas**: `wp_posts_raw` + `wp_postmeta_raw`

**Post Types**:
- `dinamica` → Dinâmica de abrigo
- `dinamica_lar` → Dinâmica de lar temporário

**Meta Keys** (campos do WordPress):
```
- id_abrigo
- entradas_de_animais
- entradas_de_gatos
- adocoes_de_animais      ← mapeado para adocoes_caes
- adocoes_de_gatos
- devolucoes_de_animais   ← mapeado para devolucoes_caes
- devolucoes_de_gatos
- eutanasias_de_animais   ← mapeado para eutanasias_caes
- eutanasias_de_gatos
- mortes_naturais_de_animais ← mapeado para mortes_naturais_caes
- mortes_naturais_de_gatos
- doencas_caes
- doencas_gatos
- retorno_de_caes
- retorno_de_gatos
- retorno_local_caes
- retorno_local_gatos
```

### Destino (Supabase)

**Tabela**: `shelter_dynamics`

**Estrutura**:
```sql
CREATE TABLE shelter_dynamics (
  id UUID PRIMARY KEY,
  shelter_id UUID REFERENCES shelters(id),
  kind TEXT NOT NULL,              -- 'abrigo' ou 'lar'
  reference_date DATE,
  reference_period TEXT,            -- 'YYYY-MM'
  dynamic_type TEXT NOT NULL,      -- 'dinamica' ou 'dinamica_lar'

  -- Campos de contagem
  entradas_de_animais INTEGER,
  entradas_de_gatos INTEGER,
  adocoes_caes INTEGER,            -- WP: adocoes_de_animais
  adocoes_gatos INTEGER,
  devolucoes_caes INTEGER,         -- WP: devolucoes_de_animais
  devolucoes_gatos INTEGER,
  eutanasias_caes INTEGER,         -- WP: eutanasias_de_animais
  eutanasias_gatos INTEGER,
  mortes_naturais_caes INTEGER,    -- WP: mortes_naturais_de_animais
  mortes_naturais_gatos INTEGER,
  doencas_caes INTEGER,
  doencas_gatos INTEGER,
  retorno_de_caes INTEGER,
  retorno_de_gatos INTEGER,
  retorno_local_caes INTEGER,
  retorno_local_gatos INTEGER,

  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,

  UNIQUE(shelter_id, dynamic_type, reference_period)
);
```

---

## ⚙️ Regras de Migração

### 1. Período de Referência

Extraído do título do post ou da data de publicação:

```javascript
// Exemplo: "Abrigo XYZ-11" → período = "2024-11"
const referencePeriod = extractReferencePeriod(post.post_title, post.post_date);
const referenceDate = `${referencePeriod}-01`; // Primeiro dia do mês
```

### 2. Vinculação ao Abrigo

```javascript
// Busca shelter_id baseado no meta_key 'id_abrigo'
const wpPostId = metaMap['id_abrigo'];
const shelter = shelters.find(s => s.wp_post_id === wpPostId);
```

### 3. Tipo de Dinâmica

```javascript
const kind = post.post_type === 'dinamica_lar' ? 'lar' : 'abrigo';
```

### 4. Duplicatas

Quando há múltiplos posts WP para a mesma combinação `(shelter_id, dynamic_type, reference_period)`, **mantém apenas o mais recente**.

---

## 📊 Estatísticas Típicas

Com base nos testes realizados:

```
Posts no WordPress:         1000
  - dinamica:               844
  - dinamica_lar:           156

Migrados para Supabase:     245
  - dinamica:               164
  - dinamica_lar:           81

Pulados:                    755
  - Sem id_abrigo:          583
  - Sem metadados:          128
  - Duplicatas removidas:   44

Abrigos com dinâmica:       40
```

---

## ✅ Validação

Após migração, o script de verificação mostra:

1. **Contagens**: Comparação WP vs Supabase
2. **Amostra**: Validação detalhada de 5 registros
3. **Abrigos**: Lista de abrigos com dinâmica migrada

### Exemplo de Saída

```
WordPress (wp_posts_raw):
   dinamica:       844
   dinamica_lar:   156
   TOTAL:          1000

Supabase (shelter_dynamics):
   dinamica:       164
   dinamica_lar:   81
   TOTAL:          245

✅ 245 registros migrados com sucesso
⚠️  755 registros não migrados (esperado - sem id_abrigo ou metadados)
```

---

## 🔧 Troubleshooting

### Erro: "Column does not exist"

Se aparecer erro de coluna inexistente, verifique se você está usando os nomes corretos:
- ❌ `adocoes_de_animais` (campo do WP)
- ✅ `adocoes_caes` (campo do DB)

### Muitos Registros Pulados

É **normal e esperado**:
- Posts sem `id_abrigo`: Não podem ser vinculados a um abrigo
- Posts sem metadados: Não têm dados para migrar
- Abrigos não migrados: O shelter correspondente não existe no Supabase

### Performance Lenta

O script já está otimizado com:
- Batch processing (lotes de 100)
- Queries agrupadas (mapa em memória)
- ~10 queries ao invés de milhares

---

## 📝 Notas Importantes

### ⚠️ Mapeamento de Campos

O WordPress usa `animais` genericamente, mas o banco usa `caes` especificamente:

| WordPress | Supabase |
|-----------|----------|
| `adocoes_de_animais` | `adocoes_caes` |
| `devolucoes_de_animais` | `devolucoes_caes` |
| `eutanasias_de_animais` | `eutanasias_caes` |
| `mortes_naturais_de_animais` | `mortes_naturais_caes` |

Isso está **correto** e documentado nos comentários do código.

### ✅ Integração

Este script faz parte do fluxo unificado de migração e é executado automaticamente no **PASSO 2** de `run-full-migration.js`.

---

## 🎯 Status

✅ **Pronto para produção**

- Scripts corrigidos e testados
- Mapeamento de campos validado
- Integrado ao fluxo unificado
- Documentação completa
