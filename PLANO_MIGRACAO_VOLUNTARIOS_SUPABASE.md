# 📋 Plano de Migração: Voluntários JSON → Supabase

## 🎯 Objetivo
Refatorar o fluxo de voluntários para buscar dados do Supabase (`wp_posts_raw` e `wp_postmeta_raw`) ao invés de arquivos JSON estáticos, mantendo o padrão arquitetural do projeto.

---

## 📊 Análise da Situação Atual

### Arquivos que usam JSON atualmente:
1. **`src/components/volunteers/hooks/useVolunteerCards.ts`**
   - Importa: `wp_posts_voluntario.json`, `wp_postmeta.json`
   - Busca: `cidade`, `estado`, `genero`, `disponibilidade`
   - Uso: Lista de voluntários com filtros

2. **`src/services/volunteersService.ts`**
   - Importa: `wp_posts_voluntario.json`, `wp_postmeta.json`
   - Busca: `cidade`, `estado`, `profissao`, `escolaridade`, `experiencia`, `disponibilidade`, `descricao`, `periodo`, `comentarios`
   - Uso: Detalhes do perfil individual

### Padrão arquitetural identificado:
- ✅ Repositories em `src/modules/auth/repositories/` (exemplo: `wpPostsRepository.ts`, `wpUsersLegacyRepository.ts`)
- ✅ Clients Supabase: `clientServer.ts` (SSR) e `clientBrowser.ts` (CSR)
- ✅ Tipagem centralizada em `src/lib/supabase/types.ts`
- ✅ Constantes em `src/constants/`

---

## 🗂️ Estrutura da Migração

### FASE 1: Setup de Tipos e Infraestrutura

#### 1.1. Atualizar tipos do Supabase
**Arquivo:** `src/lib/supabase/types.ts`

**Ação:** Expandir tipos de `wp_posts_raw` e adicionar `wp_postmeta_raw`

```typescript
wp_posts_raw: {
  Row: {
    id: number;
    post_author: number | null;
    post_date: string | null;
    post_date_gmt: string | null;
    post_content: string | null;
    post_title: string | null;
    post_excerpt: string | null;
    post_status: string | null;
    comment_status: string | null;
    ping_status: string | null;
    post_password: string | null;
    post_name: string | null;
    to_ping: string | null;
    pinged: string | null;
    post_modified: string | null;
    post_modified_gmt: string | null;
    post_content_filtered: string | null;
    post_parent: number | null;
    guid: string | null;
    menu_order: number | null;
    post_type: string | null;
    post_mime_type: string | null;
    comment_count: number | null;
  };
  Insert: { ... };
  Update: { ... };
  Relationships: [];
};
wp_postmeta_raw: {
  Row: {
    meta_id: number;
    post_id: number | null;
    meta_key: string | null;
    meta_value: string | null;
  };
  Insert: { ... };
  Update: { ... };
  Relationships: [];
};
```

#### 1.2. Expandir constantes de metadados
**Arquivo:** `src/constants/volunteerMetaKeys.ts`

**Ação:** Adicionar todas as chaves usadas no perfil completo

```typescript
export const VOLUNTEER_META_KEYS = {
  // Existentes
  CITY: "cidade",
  STATE: "estado",
  GENDER: "genero",
  AVAILABILITY: "disponibilidade",

  // Novos (para perfil completo)
  PROFESSION: "profissao",
  SCHOOLING: "escolaridade",
  EXPERIENCE: "experiencia",
  SKILLS: "descricao",
  PERIOD: "periodo",
  NOTES: "comentarios",
} as const;
```

---

### FASE 2: Criar Camada de Repositório

#### 2.1. Criar Repository para Voluntários
**Novo arquivo:** `src/repositories/volunteersRepository.ts`

**Responsabilidades:**
- Buscar posts do tipo "voluntario"
- Buscar metadados associados
- Aplicar filtros (estado, gênero, disponibilidade)
- Ordenação por data

