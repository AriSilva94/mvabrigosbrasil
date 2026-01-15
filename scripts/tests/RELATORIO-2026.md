# 📊 RELATÓRIO: Dados de 2026 no Banco de Dados Legacy

**Data:** 2026-01-14
**Objetivo:** Investigar por que os dados de 2026 não aparecem corretamente na página `/banco-de-dados`

---

## ✅ DADOS ENCONTRADOS

### Abrigos (2)

| ID  | Nome               | Autor | Data Cadastro |
|-----|--------------------|-------|---------------|
| 647 | Fofoletes de Bigodes | 73    | 2022-11-15    |
| 972 | Adoce uma Vida      | 84    | 2023-04-28    |

### Dinâmicas de 2026 (4)

| ID   | Tipo          | Abrigo ID | Entradas Gatos | Adoções Gatos |
|------|---------------|-----------|----------------|---------------|
| 3076 | dinamica      | 647       | 1              | 1             |
| 3077 | dinamica_lar  | 647       | 1              | 1             |
| 3086 | dinamica      | 972       | 0              | 1             |
| 3087 | dinamica_lar  | 972       | 0              | 1             |

**Totais esperados em JAN/2026:**
- Entradas: 2 gatos
- Adoções: 4 gatos (1 + 1 + 1 + 1)

---

## ❌ PROBLEMAS IDENTIFICADOS

### 1. Nome dos Meta_Keys Diferentes

**Sistema espera (dataLoader.ts:196-214):**
```typescript
entradas_de_animais      // ✅ CORRETO
entradas_de_gatos        // ✅ CORRETO
adocoes_caes             // ❌ ERRADO
adocoes_gatos            // ❌ ERRADO
devolucoes_caes          // ❌ ERRADO
devolucoes_gatos         // ❌ ERRADO
eutanasias_caes          // ❌ ERRADO
eutanasias_gatos         // ❌ ERRADO
mortes_naturais_caes     // ❌ ERRADO
mortes_naturais_gatos    // ❌ ERRADO
```

**Banco de dados legado tem:**
```typescript
entradas_de_animais       // ✅ OK
entradas_de_gatos         // ✅ OK
adocoes_de_animais        // ⚠️ DIFERENTE
adocoes_de_gatos          // ⚠️ DIFERENTE
devolucoes_de_animais     // ⚠️ DIFERENTE
devolucoes_de_gatos       // ⚠️ DIFERENTE
eutanasias_de_animais     // ⚠️ DIFERENTE
eutanasias_de_gatos       // ⚠️ DIFERENTE
mortes_naturais_de_animais  // ⚠️ DIFERENTE
mortes_naturais_de_gatos    // ⚠️ DIFERENTE
retorno_de_caes           // ✅ OK
retorno_de_gatos          // ✅ OK
retorno_local_caes        // ✅ OK
retorno_local_gatos       // ✅ OK
```

### 2. Falta Meta_key para Ano/Mês de Referência

- O sistema busca `referente_ao_ano` e `referente_ao_mes`
- **NÃO existem** esses meta_keys nas dinâmicas de 2026
- A data deve ser extraída do `post_date` da dinâmica

### 3. Abrigos Cadastrados em 2022/2023

- Os abrigos 647 e 972 foram cadastrados em 2022 e 2023
- As dinâmicas são de 2026
- A página `/banco-de-dados` filtra abrigos por ano de cadastro (post_date)
- Por isso mostra "0 abrigos" em 2026

---

## 🔧 SOLUÇÕES

### Solução 1: Corrigir os nomes dos meta_keys no sistema

Atualizar o arquivo `src/lib/database/dataLoader.ts` para usar os nomes corretos:

```typescript
// Linha 196-214 (aproximadamente)
metrics: {
  entradas: parseMetaNumber(dynamic.entradas_de_animais),
  entradasGatos: parseMetaNumber(dynamic.entradas_de_gatos),
  adocoes: parseMetaNumber(dynamic.adocoes_de_animais),        // MUDAR AQUI
  adocoesGatos: parseMetaNumber(dynamic.adocoes_de_gatos),     // MUDAR AQUI
  devolucoes: parseMetaNumber(dynamic.devolucoes_de_animais),  // MUDAR AQUI
  devolucoesGatos: parseMetaNumber(dynamic.devolucoes_de_gatos), // MUDAR AQUI
  eutanasias: parseMetaNumber(dynamic.eutanasias_de_animais),  // MUDAR AQUI
  eutanasiasGatos: parseMetaNumber(dynamic.eutanasias_de_gatos), // MUDAR AQUI
  mortesNaturais: parseMetaNumber(dynamic.mortes_naturais_de_animais), // MUDAR AQUI
  mortesNaturaisGatos: parseMetaNumber(dynamic.mortes_naturais_de_gatos), // MUDAR AQUI
  retornoTutor: parseMetaNumber(dynamic.retorno_de_caes) + parseMetaNumber(dynamic.retorno_de_gatos),
  retornoTutorGatos: parseMetaNumber(dynamic.retorno_de_gatos),
  retornoLocal: parseMetaNumber(dynamic.retorno_local_caes) + parseMetaNumber(dynamic.retorno_local_gatos),
  retornoLocalGatos: parseMetaNumber(dynamic.retorno_local_gatos),
}
```

