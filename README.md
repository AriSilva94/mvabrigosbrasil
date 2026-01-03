# 🐾 MVAbrigos Brasil

<div align="center">

**Plataforma Nacional de Mapeamento e Gestão de Abrigos de Animais**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

[Documentação](#-documentação) • [Instalação](#-instalação) • [Arquitetura](#-arquitetura) • [Contribuir](#-contribuindo)

</div>

---

## 📋 Sobre o Projeto

**MVAbrigos Brasil** é a primeira iniciativa de mapeamento e coleta de dados de abrigos de cães e gatos no Brasil. A plataforma apresenta o banco de dados nacional de abrigos, reúne materiais técnicos sobre medicina de abrigos e facilita o cadastro de abrigos, lares temporários e voluntários.

### 🎯 Objetivos

- 📊 **Mapear** todos os abrigos de animais do Brasil
- 📈 **Coletar** dados populacionais para análises estatísticas
- 📚 **Centralizar** conhecimento técnico sobre medicina de abrigos
- 🤝 **Conectar** abrigos e voluntários
- 🔍 **Transparência** de dados para pesquisadores e público geral

### ✨ Funcionalidades Principais

#### Autenticação e Gestão de Usuários
- ✅ Login com migração automática de usuários WordPress
- ✅ Cadastro diferenciado (Abrigo ou Voluntário)
- ✅ Área restrita com painéis personalizados
- ✅ Sistema híbrido (Supabase Auth + legado WordPress)

#### Gestão de Abrigos
- ✅ Cadastro completo de abrigos com validação robusta
- ✅ Formulário de dinâmica populacional (frontend completo)
- ✅ Tipos de abrigo: público, privado, misto, lar temporário
- ✅ Gestão de espécies e população inicial

#### Dados e Visualizações
- ✅ Banco de dados público com gráficos interativos (Highcharts)
- ✅ Mapa nacional de abrigos
- ✅ Filtros dinâmicos por estado, tipo, espécie
- ✅ Relatórios e estatísticas

#### Conteúdo Educacional
- ✅ Biblioteca de publicações técnicas
- ✅ Matérias sobre medicina de abrigos
- ✅ Páginas institucionais completas

---

## 🚀 Tecnologias

### Core Stack

```
Frontend:  Next.js 16 (App Router) + React 19 + TypeScript 5
Styling:   Tailwind CSS 4
Backend:   Next.js API Routes + Supabase (PostgreSQL)
Auth:      Supabase Auth + WordPress Migration
```

### Principais Dependências

| Categoria | Tecnologia | Versão | Uso |
|-----------|-----------|--------|-----|
| **Framework** | Next.js | 16.0.7 | App Router, SSR, API Routes |
| **UI Library** | React | 19.2.1 | Componentes e interatividade |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Database** | Supabase | 2.86.2 | PostgreSQL + Auth + Storage |
| **Validation** | Zod | 4.1.13 | Schema validation |
| **Charts** | Highcharts | 12.4.0 | Visualizações de dados |
| **Icons** | Lucide React | 0.554.0 | Ícones SVG |
| **Toast** | Sonner | 2.0.7 | Notificações |
| **Security** | bcryptjs | 3.0.3 | Password hashing (WP migration) |

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18+ (recomendado Node 20)
- **npm** ou **yarn** ou **pnpm**
- **Conta Supabase** (projeto criado com banco PostgreSQL)
- **Backup WordPress** (para migração de dados legados)

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/AriSilva94/mvabrigosbrasil.git
   cd mvabrigosbrasil
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env.local` na raiz do projeto com base no exemplo em [scripts/migrations/.env.example](scripts/migrations/.env.example):
   ```env
   # Supabase - URLs e chaves de API
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

   # Database - URL direta para migrations (opcional)
   DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres

   # ImageKit - CDN de imagens (opcional)
   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=sua_url_imagekit
   NEXT_PUBLIC_IMAGEKIT_ENABLED=false
   ```

4. **Configure o banco de dados** (primeira vez ou reset)

   Consulte o guia completo de migração: [scripts/migrations/EXECUTAR-MIGRACAO.md](scripts/migrations/EXECUTAR-MIGRACAO.md)

   Resumo dos passos:
   ```bash
   # 1. Executar scripts SQL no Supabase SQL Editor (nesta ordem):
   # - 00-verificacao-inicial.sql
   # - 01-criar-tabelas-legadas.sql
   # - 02-criar-tabelas-dominio.sql
   # - 03-criar-triggers-funcoes.sql
   # - 04-configurar-rls.sql

   # 2. Importar backup WordPress nas tabelas *_raw via SQL Editor

   # 3. Executar migração completa automatizada:
   cd scripts/migrations
   node run-full-migration.js
   ```

5. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação**

   Abra [http://localhost:3000](http://localhost:3000) no navegador

### Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento (Turbopack)
npm run build    # Build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa ESLint
```

### Scripts de Migração

Todos os scripts de migração estão em [scripts/migrations/](scripts/migrations/):

```bash
# Migração completa automatizada (recomendado)
node run-full-migration.js

# Migração com dry-run (teste sem alterações)
node run-full-migration.js --dry-run

# Migrações individuais (manual)
node abrigos/migrate-shelters-wp-to-supabase.js
node voluntarios/migrate-volunteers-wp-to-supabase.js
node vagas-voluntariado/migrate-vacancies-wp-to-supabase.js
node equipe/migrate-team-members-wp-to-supabase.js
```

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
mvabrigosbrasil/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Rotas de autenticação
│   │   ├── (protected)/         # Rotas protegidas (requer login)
│   │   ├── (institutional)/     # Páginas institucionais
│   │   ├── (data)/              # Dados públicos
│   │   ├── (content)/           # Conteúdo (biblioteca, matérias)
│   │   ├── (volunteers)/        # Voluntariado
│   │   ├── (legal)/             # Documentos legais
│   │   ├── api/                 # API Routes
│   │   ├── layout.tsx           # Layout raiz
│   │   └── page.tsx             # Home page
│   │
│   ├── components/              # Componentes React
│   │   ├── layout/              # Header, Footer, Layouts
│   │   ├── ui/                  # Componentes base (Button, Input, etc)
│   │   ├── auth/                # Componentes de autenticação
│   │   ├── data/                # Componentes de visualização de dados
│   │   ├── volunteers/          # Componentes de voluntários
│   │   └── home/                # Seções da home page
│   │
│   ├── lib/                     # Bibliotecas e utilitários
│   │   ├── supabase/            # Clientes Supabase (browser, server, admin)
│   │   ├── auth/                # Autenticação e validação de senhas WP
│   │   └── database/            # Helpers de banco de dados
│   │
│   ├── modules/                 # Módulos de domínio
│   │   ├── auth/                # Lógica de autenticação
│   │   │   ├── loginService.ts  # Serviço de login com migração
│   │   │   └── repositories/    # Repositórios de dados
│   │   └── shelter/             # Lógica de abrigos
│   │
│   ├── services/                # Camada de serviços
│   ├── hooks/                   # Custom React Hooks
│   ├── types/                   # Definições TypeScript
│   ├── constants/               # Constantes e configurações
│   ├── data/                    # Dados estáticos
│   ├── store/                   # Estado global (planejado)
│   └── styles/                  # Estilos globais
│
├── public/                      # Assets estáticos
├── docs/                        # Documentação do projeto
├── .env.local                   # Variáveis de ambiente (local)
├── next.config.ts               # Configuração Next.js
├── tailwind.config.ts           # Configuração Tailwind
└── tsconfig.json                # Configuração TypeScript
```

### Arquitetura de Camadas

```
┌─────────────────────────────────────────┐
│      PRESENTATION LAYER                 │
│  (Pages, Components, Client State)      │
├─────────────────────────────────────────┤
│      APPLICATION LAYER                  │
│  (Hooks, API Routes, Form Logic)        │
├─────────────────────────────────────────┤
│      DOMAIN LAYER                       │
│  (Services, Modules, Business Logic)    │
├─────────────────────────────────────────┤
│      INFRASTRUCTURE LAYER               │
│  (Supabase Clients, Repositories)       │
├─────────────────────────────────────────┤
│      DATA LAYER                         │
│  (Supabase PostgreSQL + Auth)           │
└─────────────────────────────────────────┘
```

### Clientes Supabase

O projeto utiliza **3 tipos de clientes** Supabase para diferentes contextos:

1. **Cliente Browser** ([src/lib/supabase/clientBrowser.ts](src/lib/supabase/clientBrowser.ts))
   - Uso: Hooks, componentes client-side
   - Características: Singleton, gerenciamento automático de cookies

2. **Cliente Server** ([src/lib/supabase/clientServer.ts](src/lib/supabase/clientServer.ts))
   - Uso: Server Components, API Routes
   - Características: SSR-ready, integração com Next.js cookies

3. **Cliente Admin** ([src/lib/supabase/supabase-admin.ts](src/lib/supabase/supabase-admin.ts))
   - Uso: Operações privilegiadas (criar usuários, bypass RLS)
   - Características: Service Role Key, acesso total

---

## 🗄️ Banco de Dados

### Arquitetura de 3 Camadas

O banco de dados é organizado em **3 camadas lógicas**:

1. **Camada de Autenticação**
   - `auth.users` (Supabase Auth - gerenciado automaticamente)

2. **Camada de Domínio** (tabelas do sistema novo)
   - `public.profiles` - Perfis de usuários
   - `public.shelters` - Abrigos de animais
   - `public.volunteers` - Voluntários cadastrados
   - `public.vacancies` - Vagas de voluntariado
   - `public.shelter_dynamics` - Dinâmicas populacionais mensais
   - `public.shelter_volunteers` - Relação N:N entre abrigos e voluntários
   - `public.shelter_history` - Histórico de alterações em abrigos
   - `public.team_memberships` - Membros da equipe MVAbrigos

3. **Camada Legada** (WordPress - staging de migração)
   - `public.wp_users_legacy` - Usuários WP (para migração no login)
   - `public.wp_users_raw` - Dump bruto de wp_users
   - `public.wp_posts_raw` - Dump bruto de wp_posts
   - `public.wp_postmeta_raw` - Dump bruto de wp_postmeta

### Modelo de Dados Principal

#### **profiles** - Perfil do Usuário

Conecta `auth.users` (Supabase Auth) com dados de domínio:

- `id` (uuid, PK, FK → `auth.users.id`)
- `email`, `full_name`, `phone`
- `wp_user_id` → ID WordPress original (para usuários migrados)
- `origin` → `'wordpress_migrated'` | `'supabase_native'` | `'admin_created'`
- `role` → Papel no sistema (admin, abrigo, voluntário)

**RLS:** Usuário só acessa próprio perfil

#### **shelters** - Abrigos

Dados completos de abrigos de animais migrados e novos:

- `id` (bigint, PK)
- `wp_post_id` (integer, unique) - ID do post WordPress original
- `profile_id` (uuid, FK → `profiles.id`) - Dono do cadastro
- Identificação: `name`, `cnpj`/`cpf`, `shelter_type`
- Localização: `cep`, `street`, `number`, `district`, `city`, `state`
- Espécies: `species`, `additional_species`, `temporary_agreement`
- População inicial: `initial_dogs`, `initial_cats`
- Responsável: `authorized_name`, `authorized_email`, `authorized_phone`, `authorized_role`
- Status: `active`, `accept_terms`

**RLS:** Leitura pública, escrita apenas via service_role

#### **volunteers** - Voluntários

Cadastro de voluntários disponíveis:

- `id` (bigint, PK)
- `wp_post_id` (integer, unique) - ID do post WordPress original
- `owner_profile_id` (uuid, FK → `profiles.id`)
- `name`, `slug` (único para URLs)
- `telefone`, `cidade`, `estado`
- Dados profissionais: `profissao`, `escolaridade`, `faixa_etaria`, `genero`
- Disponibilidade: `experiencia`, `atuacao`, `disponibilidade`, `periodo`
- `descricao`, `comentarios`
- `is_public`, `accept_terms`

**RLS:** Leitura pública, escrita apenas via service_role

#### **vacancies** - Vagas

Oportunidades de voluntariado em abrigos:

- `id` (bigint, PK)
- `wp_post_id` (integer, unique)
- `shelter_id` (bigint, FK → `shelters.id`)
- `title`, `slug`, `description`
- `location` (cidade/estado)
- `status` (aberta/fechada)

**RLS:** Leitura pública, escrita apenas via service_role

#### **shelter_dynamics** - Dinâmica Populacional

Dados mensais de movimentação de animais:

- `id` (bigint, PK)
- `shelter_id` (bigint, FK → `shelters.id`)
- `reference_month` (date) - Mês de referência
- Campos de entrada, saída, população para cães e gatos
- Status de validação e publicação

**RLS:** Leitura pública, escrita apenas via service_role

#### **shelter_history** - Histórico de Abrigos

Registro automático de alterações em shelters via trigger:

- `id`, `shelter_id`, `profile_id`
- `changed_fields` (jsonb) - Campos alterados
- `created_at`

**RLS:** Usuário acessa próprio histórico

#### **team_memberships** - Membros da Equipe

Controle de acesso à dinâmica populacional:

- `id`, `profile_id`, `role`
- `can_access_all_dynamics` (boolean)
- `active`

**RLS:** Apenas service_role (backend)

### Tabelas de Migração WordPress

#### **wp_users_legacy**

Usuários WordPress para migração automática no primeiro login:

- `id`, `user_login`, `user_email`, `user_pass`, `display_name`
- `migrated` (boolean), `migrated_at` (timestamp)
- **Acesso:** Apenas service_role (bloqueado para anon/authenticated)
- **Uso:** Validação de senha WordPress (bcrypt/phpass), criação de conta Supabase

#### **wp_posts_raw**, **wp_postmeta_raw**, **wp_users_raw**

Dumps brutos do WordPress para staging de migração:

- Fonte original para scripts de migração
- **Acesso:** Apenas service_role
- **Uso:** Scripts de migração, auditoria, histórico

### Migração de Dados

O projeto implementa um **sistema completo de migração automatizada** do WordPress para Supabase.

#### Scripts SQL (executar via Supabase SQL Editor)

1. [00-verificacao-inicial.sql](scripts/migrations/sql/00-verificacao-inicial.sql) - Verificação de pré-requisitos
2. [01-criar-tabelas-legadas.sql](scripts/migrations/sql/01-criar-tabelas-legadas.sql) - Tabelas `wp_*_raw` e `wp_users_legacy`
3. [02-criar-tabelas-dominio.sql](scripts/migrations/sql/02-criar-tabelas-dominio.sql) - Tabelas de domínio (shelters, volunteers, etc.)
4. [03-criar-triggers-funcoes.sql](scripts/migrations/sql/03-criar-triggers-funcoes.sql) - Triggers e funções auxiliares
5. [04-configurar-rls.sql](scripts/migrations/sql/04-configurar-rls.sql) - Row Level Security e policies
6. [05-pre-migracao-desabilitar-triggers.sql](scripts/migrations/sql/05-pre-migracao-desabilitar-triggers.sql) - Otimização pré-migração
7. [06-pos-migracao-reabilitar-triggers.sql](scripts/migrations/sql/06-pos-migracao-reabilitar-triggers.sql) - Reabilitar triggers
8. [07-validacao-final.sql](scripts/migrations/sql/07-validacao-final.sql) - Validação de integridade

#### Migração Automatizada (run-full-migration.js)

Executa **18 passos automatizados**:

- Migração de abrigos (WordPress → `shelters`)
- Migração de dinâmicas populacionais (metadados → `shelter_dynamics`)
- Migração de membros de equipe (WP users → `team_memberships`)
- Migração de voluntários (WP posts → `volunteers`)
- Migração de vagas (WP posts → `vacancies`)
- Vinculação de vagas aos abrigos
- Geração de slugs únicos
- Popular `wp_users_legacy` para autenticação
- Validação completa de integridade
- Configuração final de RLS

#### Scripts Individuais

- [abrigos/migrate-shelters-wp-to-supabase.js](scripts/migrations/abrigos/migrate-shelters-wp-to-supabase.js)
- [voluntarios/migrate-volunteers-wp-to-supabase.js](scripts/migrations/voluntarios/migrate-volunteers-wp-to-supabase.js)
- [vagas-voluntariado/migrate-vacancies-wp-to-supabase.js](scripts/migrations/vagas-voluntariado/migrate-vacancies-wp-to-supabase.js)
- [equipe/migrate-team-members-wp-to-supabase.js](scripts/migrations/equipe/migrate-team-members-wp-to-supabase.js)
- [abrigos/dinamica-populacional/migrate-dynamics-wp-to-supabase-optimized.js](scripts/migrations/abrigos/dinamica-populacional/migrate-dynamics-wp-to-supabase-optimized.js)

### Segurança (Row Level Security)

Todas as tabelas possuem **RLS habilitado** com políticas específicas:

- **Tabelas legadas WordPress:** Bloqueadas para anon/authenticated (apenas service_role)
- **Profiles:** Usuário só acessa e atualiza próprio perfil
- **Tabelas de domínio:** Leitura pública (`SELECT`), escrita apenas via service_role
- **Team memberships:** Acesso apenas via service_role (backend)
- **Shelter history:** Usuário visualiza apenas próprio histórico

Para mais detalhes sobre o modelo de dados e regras de segurança, consulte:

- [docs/instrucoes-codex-estrutura-banco-de-dados.md](docs/instrucoes-codex-estrutura-banco-de-dados.md)
- [scripts/migrations/EXECUTAR-MIGRACAO.md](scripts/migrations/EXECUTAR-MIGRACAO.md)

---

## 🔐 Autenticação

### Sistema Híbrido (WordPress + Supabase)

O projeto implementa um **sistema de migração automática** de usuários WordPress:

#### Fluxo de Login

1. **Tentativa de Login Direto**
   - Tenta autenticar no Supabase Auth
   - Se sucesso → redireciona para painel

2. **Migração Automática** (se login falhar)
   - Busca usuário em `wp_users_legacy`
   - Valida senha WordPress (suporta 3 formatos de hash)
   - Cria usuário no Supabase Auth
   - Cria perfil em `profiles` com `origin: 'wordpress_migrated'`
   - Marca usuário como migrado
   - Login automático

#### Validação de Senha WordPress

Suporta **3 formatos de hash**:
- `$wp$` (novo): HMAC-SHA384 + bcrypt
- `$P$` / `$H$` (antigo): phpass

Implementação: [src/lib/auth/wordpressPassword.ts](src/lib/auth/wordpressPassword.ts)

---

## 🎨 Design System

### Paleta de Cores

```css
--color-brand-primary:   #108259  /* Verde principal */
--color-brand-secondary: #5e782a  /* Verde oliva */
--color-brand-accent:    #f2a400  /* Amarelo destaque */
--color-brand-red:       #dc3545  /* Vermelho */
--color-text-default:    #696b7e  /* Texto padrão */
--color-bg-light:        #f5f5f6  /* Background claro */
```

### Tipografia

- **Sans-serif:** Poppins (Google Fonts)
- **Monospace:** Geist Mono (local, 9 weights)

### Componentes Base

Kit de componentes reutilizáveis em [src/components/ui/](src/components/ui/):
- `Button` - Botão com variantes
- `Input` - Input com validação visual
- `Select` - Select customizado
- `Card` - Container de card
- `Spinner` - Loading indicator
- `FormError` - Mensagem de erro
- `Dropdown` - Dropdown genérico
- `Modal` - Modal overlay

---

## 📊 Status do Projeto

| Categoria | Progresso | Detalhes |
|-----------|-----------|----------|
| **Autenticação** | ![100%](https://progress-bar.dev/100) | Login, cadastro, migração WP, alteração de senha ✅ |
| **Migração de Dados** | ![100%](https://progress-bar.dev/100) | Scripts SQL, migração automatizada, validações ✅ |
| **Rotas Públicas** | ![95%](https://progress-bar.dev/95) | Institucional, conteúdo, dados, mapas ✅ |
| **Rotas Protegidas** | ![85%](https://progress-bar.dev/85) | Painel, cadastros, dinâmica populacional ✅<br>Gestão de vagas ⏳ |
| **Formulários** | ![90%](https://progress-bar.dev/90) | Cadastro abrigo, voluntário, dinâmica ✅<br>Validações Zod ✅ |
| **Banco de Dados** | ![100%](https://progress-bar.dev/100) | Schema completo, triggers, RLS ✅ |
| **Visualizações** | ![85%](https://progress-bar.dev/85) | Gráficos Highcharts, mapas, filtros ✅ |
| **Segurança (RLS)** | ![100%](https://progress-bar.dev/100) | Políticas configuradas em todas as tabelas ✅ |

**Completude Geral:** ~94%

### ✅ Concluído

- ✅ Sistema de autenticação híbrido (Supabase + WordPress)
- ✅ Migração completa automatizada de dados
- ✅ Cadastro de abrigos com validação robusta
- ✅ Cadastro de voluntários e vagas
- ✅ Formulário de dinâmica populacional
- ✅ Sistema de controle de acesso (team memberships)
- ✅ Histórico automático de alterações em abrigos
- ✅ Banco de dados público com visualizações
- ✅ Row Level Security completo

### 🚧 Em Desenvolvimento

- 🔄 Gestão completa de vagas de voluntariado
- 🔄 Perfis públicos detalhados de voluntários

---

## 📖 Documentação

### Documentos Principais

- **Estrutura do Projeto:** [docs/instrucoes-codex-estrutura.md](docs/instrucoes-codex-estrutura.md)
- **Banco de Dados:** [docs/instrucoes-codex-estrutura-banco-de-dados.md](docs/instrucoes-codex-estrutura-banco-de-dados.md)

### Convenções de Código

- ✅ **TypeScript Strict Mode** habilitado
- ✅ **Server Components** como padrão (Next.js 16)
- ✅ `"use client"` apenas quando necessário
- ✅ **Validação Zod** em client + server
- ✅ **Tailwind CSS** para estilos
- ✅ **Mobile-first** responsive design
- ✅ Alias `@/` para imports absolutos

### Estrutura de Rotas

O projeto usa **Route Groups** do Next.js para organização:

```
(auth)/         → Autenticação (login, register)
(protected)/    → Área restrita (painel, cadastros)
(institutional)/→ Páginas institucionais
(data)/         → Dados públicos
(content)/      → Conteúdo (biblioteca, matérias)
(volunteers)/   → Voluntariado
(legal)/        → Documentos legais
```

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### Diretrizes

- Siga as convenções de código do projeto
- Adicione testes quando aplicável
- Atualize a documentação conforme necessário
- Mantenha commits atômicos e descritivos

---

## 📝 Licença

Este projeto é privado e pertence à iniciativa **Medicina de Abrigos Brasil**.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe **Medicina de Abrigos Brasil**

### Links Úteis

- 🌐 **Website:** [mvabrigosbrasil.com.br](https://mvabrigosbrasil.com.br)
- 📧 **Contato:** [Página de Contato](https://mvabrigosbrasil.com.br/contato)
- 📱 **Instagram:** [@medicinaabrigosbrasil](https://instagram.com/medicinaabrigosbrasil)
- 👥 **Facebook:** [Medicina de Abrigos Brasil](https://facebook.com/medicinaabrigosbrasil)

---

## 🙏 Agradecimentos

Agradecemos a todos os abrigos, voluntários e parceiros que tornam este projeto possível.

---

<div align="center">

**Medicina de Abrigos Brasil** - Transformando dados em ação para o bem-estar animal 🐾

</div>
