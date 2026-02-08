# Cookies no Next.js 16 — Implementação + Revisão da Política (site já migrado) — Plano Único para IA

## Contexto (importante)
- O site **já está em Next.js** e a página existe: `/politica-de-cookies`.
- **Ainda não foi implementado** o mecanismo de consentimento/cookies no código (banner + preferências + bloqueio real).
- A página atual contém uma lista de cookies e afirma que “somente os necessários são coletados” e que os demais são opcionais. :contentReference[oaicite:0]{index=0}
- A página lista cookies de ferramentas como **Intercom**, **Segment**, **Google/YouTube** e **HubSpot**. :contentReference[oaicite:1]{index=1}
- Portanto, antes de “copiar a política”, precisamos **avaliar se ela continua correta** para o projeto Next.js e ajustar o que for necessário.

---

## Objetivo
1) Implementar **consentimento de cookies** no Next.js 16 (App Router), com:
- Banner (Aceitar / Rejeitar / Personalizar)
- Preferências por categoria
- Cookie de consentimento persistido
- **Bloqueio real** de scripts/cookies não essenciais até consentimento

2) Rodar uma **análise de compatibilidade** entre:
- o que a política descreve (cookies listados)  
vs  
- o que o site Next realmente usa (scripts/tags/embeds)

3) Se houver divergência, ajustar a página `/politica-de-cookies` (conteúdo) para refletir a realidade do projeto.

---

## 1) Etapa obrigatória: auditoria do que o Next.js está carregando hoje

### 1.1 Inventário de integrações no código
No repositório, procurar por sinais de integrações que geram cookies:
- Google: `gtag`, `GTM-`, `googletagmanager`, `GA_MEASUREMENT_ID`, `GTM_ID`
- Intercom: `intercom`, `window.Intercom`
- Segment: `segment`, `analytics.load`, `ajs_anonymous_id`, `mkjs_*`
- HubSpot: `hubspot`, `hs-script-loader`, `hubspotutk`, `__hstc`
- Outros: Hotjar, Meta Pixel, PostHog, Sentry (Sentry normalmente é “necessário/técnico”, mas depende do uso)

**Saída esperada:** uma lista:
- Ferramenta
- Onde carrega (arquivo e linha)
- Se é global (layout) ou por página
- Categoria sugerida (necessary / analytics / marketing / thirdPartyEmbeds)

### 1.2 Auditoria no navegador (produção/hml/dev)
Usar DevTools para ver o que acontece **antes** de qualquer consentimento:
- Application → Cookies (domínio do site)
- Network → filtrar por: `gtm`, `collect`, `intercom`, `hubspot`, `segment`, `youtube`, `doubleclick`, etc.

**Saída esperada:** relatório:
- cookies criados automaticamente ao abrir o site
- scripts/requests que disparam tracking antes do consentimento

---

## 2) Revisão da Política atual (ajuste necessário ou não)

### 2.1 O que a política hoje declara e lista
A página atual (Next) contém:
- Tipos de cookies (sessão, permanentes, necessários, analíticos, terceiros, funcionalidade, propaganda) :contentReference[oaicite:2]{index=2}
- Lista de cookies necessários incluindo **Intercom** (`intercom-session-*`, `intercom-id-*`) :contentReference[oaicite:3]{index=3}
- Lista de cookies analíticos incluindo **Google Analytics** (`_ga`, `_gcl_au`) e **Segment** (`ajs_anonymous_id`, `mkjs_*`) :contentReference[oaicite:4]{index=4}
- Cookies de terceiros do **Google/YouTube** (ex.: `SAPISID`, `YSC`, `VISITOR_INFO1_LIVE`, `__Secure-*`, etc.) :contentReference[oaicite:5]{index=5}
- Cookies de propaganda incluindo **HubSpot** (`hubspotutk`, `__hstc`) :contentReference[oaicite:6]{index=6}
- Texto: “Coletamos somente os cookies necessários... Os demais são opcionais…” :contentReference[oaicite:7]{index=7}
- Texto: “você pode desativar os demais na página de Gestão de Cookies” :contentReference[oaicite:8]{index=8}

### 2.2 Regra de compatibilidade
- Se o Next **NÃO usa** Intercom/Segment/HubSpot/GA/YouTube embed, **a política está desatualizada** e precisa ser ajustada.
- Se o Next **usa**, então precisamos implementar:
  - consentimento real
  - bloqueio real
  - e uma “Gestão de Cookies” funcional (modal/configuração)

**Saída esperada:** decisão objetiva:
- (A) “Política está correta; implementar consentimento e bloqueio para as ferramentas listadas.”
ou
- (B) “Política precisa ser atualizada: remover/ajustar cookies listados e refletir integrações reais do Next.”

