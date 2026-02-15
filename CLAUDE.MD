# Plano de implementação — Chat online (Voluntário ↔ Abrigo) ao candidatar-se a uma vaga

Você é um arquiteto de software sênior especializado em Next.js (App Router) + Supabase (Auth, Postgres, RLS, Realtime) e sistemas de chat em tempo real.  
Preciso que você produza um **plano de implementação completo e executável** para um chat online entre **voluntários** e **abrigos**, iniciado no momento em que o voluntário **se candidata a uma vaga**.

## Contexto do produto
- Plataforma: **MVAbrigos Brasil**
- Stack: **Next.js (App Router) + TypeScript + Tailwind**
- Backend: **Supabase** (Auth + Postgres + Storage + Realtime)
- Atores:
  - **Voluntário**: usuário autenticado que se candidata a vagas.
  - **Abrigo**: usuário autenticado que publica vagas.
- Fluxo principal:
  1. Voluntário visualiza uma vaga
  2. Clica em **“Candidatar-se”**
  3. A candidatura é criada
  4. Automaticamente é criada (ou reutilizada) uma **conversa (thread)** entre voluntário e abrigo
  5. Voluntário e abrigo conseguem trocar mensagens em tempo real

## Objetivo do seu output
Quero um documento técnico com:
1. **Arquitetura** (alto nível e componentes)
2. **Modelagem de banco (SQL)** com tabelas, índices e constraints
3. **Políticas de segurança (RLS)** para garantir privacidade e acesso correto
4. **Realtime** (Supabase Realtime) — como assinar mensagens e atualizar UI
5. **API / Server Actions / Rotas** no Next.js para criar candidatura, thread e enviar mensagem
6. **UI/UX** (layout sugerido e comportamento)
7. **Regras de negócio** e validações
8. **Casos de borda** (bloqueios, spam, deletar conta, etc.)
9. **Plano de rollout** (MVP → v2) e testes

> NÃO invente requisitos fora do que está abaixo. Quando precisar assumir algo, registre como "Assunção" e ofereça alternativas.

---

## Requisitos funcionais (obrigatórios)
- **Thread criada no ato da candidatura**:
  - Se já existir uma thread para (vaga + voluntário), reutilizar.
- **Somente participantes** podem ler/enviar mensagens da thread.
- **Mensagens em tempo real** (Realtime).
- **Mensagens persistidas** no Postgres.
- **Status de leitura** (mínimo viável: last_read_at por participante).
- **Anexos** (MVP opcional, mas desenhe a base): fotos/pdf via Supabase Storage, com controle de acesso.
- **Notificações**:
  - MVP: badge/contador no inbox.
  - Opcional v2: e-mail/push/webhook.
- **Bloqueio/denúncia**:
  - MVP: bloquear usuário impede novas mensagens.
  - Denúncia pode ser apenas registro em tabela.

## Requisitos não-funcionais (obrigatórios)
- **RLS forte** (nada de “security by frontend”).
- **Escalabilidade**: conversar com muitos chats sem derrubar o app.
- **Performance**:
  - Paginação de mensagens.
  - Indexação adequada.
  - Evitar N+1.
- **Auditoria**:
  - created_at/updated_at
  - logs básicos de eventos (criação de thread, envio de msg, bloqueio).
- **LGPD**:
  - Mínimo: soft delete, retenção e export básico (v2).

---

## Sugestão de entidades (você pode ajustar se justificar)
- `applications` (candidaturas)
- `chat_threads`
- `chat_participants`
- `chat_messages`
- `chat_message_reads` OU `chat_participants.last_read_at`
- `chat_blocks`
- `chat_reports`
- `chat_attachments` (ou embutir no message)

---

## O que você deve entregar (formato e conteúdo)
Estruture sua resposta em seções:

### 1) Arquitetura geral
- Componentes e responsabilidades
- Fluxo de dados (do clique em candidatar até receber mensagem em tempo real)

### 2) Banco de dados (SQL completo)
- Crie o SQL de:
  - tabelas
  - índices
  - constraints
  - triggers (se necessário)
- Use Postgres compatível com Supabase.
- Inclua comentários no SQL para explicar decisões.

### 3) RLS (SQL completo)
- Políticas para cada tabela
- Explicar quem pode:
  - SELECT/INSERT/UPDATE/DELETE
- Considerar:
  - voluntário e abrigo são usuários do Supabase Auth
  - participação na thread é o gate principal
  - bloquear usuário impede INSERT em mensagens

### 4) Realtime
- Quais tabelas precisam de publicação no Realtime
- Como assinar por thread
- Estratégia de paginação + atualização incremental
- Como evitar vazamento (RLS + filtros + canais)

### 5) Next.js (App Router) — implementação sugerida
- Padrão recomendado:
  - Server Actions ou Route Handlers (explique tradeoffs)
- Rotas/ações necessárias, ex:
  - `POST /apply` (cria candidatura + thread)
  - `POST /threads/:id/messages`
  - `GET /threads`
  - `GET /threads/:id/messages?cursor=...`
- Pseudocódigo (não precisa ser projeto completo), mas com:
  - validação
  - checagem de permissões
  - transações (quando necessário)

### 6) UI/UX (MVP)
- Telas:
  - Inbox (lista de threads)
  - Thread (mensagens)
- Estados:
  - loading, empty, error
  - mensagem enviada otimista vs confirmação
  - indicador de “não lidas”
- Layout sugerido (responsivo)

### 7) Regras de negócio
- Reutilização de thread por (vaga, voluntário)
- Quem pode iniciar conversa (apenas após candidatura)
- Limite anti-spam (rate limit por minuto)
- Sanitização de mensagem
- Anexos (tipos, tamanho, vírus? ao menos mencionar)

### 8) Casos de borda e segurança
- Usuário deletado
- Abrigo remove vaga depois
- Candidatura cancelada
- Bloqueio mútuo
- Tentativa de enumerar threads
- Mensagens abusivas (reports)

### 9) Testes
- Unitários (lógica server)
- Integração (RLS + queries)
- E2E (fluxo básico)
- Checklist de segurança

### 10) Roadmap (MVP → v2 → v3)
- MVP (mínimo para produção)
- v2 (notificações, anexos completos, busca)
- v3 (moderação, automações, etc.)

---

## Restrições importantes
- Não use serviços pagos externos no MVP (apenas Supabase e Next).
- Evite dependências pesadas.
- Se sugerir bibliotecas, dê alternativas e explique por quê.
- Priorize simplicidade + segurança.

## Perguntas que você deve responder implicitamente (sem me perguntar)
- Como garantir que apenas participantes vejam mensagens?
- Como criar thread de forma idempotente na candidatura?
- Como lidar com “unread count” sem custo alto?
- Como paginar mensagens com bom desempenho?
- Como estruturar Storage para anexos com RLS?

> Agora gere o plano completo seguindo tudo acima, com SQL e explicações.