**Funções principais:**
```typescript
// Buscar todos os voluntários com metadados básicos (para lista)
export async function fetchVolunteerCards(
  supabase: SupabaseClientType,
  filters?: {
    estado?: string;
    genero?: string;
    disponibilidade?: string;
  }
): Promise<VolunteerCard[]>

// Buscar um voluntário específico por slug com todos os metadados
export async function fetchVolunteerProfileBySlug(
  supabase: SupabaseClientType,
  slug: string
): Promise<VolunteerProfile | null>
```

**Padrão de implementação:**
1. Query em `wp_posts_raw` filtrando por `post_type = 'voluntario'` e `post_status = 'publish'`
2. Query em `wp_postmeta_raw` buscando metadados dos posts encontrados
3. Combinar dados (map de metadata por post_id)
4. Transformar em tipos do domínio (`VolunteerCard` ou `VolunteerProfile`)

---

### FASE 3: Refatorar Hooks e Services

#### 3.1. Refatorar `useVolunteerCards`
**Arquivo:** `src/components/volunteers/hooks/useVolunteerCards.ts`

**Mudanças:**
- ❌ Remover imports de JSON
- ✅ Usar `getBrowserSupabaseClient()`
- ✅ Chamar `fetchVolunteerCards()` do repository
- ✅ Implementar loading/error states com `useState` e `useEffect`
- ✅ Manter tipagem `VolunteerCard[]`

**Assinatura:**
```typescript
export function useVolunteerCards(): {
  volunteers: VolunteerCard[];
  loading: boolean;
  error: Error | null;
}
```

#### 3.2. Refatorar `volunteersService`
**Arquivo:** `src/services/volunteersService.ts`

**Mudanças:**
- ❌ Remover imports de JSON
- ✅ Usar `getServerSupabaseClient({ readOnly: true })`
- ✅ Chamar `fetchVolunteerProfileBySlug()` do repository
- ✅ Manter função síncrona → converter para **async**

**Assinatura:**
```typescript
export async function getVolunteerProfileBySlug(
  slug: string
): Promise<VolunteerProfile | null>
```

**⚠️ BREAKING CHANGE:** Função vira async, precisa ajustar consumidores

---

### FASE 4: Ajustar Páginas

#### 4.1. Ajustar página de lista
**Arquivo:** `src/app/(protected)/voluntarios/page.tsx`

**Mudanças:**
- ✅ `useVolunteerCards()` agora retorna `{ volunteers, loading, error }`
- ✅ Adicionar UI de loading (skeleton ou spinner)
- ✅ Adicionar UI de erro
- ✅ Ajustar filtros para funcionar com dados assíncronos

#### 4.2. Ajustar página de perfil
**Arquivo:** `src/app/(volunteers)/voluntario/[slug]/page.tsx`

**Mudanças:**
- ✅ `getVolunteerProfileBySlug()` já é chamada em Server Component (já é async)
- ✅ Apenas adicionar `await` na chamada (linha 19)

```typescript
// Antes
const profile = getVolunteerProfileBySlug(slug);

// Depois
const profile = await getVolunteerProfileBySlug(slug);
```

---

### FASE 5: Otimizações e Boas Práticas

#### 5.1. Implementar cache
- Usar `unstable_cache` do Next.js para cachear queries
- Revalidar a cada X minutos (ex: 5 min)

#### 5.2. Implementar paginação (opcional)
- Se lista de voluntários crescer muito
- Usar `.range()` do Supabase

#### 5.3. Indexação no Supabase
- Criar índices em `wp_posts_raw`:
  - `post_type`, `post_status`, `post_name`
- Criar índices em `wp_postmeta_raw`:
  - `post_id`, `meta_key`

---

### FASE 6: Limpeza

#### 6.1. Arquivos para REMOVER (após testes):
- ❌ `src/components/volunteers/hooks/useVolunteerCards.ts` (código antigo, será refatorado)
- ❌ `src/services/volunteersService.ts` (código antigo, será refatorado)
- ❌ `src/lib/database/dataLoader.ts` (se só for usado para voluntários)

#### 6.2. Arquivos JSON para MANTER:
- ✅ `src/data/wp/wp_posts_voluntario.json` (manter como backup/fallback)
- ✅ `src/data/wp/wp_postmeta.json` (manter como backup/fallback)