---

## 3) Implementação no Next.js 16 (App Router) — Requisitos técnicos

### 3.1 Categorias de consentimento
Definir no mínimo:
- `necessary` (sempre true)
- `analytics`
- `marketing`
- `thirdPartyEmbeds` (YouTube/Google Maps e outros iframes que setam cookies)

Mapear as ferramentas:
- GA/GTM → analytics
- Segment → analytics (ou analytics+marketing dependendo do uso)
- HubSpot → marketing
- Intercom → (depende: muitas vezes “functional/necessary” se for chat essencial; se for tracking, pode ser marketing/functional)
- YouTube embed → thirdPartyEmbeds

### 3.2 Cookie de consentimento (persistência)
Criar cookie 1st-party para armazenar preferências:
- nome: `cookie_consent`
- valor: JSON com versão (ex.: `{"v":1,"necessary":true,"analytics":false,"marketing":false,"thirdPartyEmbeds":false}`)
- duração: 6–12 meses
- `sameSite=Lax`, `secure=true` em produção, `path=/`

### 3.3 Banner + Modal de preferências
- Exibir banner apenas se não existir `cookie_consent`
- Botões:
  - “Aceitar tudo”
  - “Rejeitar”
  - “Personalizar” (abre modal)
- Modal com toggles por categoria (exceto necessary)

### 3.4 “Gestão de Cookies” (promessa da política)
A política menciona desativar via “Gestão de Cookies”. :contentReference[oaicite:9]{index=9}  
Logo o site deve ter:
- um link no footer (“Configurar cookies”)
- e/ou um botão dentro da página `/politica-de-cookies`
- que abre o modal para editar preferências

---

## 4) Implementação — arquitetura sugerida (sem gambiarras)

### 4.1 Estrutura sugerida
- `src/components/cookies/CookieBanner.tsx` (Client)
- `src/components/cookies/CookiePreferencesModal.tsx` (Client)
- `src/lib/cookies/consent.ts` (helpers: parse/serialize)
- `src/app/api/cookie-consent/route.ts` (Route Handler)
- `src/components/tracking/TrackingGate.tsx` (Server: decide o que renderizar com base no consent)

### 4.2 Endpoint para setar cookie (server-side)
Criar:
- `POST /api/cookie-consent` → salva `cookie_consent`
- Opcional: `DELETE /api/cookie-consent` → remove (revogação)

### 4.3 Carregamento condicional de scripts (ponto mais crítico)
**Regra:** nenhum script/tags não essenciais pode carregar antes do consentimento.

- Se não consentiu `analytics`, não renderizar GA/GTM/Segment.
- Se não consentiu `marketing`, não renderizar HubSpot/Meta Pixel/Ads.
- Se não consentiu `thirdPartyEmbeds`, não renderizar iframe do YouTube (usar placeholder).

Em Next, preferir:
- controlar `<Script>` (next/script) condicionalmente
- ou carregar scripts via import dinâmico **somente após consentimento** no client

---

## 5) Ajuste da página `/politica-de-cookies` (caso necessário)

### 5.1 Quando ajustar
Ajustar se a auditoria mostrar que:
- cookies listados não existem mais
- ferramentas mudaram
- a “Gestão de Cookies” não existe (precisa existir)

### 5.2 Como ajustar (mínimo)
- Atualizar a tabela “Quais cookies utilizamos?” para refletir ferramentas reais
- Adicionar um botão “Configurar cookies” na própria página para abrir o modal
- Garantir consistência com o texto “somente necessários por padrão; demais opcionais”

---

## 6) Critérios de aceite / testes

### 6.1 Primeira visita (sem consentimento)
- Apenas cookies necessários podem existir
- Nenhum request de tracking (GA/GTM/Segment/HubSpot/etc.)
- Banner aparece

### 6.2 Após “Rejeitar”
- `cookie_consent` salvo com analytics/marketing/thirdPartyEmbeds = false
- Não carrega scripts de tracking

### 6.3 Após “Aceitar tudo”
- `cookie_consent` salvo com permissões = true
- Scripts/tags passam a carregar

### 6.4 Após “Personalizar”
- Só categorias marcadas liberam scripts
- Link “Configurar cookies” reabre modal e permite mudar

---

## Entregáveis finais esperados
1) Implementação funcional:
- banner + modal + cookie de consentimento + endpoint
- bloqueio real de scripts/iframes por categoria
2) Link “Configurar cookies” acessível globalmente (footer) e/ou na página de política
3) Relatório curto (no PR ou doc interno) com:
- ferramentas encontradas
- cookies gerados (antes/depois)
- se a política precisou (ou não) ajustes e quais

---
