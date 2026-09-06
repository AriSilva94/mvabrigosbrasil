# Frontend NestJS Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** migrate frontend branch `refactor/auth-cutover-nestjs` from Supabase Auth/PostgREST to the completed NestJS API while frontend `develop` and `main` remain on Supabase.

**Architecture:** browser traffic stays same-origin through a Next.js rewrite from `/api/v1/*` to NestJS. Server Components call NestJS directly and forward cookies. Next 16 `proxy.ts` refreshes page sessions; the browser client refreshes and retries API requests once. Supabase code is removed only after all callers migrate.

**Tech Stack:** Next.js 16, React 19, TypeScript, `jose`, Vitest, NestJS at `http://localhost:3001`, Next at `http://localhost:3000`.

---

## Safety Rules

- Work only on frontend `refactor/auth-cutover-nestjs` and backend `develop`.
- Do not push, merge, or deploy without explicit approval.
- Do not add a Supabase/NestJS runtime flag; branches are the isolation boundary.
- Keep Supabase files until Task 8, even after their callers migrate.
- Commit each task independently and verify frontend build after every task.
- Use only synthetic test identities and restore backend Postgres/Redis baseline.

### Task 1 Prerequisite: Refresh Cookie and Rotation

The page proxy can receive `mv_rt` only when the backend sets it with `Path=/`.
Backend `develop` must set and clear that path consistently while retaining
`HttpOnly`, `SameSite=Lax`, configured `Secure`, and the existing lifetime.
Refresh rotation must be atomic and return the same successor for concurrent
use of the immediately previous token within a short grace window; reuse after
that window continues to revoke the session.

### Task 1: Same-Origin API and Session Foundation

**Files:**
- Modify: `package.json`, `package-lock.json`, `next.config.ts`, `.env.example`, `proxy.ts`
- Create: `vitest.config.ts`
- Create: `src/lib/api/errors.ts`, `request.ts`, `client.ts`, `server.ts`, `src/lib/auth/session.ts`
- Test: `src/lib/api/request.spec.ts`, `src/lib/auth/session.spec.ts`

- [ ] **Step 1: install foundation dependencies**

```powershell
npm install jose
npm install --save-dev vitest
```

Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts.

Create `vitest.config.ts` so tests resolve the same `@/*` alias as Next.js:

```ts
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node' },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

- [ ] **Step 2: write RED transport/session tests**

Prove URL normalization, JSON/non-JSON errors, one refresh plus one retry, no
retry loop, and valid/expired/malformed JWT handling.

```ts
expect(apiPath('/auth/me')).toBe('/api/v1/auth/me');
await expect(requestJson(fetch500, '/x')).rejects.toMatchObject({
  status: 500,
  message: 'Erro do backend',
});
expect(refresh).toHaveBeenCalledTimes(1);
expect(originalRequest).toHaveBeenCalledTimes(2);
```

Run: `npm test -- src/lib/api/request.spec.ts src/lib/auth/session.spec.ts`
Expected: FAIL because the modules do not exist.

- [ ] **Step 3: implement typed request primitives**

```ts
export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly body: unknown = null) {
    super(message);
    this.name = 'ApiError';
  }
}