#### 6.3. Arquivos para ATUALIZAR:
- ✅ Remover imports de JSON nos arquivos refatorados
- ✅ Atualizar testes (se existirem)

---

## 📝 Checklist de Implementação

### Setup Inicial
- [ ] Atualizar tipos do Supabase (`types.ts`)
- [ ] Expandir constantes de metadados (`volunteerMetaKeys.ts`)

### Camada de Dados
- [ ] Criar `src/repositories/volunteersRepository.ts`
- [ ] Implementar `fetchVolunteerCards()`
- [ ] Implementar `fetchVolunteerProfileBySlug()`
- [ ] Adicionar tratamento de erros
- [ ] Adicionar logs para debugging

### Refatoração de Hooks/Services
- [ ] Refatorar `useVolunteerCards` para usar Supabase
- [ ] Adicionar loading/error states
- [ ] Refatorar `volunteersService` para async
- [ ] Testar queries no Supabase

### Ajustes de UI
- [ ] Adicionar loading state na lista de voluntários
- [ ] Adicionar error state na lista de voluntários
- [ ] Ajustar página de perfil para await async service
- [ ] Testar filtros com dados do Supabase

### Testes e Validação
- [ ] Testar lista de voluntários
- [ ] Testar filtros (estado, gênero, disponibilidade)
- [ ] Testar perfil individual
- [ ] Testar caso de voluntário não encontrado
- [ ] Testar performance (comparar com JSON)

### Otimizações
- [ ] Implementar cache no Next.js
- [ ] Criar índices no Supabase
- [ ] Implementar paginação (se necessário)

### Limpeza
- [ ] Remover imports de JSON dos arquivos refatorados
- [ ] Documentar mudanças
- [ ] Atualizar README (se necessário)

---

## 🚀 Ordem de Execução Recomendada

1. **Setup (FASE 1)** → Preparar infraestrutura
2. **Repository (FASE 2)** → Criar camada de acesso a dados
3. **Services (FASE 3.2)** → Refatorar service (mais simples)
4. **Perfil (FASE 4.2)** → Testar com página de perfil (mais simples)
5. **Hook (FASE 3.1)** → Refatorar hook com estados
6. **Lista (FASE 4.1)** → Ajustar página de lista com loading
7. **Otimizações (FASE 5)** → Melhorar performance
8. **Limpeza (FASE 6)** → Remover código antigo

---

## ⚠️ Pontos de Atenção

### Breaking Changes
- `getVolunteerProfileBySlug()` vira **async** (ajustar página de perfil)
- `useVolunteerCards()` retorna objeto com `{ volunteers, loading, error }` (ajustar página de lista)

### Performance
- JSON é síncrono e instantâneo
- Supabase é assíncrono e depende de rede
- **Solução:** Cache + Loading states

### Compatibilidade
- Manter estrutura de tipos existente (`VolunteerCard`, `VolunteerProfile`)
- Manter lógica de filtros
- Manter comportamento de ordenação (mais recentes primeiro)

### Fallback
- Considerar fallback para JSON em caso de erro do Supabase?
- Ou apenas mostrar erro ao usuário?

---

## 🎯 Resultado Esperado

### Antes (JSON):
```typescript
// Síncrono, rápido, estático
const volunteers = useVolunteerCards(); // VolunteerCard[]
const profile = getVolunteerProfileBySlug(slug); // VolunteerProfile | null
```

### Depois (Supabase):
```typescript
// Assíncrono, dinâmico, com estados
const { volunteers, loading, error } = useVolunteerCards(); // React Hook
const profile = await getVolunteerProfileBySlug(slug); // Async Server Function
```

### Benefícios:
✅ Dados sempre atualizados (sem rebuild)
✅ Filtragem no banco (mais eficiente)
✅ Preparado para paginação
✅ Consistência com resto do projeto (Supabase)
✅ Facilita futuras features (busca, favoritos, etc)

---

**Estimativa de tempo:** 4-6 horas de desenvolvimento + 2 horas de testes
**Risco:** Baixo (mudança isolada, tipos bem definidos)
**Impacto:** Médio (2 páginas + 1 hook + 1 service)
