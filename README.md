# MV Abrigos Brasil

Frontend da plataforma nacional de mapeamento e gestão de abrigos de animais.

## Stack

- Next.js 16, React 19 e TypeScript
- Tailwind CSS 4
- Zod para validação de contratos
- Highcharts para visualizações
- API NestJS e autenticação por cookies `httpOnly`

O frontend não acessa banco de dados diretamente. Chamadas do navegador usam
`/api/v1/*` na mesma origem; o rewrite do Next encaminha essas chamadas para a
API NestJS. Server Components usam `INTERNAL_API_URL` diretamente.

## Desenvolvimento local

Pré-requisitos:

- Node.js 20+
- Docker Desktop
- Repositórios `mvabrigosbrasil` e `mvabrigosbrasil-api` lado a lado

Backend, na branch `develop`:

```powershell
cd C:\Users\ariov\Desktop\projetos\mvabrigosbrasil-api
docker compose up -d postgres redis
npm install
npm run start:dev
```

Frontend, na branch `refactor/auth-cutover-nestjs`:

```powershell
cd C:\Users\ariov\Desktop\projetos\mvabrigosbrasil
npm install
npm run dev
```

Acesse `http://localhost:3000`. A API responde em
`http://localhost:3001/api/v1/health`.

## Ambiente

Copie os valores necessários de `.env.example` para `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
INTERNAL_API_URL=http://localhost:3001
AUTH_JWT_SECRET=

NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_ENABLED=

NEXT_PUBLIC_ANALYTICS_ENABLED=false
NEXT_PUBLIC_ANALYTICS_MODE=gtm
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

`AUTH_JWT_SECRET` deve ser igual ao segredo usado pela API para que o proxy do
Next valide a sessão. Não existe chave de seleção de runtime: a branch de
refatoração usa NestJS; `develop` e `main` do frontend permanecem isoladas.

## Comandos

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Organização

```text
src/
  app/          páginas e layouts do App Router
  components/   componentes de interface
  hooks/        estado e operações do navegador
  lib/api/      transporte browser, server e público
  lib/auth/     sessão e autorização do frontend
  modules/      contratos e operações por domínio
  services/     composição de dados para páginas públicas
```

O único handler Next mantido em `src/app/api` é `cookie-consent`; autenticação
e dados de negócio pertencem à API NestJS.

## Branches da migração

- Frontend: `refactor/auth-cutover-nestjs`
- Backend: `develop`

Não faça merge ou deploy da branch de refatoração antes da validação local da
matriz de papéis, sessões, dados públicos e fluxos de escrita.