### Solução 2: Usar post_date para ano/mês

O sistema já usa `post_date` para ano/mês em vez de meta_keys de referência (correto).

### Solução 3: Corrigir contagem de abrigos

A contagem de abrigos deve ser baseada nos abrigos que TEM dinâmicas em 2026, não nos abrigos cadastrados em 2026:

```typescript
// Filtrar abrigos que têm dinâmicas no ano selecionado
const sheltersWithDynamics = shelters.filter(shelter =>
  movements.some(m => m.shelterId === shelter.id && m.year === selectedYear)
);
```

---

## 📝 QUERIES SQL CORRIGIDAS PARA phpMyAdmin

### Query 1: Buscar dinâmicas de 2026

```sql
SELECT
    p.id as dinamica_id,
    p.post_type as tipo_dinamica,
    p.post_date,
    YEAR(p.post_date) as ano,
    MONTH(p.post_date) as mes,

    -- Métricas
    MAX(CASE WHEN pm.meta_key = 'entradas_de_animais' THEN pm.meta_value END) as entradas_caes,
    MAX(CASE WHEN pm.meta_key = 'entradas_de_gatos' THEN pm.meta_value END) as entradas_gatos,
    MAX(CASE WHEN pm.meta_key = 'adocoes_de_animais' THEN pm.meta_value END) as adocoes_caes,
    MAX(CASE WHEN pm.meta_key = 'adocoes_de_gatos' THEN pm.meta_value END) as adocoes_gatos,
    MAX(CASE WHEN pm.meta_key = 'id_abrigo' THEN pm.meta_value END) as abrigo_id
FROM
    wp_posts p
LEFT JOIN
    wp_postmeta pm ON p.id = pm.post_id
WHERE
    p.post_type IN ('dinamica', 'dinamica_lar')
    AND p.post_status = 'publish'
    AND YEAR(p.post_date) = 2026
GROUP BY
    p.id, p.post_type, p.post_date
ORDER BY
    p.post_date;
```

### Query 2: Totais agregados de 2026

```sql
SELECT
    MONTH(p.post_date) as mes,
    SUM(CASE WHEN pm.meta_key = 'entradas_de_animais' THEN CAST(pm.meta_value AS DECIMAL(10,2)) ELSE 0 END) as total_entradas_caes,
    SUM(CASE WHEN pm.meta_key = 'entradas_de_gatos' THEN CAST(pm.meta_value AS DECIMAL(10,2)) ELSE 0 END) as total_entradas_gatos,
    SUM(CASE WHEN pm.meta_key = 'adocoes_de_animais' THEN CAST(pm.meta_value AS DECIMAL(10,2)) ELSE 0 END) as total_adocoes_caes,
    SUM(CASE WHEN pm.meta_key = 'adocoes_de_gatos' THEN CAST(pm.meta_value AS DECIMAL(10,2)) ELSE 0 END) as total_adocoes_gatos
FROM
    wp_posts p
LEFT JOIN
    wp_postmeta pm ON p.id = pm.post_id
WHERE
    p.post_type IN ('dinamica', 'dinamica_lar')
    AND p.post_status = 'publish'
    AND YEAR(p.post_date) = 2026
GROUP BY
    MONTH(p.post_date)
ORDER BY
    mes;
```

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Identificar dados de 2026 no banco (CONCLUÍDO)
2. ⏳ Corrigir nomes dos meta_keys no `dataLoader.ts`
3. ⏳ Atualizar schema do Supabase `shelter_dynamics`
4. ⏳ Testar migração de dados
5. ⏳ Validar gráficos em `/banco-de-dados`

---

**Conclusão:** Os dados de 2026 EXISTEM no banco legado, mas o sistema não consegue carregá-los devido aos nomes diferentes dos meta_keys. A correção é simples e deve resolver o problema.