export function apiPath(path: string): string {
  return `/api/v1/${path.replace(/^\/+/, '')}`;
}
```

`client.ts` uses relative URLs and `credentials: 'include'`. On a non-auth 401,
it calls `POST /api/v1/auth/refresh` and retries once. `server.ts` imports
`server-only`, uses `INTERNAL_API_URL`, forwards `(await cookies()).toString()`,
and defaults to `cache: 'no-store'`.

- [ ] **Step 4: configure rewrite and environment**

```ts
async rewrites() {
  const origin = (process.env.INTERNAL_API_URL ?? 'http://localhost:3001')
    .replace(/\/$/, '');
  return [{ source: '/api/v1/:path*', destination: `${origin}/api/v1/:path*` }];
}
```

Use the same trailing-slash normalization in `server.ts` before composing a
direct server-side URL.

`.env.example` adds only:

```dotenv
INTERNAL_API_URL=http://localhost:3001
AUTH_JWT_SECRET=
```

- [ ] **Step 5: replace Supabase refresh in `proxy.ts`**

Keep the `proxy` export. Exclude `/api/v1` from its matcher so API POSTs are
never redirected. For pages: verify `mv_at`; when expired and `mv_rt` exists,
call the internal refresh endpoint, forward every `Set-Cookie`, and redirect to
the same URL once. Invalid protected sessions go to `/login`; public pages pass.

- [ ] **Step 6: verify and commit**

Run `npm test && npm run lint && npx tsc --noEmit && npm run build`.
Commit: `feat: add NestJS frontend transport`.

### Task 2: Authentication and Protected Session

**Files:**
- Modify: `src/components/auth/LoginForm.tsx`, `src/hooks/useAuth.ts`, `useRegister.ts`, `useRegisterForm.ts`, `src/lib/auth/postLoginRedirect.ts`, `teamAccess.ts`
- Modify: `src/app/(protected)/layout.tsx`, `alterar-senha/page.tsx`
- Modify: recover/reset/change password form components
- Test: `src/lib/auth/teamAccess.spec.ts`, `postLoginRedirect.spec.ts`

- [ ] **Step 1: write RED tests for claims mapping and redirect fallback**

Cover `role`, `isTeamOnly`, `teamDisabled`, `creatorProfileId`, admin/team allowed
paths, and fallback to `/meu-cadastro` when redirect lookup fails.

- [ ] **Step 2: migrate login and registration**

```ts
await api('/auth/login', { method: 'POST', body: JSON.stringify(values) });
await api('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ email, password, registerType, teamOnly }),
});
```

Remove browser `setSession`/`signInWithPassword`; NestJS already sets cookies.
Preserve 401 password errors, 404 email errors, toasts, and post-login redirect.

- [ ] **Step 3: migrate `useAuth` and logout**

Load `GET /auth/me` once and keep `{ user, isLoading, logout }`. Logout calls
`POST /auth/logout`, clears state in `finally`, and runs `router.refresh()`.

- [ ] **Step 4: migrate password flows**

```text
POST /auth/forgot-password { email }
POST /auth/reset-password { token, password }
POST /auth/change-password { currentPassword, newPassword }
```

Reset reads `token` from `useSearchParams`; remove Supabase recovery events.

- [ ] **Step 5: migrate server session/access**

Protected layout uses `getSession()`. `loadUserAccess()` maps JWT claims without
I/O while preserving `UserAccessInfo`, allowed paths, redirects, and shortcuts.
Password page reads `session.email`.

- [ ] **Step 6: verify and commit**

Run all four frontend gates. Commit:
`refactor: migrate frontend authentication to NestJS`.

### Task 3: Team Access and Manager Panel

**Files:**
- Modify: `src/app/(protected)/equipe/components/TeamAccessForm.tsx`, `TeamUserList.tsx`, `equipe/page.tsx`, `painel/page.tsx`
- Test: extend `src/lib/auth/teamAccess.spec.ts`

- [ ] **Step 1: add RED role matrix cases**

Cover admin, manager, shelter, volunteer, team-only active, and team-disabled.

- [ ] **Step 2: migrate team calls**

```text
GET /team/users
POST /team/users/toggle { userId, disable }
POST /auth/register { email, password, registerType, teamOnly: true }
```

Preserve list/form interfaces and refresh the list after register/toggle.

- [ ] **Step 3: migrate manager panel**

Replace profile/membership/shelter Supabase queries with server
`GET /admin/managers/me/shelters`; keep `ManagerPanel` props unchanged.

- [ ] **Step 4: verify and commit**

Run all gates. Commit: `refactor: migrate team access to NestJS`.

### Task 4: Shelter Profile Domain

**Files:**
- Modify: `src/hooks/useProfileValidation.ts`, `useShelterProfile.ts`, `useShelterHistory.ts`, `useAddressCheck.ts`
- Modify: `src/app/(protected)/meu-cadastro/components/DeactivateDialog.tsx`, `ShelterProfileForm.tsx`, `src/components/providers/ProfileValidationProvider.tsx`

- [ ] **Step 1: freeze exported hook/component contracts**

Record and retain existing return types, props, form schemas, loading states,
toasts, and visible messages.

- [ ] **Step 2: migrate paths through browser `api()`**

```text
/profile/validate
/shelters/me
/shelters/me/deactivate
/shelters/me/history?limit=&offset=
/shelters/check-address?cep=&street=&number=
```

- [ ] **Step 3: validate edge cases**

Test missing profile, document field, no-op save, duplicate address,
deactivate/reactivate, unauthenticated, and team-disabled behavior.

- [ ] **Step 4: verify and commit**

Run all gates. Commit: `refactor: migrate shelter profile to NestJS`.

### Task 5: Population Dynamics Domain

**Files:**
- Modify: `src/app/(protected)/dinamica-populacional/hooks/useDynamicsData.ts`, `page.tsx`, `[shelter_id]/page.tsx`
- Remove later: `src/services/dynamicsService.ts`, `src/modules/dynamics/getDynamicsUserSummary.ts`

- [ ] **Step 1: migrate browser CRUD**

Use `GET/POST/DELETE /dynamics`, retaining `DynamicsDisplay`, validations,
calculated view models, modals, and query parameters.

- [ ] **Step 2: migrate server summaries**

Use `GET /dynamics/summary` for owner/team-only and
`GET /dynamics/summary?shelter_id=<wpPostId>` for manager. Inaccessible manager
shelters retain current `notFound()` behavior.

- [ ] **Step 3: verify and commit**

Test owner, team-only, manager linked/unlinked, invalid save, valid save/delete.
Run all gates. Commit: `refactor: migrate population dynamics to NestJS`.

### Task 6: Vacancies and Applications

**Files:**
- Modify: `src/hooks/useVacancies.ts`, `src/app/(protected)/minhas-vagas/**/*`, `src/app/(protected)/vaga/[slug]/components/EditVacancyClient.tsx`
- Modify: public vacancy hooks/pages and `ApplyButton.tsx`
- Remove later: vacancy repositories/services and old route handlers

- [ ] **Step 1: migrate owner operations**

```text
GET/POST /vacancies
GET/PUT/DELETE /vacancies/:id
GET /vacancies/:id/applications
```

Preserve `source: 'supabase'` because it remains part of the UI contract.

- [ ] **Step 2: migrate public/application operations**

```text
GET /public/vacancies
GET /public/vacancies/:slug
GET /vacancies/:id/my-status
POST /vacancies/:id/apply
```

- [ ] **Step 3: verify and commit**

Test create/edit/list/delete, cross-owner denial, public detail, apply,
duplicate apply, and candidates. Run all gates.
Commit: `refactor: migrate vacancies to NestJS`.

### Task 7: Volunteers, Admin, and Public Data

**Files:**
- Modify: `src/hooks/useVolunteerProfile.ts`, volunteer forms/pages/hooks
- Modify: `src/app/(protected)/admin/gerentes/**/*`, `admin/abrigos/page.tsx`
- Modify: `src/components/home/MapSection.tsx`, `src/app/(data)/banco-de-dados/page.tsx`

- [ ] **Step 1: migrate volunteers**

Use `GET/POST /volunteers/me`, `GET /volunteers`, and
`GET /volunteers/:slug`. Preserve D4 fields, filters, cards, and generated slug.

- [ ] **Step 2: migrate admin**

Use `GET /admin/managers`, `PUT /admin/managers/:id/shelters`, and
`GET /shelters`. Keep null/synthetic `wp_post_id` handling defensive.

- [ ] **Step 3: migrate public data**

Use `GET /public/map-statistics` and `/public/database-dataset`. Preserve the
database page's 900-second cache intent; authenticated calls remain `no-store`.

- [ ] **Step 4: verify and commit**

Test private/public volunteer, create-list-detail, admin denial/assignment,
anonymous map, and dataset counts. Run gates.
Commit: `refactor: migrate remaining data domains to NestJS`.

### Task 8: Remove Supabase Runtime

**Files:**
- Remove: `src/lib/supabase/*`, `src/types/supabase.types.ts`, `src/modules/auth/*`, WordPress password frontend files
- Remove: obsolete data services/repositories/data loader/dynamics summary
- Remove: every `src/app/api/*` route except `cookie-consent`
- Modify: dependencies, `.env.example`, `README.md`, remaining imports

- [ ] **Step 1: prove all runtime callers moved**

```powershell
rg -n "supabase|/api/(login|register|shelter-profile|validate-profile|dynamics|vacancies|volunteer-profile|volunteers|team-users|admin/managers|map-statistics|public-vacancies)" src proxy.ts
```

Every runtime result blocks removal.

- [ ] **Step 2: remove dead code and dependencies**

Remove `@supabase/ssr`, `@supabase/supabase-js`, `pg`, `bcryptjs`, and
`wordpress-hash-node` only after `npm ls` and `rg` prove no consumer remains.
Do not remove analytics packages; they are unrelated and currently used.

- [ ] **Step 3: document local startup**

```powershell
# terminal 1
cd C:\Users\ariov\Desktop\projetos\mvabrigosbrasil-api
docker compose up -d
npm run start:dev

# terminal 2
cd C:\Users\ariov\Desktop\projetos\mvabrigosbrasil
npm run dev
```

- [ ] **Step 4: verify and commit**

Run all gates. Commit: `refactor: remove Supabase frontend runtime`.

### Task 9: Local End-to-End Validation

**Files:**
- Create: `docs/nestjs-migration/artifacts/2026-09-06-frontend-local-validation.md`
- Modify code only for reproduced defects, using TDD

- [ ] **Step 1: capture branches and backend baseline**

Frontend must be `refactor/auth-cutover-nestjs`; backend must be `develop`.
Record counts and verify zero synthetic residue before testing.

- [ ] **Step 2: start both servers and verify rewrite**

Start backend on 3001 and frontend on 3000 (or next free port). Verify
`http://localhost:3000/api/v1/health` reaches NestJS.

- [ ] **Step 3: run role matrix**

```text
anonymous: public pages and protected redirect
abrigo: login, profile, history, deactivate, dynamics, vacancies
voluntario: login, profile, public slug, apply, duplicate apply
gerente: linked shelters/dynamics and unlinked denial
admin: manager list, assignment, shelter list
team-only active: only allowed routes and dynamics
team-only disabled: inactive panel and blocked writes
session/password: refresh, logout, forgot, reset, change
```

- [ ] **Step 4: inspect browser/network behavior**

Confirm no Supabase request, all business/auth calls use `/api/v1`, cookies are
`httpOnly` with correct paths, public pages work without cookies, and no UI
overlap/error regression appears on desktop/mobile.

- [ ] **Step 5: final full gates and cleanup**

Run frontend gates and backend unit/import/E2E/lint/build/TypeScript/Prisma.
Restore exact pre-test database counts and Redis state; delete only synthetic
fixtures created for validation.

- [ ] **Step 6: commit evidence**

Commit: `test: validate frontend NestJS cutover locally`.

---

## Completion Criteria

- Frontend `develop/main` remain unchanged on Supabase.
- Refactor branch has no Supabase runtime import or old business route handler.
- Browser business/auth traffic is same-origin `/api/v1/*` only.
- All role, ownership, refresh, password, and public flows pass locally.
- Frontend/backend gates pass and Postgres/Redis return to baseline.
- No push, merge, or deployment occurs without explicit approval.
