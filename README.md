# 🐾 MVAbrigos Brasil

<div align="center">

**Plataforma Nacional de Mapeamento e Gestão de Abrigos de Animais**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

**Projeto Completo e Pronto para Produção** ✅

[Começar](#-início-rápido) • [Funcionalidades](#-funcionalidades) • [Documentação Técnica](#-documentação-técnica) • [Contribuir](#-contribuindo)

</div>

---

## 📋 Sobre o Projeto

**MVAbrigos Brasil** é a **primeira plataforma nacional** de mapeamento e coleta de dados de abrigos de cães e gatos no Brasil.

### 🎯 Missão

Transformar dados em ação para o bem-estar animal através de:

- 📊 **Mapeamento nacional** de todos os abrigos de animais
- 📈 **Coleta de dados populacionais** para análises estatísticas
- 📚 **Centralização de conhecimento** técnico sobre medicina de abrigos
- 🤝 **Conexão entre abrigos e voluntários**
- 🔍 **Transparência total** dos dados para pesquisadores e público

### 🎉 Destaques (Janeiro 2026)

- ✅ **Sistema completo de gestão** de abrigos, voluntários e vagas
- ✅ **CRUD de vagas** com sistema de candidaturas
- ✅ **Dinâmica populacional** com métricas automáticas
- ✅ **Cache otimizado** para alta performance
- ✅ **Migração automatizada** de dados WordPress

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ (recomendado Node 20)
- Conta Supabase (PostgreSQL)
- Backup WordPress (opcional, para migração)

### Instalação em 3 Passos

```bash
# 1. Clone e instale
git clone https://github.com/AriSilva94/mvabrigosbrasil.git
cd mvabrigosbrasil
npm install

# 2. Configure o ambiente (.env.local)
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_key

# 3. Execute
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Configuração do Banco de Dados

**Primeira vez?** Siga o guia completo: [EXECUTAR-MIGRACAO.md](scripts/migrations/EXECUTAR-MIGRACAO.md)

**Resumo:**

```bash
# 1. Execute os scripts SQL no Supabase (em ordem):
#    - 00-verificacao-inicial.sql
#    - 01-criar-tabelas-legadas.sql
#    - 02-criar-tabelas-dominio.sql
#    - 03-criar-triggers-funcoes.sql
#    - 04-configurar-rls.sql

# 2. (Opcional) Importe backup WordPress nas tabelas *_raw

# 3. Execute migração automatizada
cd scripts/migrations
node run-full-migration.js
```

---

## ✨ Funcionalidades

### Para Abrigos

**Gestão Completa**
- ✅ Cadastro de abrigos com validação robusta
- ✅ Dinâmica populacional mensal com métricas automáticas
- ✅ Histórico de alterações com auditoria
- ✅ Gestão de equipe e permissões
- ✅ Criação e gerenciamento de vagas de voluntariado
- ✅ Visualização de candidatos por vaga

**Métricas Calculadas Automaticamente**
- Taxa de entrada e saída
- Taxa de mortalidade e morbidade
- Balanço populacional
- Tendências (crescimento/decrescimento)

### Para Voluntários

- ✅ Cadastro com perfil público detalhado
- ✅ Busca de vagas com filtros dinâmicos
- ✅ Candidatura para vagas
- ✅ Gestão de candidaturas

### Para Pesquisadores e Público

- ✅ Banco de dados público com gráficos interativos (Highcharts)
- ✅ Mapa nacional de abrigos
- ✅ Filtros por estado, tipo, espécie
- ✅ Relatórios e estatísticas
- ✅ Biblioteca de publicações técnicas
- ✅ Matérias sobre medicina de abrigos

### Autenticação

- ✅ Login híbrido (Supabase + WordPress)
- ✅ Migração automática de usuários WordPress no primeiro login
- ✅ Cadastro diferenciado (Abrigo ou Voluntário)
- ✅ Painéis personalizados por tipo de usuário

---

## 🛠️ Stack Tecnológica

```
Frontend:  Next.js 16 (App Router) + React 19 + TypeScript 5
Styling:   Tailwind CSS 4
Backend:   Next.js API Routes + Supabase (PostgreSQL)
Auth:      Supabase Auth + WordPress Migration
Cache:     Next.js unstable_cache (TTL: 1 hora)
Validação: Zod
Gráficos:  Highcharts
```

### Principais Dependências

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 16.0.10 | Framework full-stack |
| React | 19.2.1 | UI library |
| TypeScript | 5.x | Type safety |
| Supabase | 2.86.2 | Database + Auth |
| Tailwind CSS | 4.x | Styling |
| Zod | 4.1.13 | Validação |
| Highcharts | 12.4.0 | Visualizações |

---

## 📊 Status do Projeto

**Completude:** 100% - **Projeto Completo e Pronto para Produção** ✅

| Categoria | Status |
|-----------|--------|
| Autenticação | ![100%](https://progress-bar.dev/100) |
| Migração de Dados | ![100%](https://progress-bar.dev/100) |
| Rotas Públicas | ![100%](https://progress-bar.dev/100) |
| Rotas Protegidas | ![100%](https://progress-bar.dev/100) |
| Formulários | ![100%](https://progress-bar.dev/100) |
| Banco de Dados | ![100%](https://progress-bar.dev/100) |
| Visualizações | ![100%](https://progress-bar.dev/100) |
| Segurança (RLS) | ![100%](https://progress-bar.dev/100) |
| Performance | ![100%](https://progress-bar.dev/100) |
| Gestão de Equipe | ![100%](https://progress-bar.dev/100) |

### Implementações Concluídas

**Core**
- Sistema de autenticação híbrido
- Migração completa automatizada
- Row Level Security completo
- Sistema de cache otimizado

**Gestão**
- Abrigos, voluntários e vagas (CRUD completo)
- Dinâmica populacional com métricas
- Sistema de candidaturas
- Gestão de equipe

**Visualizações**
- Gráficos interativos
- Mapa nacional
- Filtros dinâmicos
- Relatórios

---

## 📖 Documentação Técnica

### Arquitetura

**Organização em Camadas**

```
┌─────────────────────────────────────────┐
│   PRESENTATION (Pages, Components)      │
├─────────────────────────────────────────┤
│   APPLICATION (Hooks, API Routes)       │
├─────────────────────────────────────────┤
│   DOMAIN (Services, Business Logic)     │
├─────────────────────────────────────────┤
│   INFRASTRUCTURE (Supabase Clients)     │
├─────────────────────────────────────────┤
│   DATA (PostgreSQL + Auth)              │
└─────────────────────────────────────────┘
```

**Estrutura de Pastas**

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Login, cadastro
│   ├── (protected)/    # Área restrita
│   ├── (institutional)/# Páginas públicas
│   ├── (data)/         # Banco de dados público
│   └── api/            # API Routes
├── components/         # Componentes React
│   ├── ui/            # Componentes base
│   ├── auth/          # Autenticação
│   └── data/          # Visualizações
├── lib/               # Bibliotecas
│   ├── supabase/      # Clientes (browser, server, admin)
│   └── auth/          # Autenticação WordPress
└── modules/           # Lógica de domínio
```

### Banco de Dados

**3 Camadas Lógicas**

1. **Autenticação:** `auth.users` (Supabase Auth)

2. **Domínio:**
   - `profiles` - Perfis de usuários
   - `shelters` - Abrigos
   - `volunteers` - Voluntários
   - `vacancies` - Vagas
   - `shelter_dynamics` - Dinâmica populacional
   - `shelter_history` - Histórico de alterações
   - `team_memberships` - Vínculos de equipe

3. **Legado WordPress:**
   - `wp_users_legacy` - Usuários WP (migração)
   - `wp_*_raw` - Dumps brutos

**Segurança (RLS)**
- Tabelas públicas: Leitura pública, escrita via service_role
- Profiles: Usuário acessa apenas próprio perfil
- Legado WP: Acesso bloqueado (apenas service_role)

### Migração WordPress → Supabase

**Sistema Automatizado** em 3 passos:

1. **Scripts SQL** (via Supabase SQL Editor)
   - Criar tabelas
   - Configurar triggers e RLS

2. **Importar backup** WordPress nas tabelas `*_raw`

3. **Executar migração**
   ```bash
   cd scripts/migrations
   node run-full-migration.js
   ```

**O que é migrado:**
- Abrigos (wp_posts → shelters)
- Dinâmica populacional (wp_postmeta → shelter_dynamics)
- Voluntários (wp_posts → volunteers)
- Vagas (wp_posts → vacancies)
- Integrantes de equipe (wp_usermeta → team_memberships)
- Usuários para autenticação (wp_users → wp_users_legacy)

**Autenticação híbrida:**
- Login direto no Supabase (usuários novos)
- Migração automática no primeiro login (usuários WordPress)
- Suporta 3 formatos de hash de senha WordPress

### Design System

**Paleta de Cores**
```css
--color-brand-primary:   #108259  /* Verde principal */
--color-brand-secondary: #5e782a  /* Verde oliva */
--color-brand-accent:    #f2a400  /* Amarelo */
--color-brand-red:       #dc3545  /* Vermelho */
```

**Tipografia**
- Sans-serif: Poppins (Google Fonts)
- Monospace: Geist Mono

**Componentes Base** ([src/components/ui/](src/components/ui/))
- Button, Input, Select, Card
- Spinner, FormError, Dropdown, Modal

### Convenções de Código

- ✅ TypeScript Strict Mode
- ✅ Server Components como padrão
- ✅ `"use client"` apenas quando necessário
- ✅ Validação Zod em client + server
- ✅ Tailwind CSS para estilos
- ✅ Mobile-first responsive design
- ✅ Imports absolutos com alias `@/`

### Performance

**Sistema de Cache**
- Next.js unstable_cache
- Revalidação por tags
- TTL: 1 hora (configurável)
- Invalidação automática em CRUD operations
- Fallback resiliente

---

## 📈 Analytics e SEO

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL absoluta de produção, usada por `robots.ts`, `sitemap.ts` e metadata OG/Twitter |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `"true"`/`"false"` — chave geral, nada carrega se não for `"true"` |
| `NEXT_PUBLIC_ANALYTICS_MODE` | `"gtm"` (recomendado) ou `"ga"` — nunca os dois ao mesmo tempo |
| `NEXT_PUBLIC_GTM_ID` | Container ID do Google Tag Manager (`GTM-XXXXXXX`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Measurement ID do GA4 (`G-XXXXXXXXXX`), usado tanto no modo `ga` direto quanto dentro do GTM |

### Configurando o GTM

1. Cole o Container ID em `NEXT_PUBLIC_GTM_ID` (`.env.local` para dev, variável de ambiente do provedor de deploy para produção).
2. Dentro do painel do GTM, crie uma tag do tipo **Google Tag** apontando para o **Measurement ID do GA4** (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
3. Configure **duas tags** para cobrir o load inicial e a navegação client-side (o GTM não envia nada ao GA4 sozinho — sem uma tag disparando na inicialização, o primeiro pageview de cada sessão nunca é contado):
   - **Tag 1 — Google Tag (configuração GA4):** trigger **Initialization - All Pages**. Dispara uma vez por carregamento do container e envia o pageview inicial.
   - **Tag 2 — GA4 Event:** nome do evento `page_view`, trigger **Custom Event** casando com `page_view`. Captura as trocas de rota client-side que o componente `RouteChangeTracker` dispara — ele ignora deliberadamente a primeira renderização, então nunca duplica o load inicial.
   - **Não adicione um trigger History Change** a nenhuma das duas tags — é isso, e não o "All Pages", que causaria pageviews duplicados.
4. Use o **modo Preview** do GTM (botão "Preview" no painel do container) para validar as tags antes de publicar.
5. Instale a extensão **Google Tag Assistant** para conferir, em tempo real, se o container e as tags disparam corretamente na página.
6. No GA4, confira os relatórios **Realtime** e **DebugView** para validar que os eventos (incluindo os `page_view` de navegação client-side) estão chegando.

### Testando em desenvolvimento

Analytics só carrega quando `NEXT_PUBLIC_VERCEL_ENV=production` (variável que a própria Vercel injeta automaticamente nos deploys de produção — nunca localmente) **e** `NEXT_PUBLIC_ANALYTICS_ENABLED=true` **e** o usuário aceitou a categoria "analytics" no banner de cookies. Isso significa que `.env.local` e até um `npm run build && npm run start` local nunca disparam GTM/GA por engano, mesmo que `NEXT_PUBLIC_ANALYTICS_ENABLED=true` esteja setado — não precisa alternar essa flag manualmente entre dev e produção.

Para testar o carregamento do GTM/GA localmente de propósito, force a variável só naquela sessão de terminal:

```bash
NEXT_PUBLIC_VERCEL_ENV=production npm run dev
```

e aceite a categoria "analytics" no banner de cookies.

### Ambientes não indexáveis

`robots.ts` bloqueia todo crawler (`Disallow: /`) sempre que `VERCEL_ENV` não é `"production"` — cobre preview deployments e desenvolvimento local automaticamente, sem configuração manual.

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit (`git commit -m 'Add: minha feature'`)
4. Push (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga as convenções de código
- Adicione testes quando aplicável
- Atualize a documentação
- Commits atômicos e descritivos

---

## 📚 Documentação Adicional

- **Estrutura do Projeto:** [docs/instrucoes-codex-estrutura.md](docs/instrucoes-codex-estrutura.md)
- **Banco de Dados:** [docs/instrucoes-codex-estrutura-banco-de-dados.md](docs/instrucoes-codex-estrutura-banco-de-dados.md)
- **Guia de Migração:** [scripts/migrations/EXECUTAR-MIGRACAO.md](scripts/migrations/EXECUTAR-MIGRACAO.md)

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev      # Servidor de desenvolvimento (Turbopack)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint

# Migração
cd scripts/migrations
node run-full-migration.js           # Migração completa
node run-full-migration.js --dry-run # Teste sem alterações
```

---

## 🛣️ Roadmap (Melhorias Futuras)

- 📱 PWA para uso offline
- 🔔 Notificações em tempo real
- 📊 Dashboard avançado com mais métricas
- 🌐 Internacionalização (i18n)

---

## 📝 Licença

Este projeto é privado e pertence à iniciativa **Medicina de Abrigos Brasil**.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe **Medicina de Abrigos Brasil**

### Links

- 🌐 [mvabrigosbrasil.com.br](https://mvabrigosbrasil.com.br)
- 📧 [Contato](https://mvabrigosbrasil.com.br/contato)
- 📱 [@medicinaabrigosbrasil](https://instagram.com/medicinaabrigosbrasil)
- 👥 [Facebook](https://facebook.com/medicinaabrigosbrasil)

---

## 🙏 Agradecimentos

Agradecemos a todos os abrigos, voluntários e parceiros que tornam este projeto possível.

---

<div align="center">

**Medicina de Abrigos Brasil** - Transformando dados em ação para o bem-estar animal 🐾

</div>
