# Frontend Cutover to NestJS Design

> Cutover design for the existing migration study in
> `docs/superpowers/specs/2026-06-13-supabase-to-nestjs-migration-design.md`.
> This document supersedes the earlier BFF-per-route transition for the final
> frontend cutover. The approved transport is a same-origin Next.js rewrite.

## Goal

Move the frontend from Supabase Auth/PostgREST to the completed NestJS API
without changing the production branches while local validation is still in
progress.

## Branch Isolation

- Frontend `main` and `develop` remain unchanged and continue using Supabase.
- All frontend cutover work happens on `refactor/auth-cutover-nestjs`.
- Backend work remains on the backend repository's `develop` branch.
- There is no Supabase/NestJS feature flag or data-source environment switch.
  The Git branch is the isolation boundary.
- No merge or push into a production branch occurs without explicit approval.

The refactor branch may retain unused Supabase files while domains are migrated,
but completed code paths in that branch call NestJS only. Supabase dependencies
and dead files are removed in the final cleanup stage, after all migrated flows
have passed local validation.

## HTTP Transport

Browser requests use relative `/api/v1/*` URLs. `next.config.ts` rewrites these
requests to `${INTERNAL_API_URL}/api/v1/*`; for local development,
`INTERNAL_API_URL=http://localhost:3001`.

This preserves one browser origin:

```text
Browser http://localhost:3000/api/v1/*
  -> Next.js rewrite
  -> http://localhost:3001/api/v1/*
  -> NestJS response and Set-Cookie headers
  -> Browser cookies for localhost
```

The design intentionally avoids direct browser calls to port 3001. Therefore:

- the browser does not require backend CORS;
- `mv_at` and `mv_rt` remain `httpOnly` and same-origin;
- the refresh cookie path is `/`, so page requests expose it to the trusted
  Next proxy while it remains inaccessible to browser JavaScript;
- client components do not need a public backend origin variable.

Server Components use `src/lib/api/server.ts` to call
`${INTERNAL_API_URL}/api/v1/*` directly. The helper forwards the incoming Cookie
header, disables accidental Next fetch caching by default, parses JSON, and
throws a typed `ApiError` containing the HTTP status and backend message.

## Session Flow

`src/lib/auth/session.ts` reads and verifies `mv_at` with `jose` using the
server-only `AUTH_JWT_SECRET`. It exposes the NestJS claims through one
`SessionClaims` type. No Supabase client participates in session reads.

The existing Next.js 16 `proxy.ts` remains the request interception entry point;
it is not renamed to `middleware.ts`. Its Supabase implementation is replaced
with this flow:

1. If `mv_at` verifies, continue.
2. If it does not verify and `mv_rt` exists, call the internal NestJS refresh
   endpoint and forward every `Set-Cookie` header.
3. After a successful refresh, redirect once to the same URL. The next request
   then exposes the new access cookie to Server Components.
4. If refresh fails, public routes continue and protected routes redirect to
   `/login`.

Refresh rotation is atomic in Redis. Uses of the immediately previous refresh
token within a short grace window return the same successor, preventing races
between tabs, browser requests, and the Next proxy. Reuse outside that window
still revokes the session.

The redirect prevents Server Components from rendering with an expired access
cookie during the same request that refreshed it.

## Migration Stages

### 1. Foundation

- Add the same-origin rewrite, `ApiError`, browser/server API helper, session
  verification, and focused tests.
- Add `jose` and the new environment documentation.
- Keep existing Supabase behavior untouched until the foundation is verified.

### 2. Authentication

- Migrate login, registration, logout, post-login redirect, current-user state,
  password recovery, password reset, and password change.
- Replace Supabase session subscriptions with `GET /auth/me` plus explicit state
  updates after login/logout.
- Migrate protected layout and `teamAccess` to JWT claims.

### 3. Shelter and Dynamics

- Replace profile validation, shelter profile, deactivation, history, address
  check, dynamics CRUD, manager shelter selection, and summary calls.
- Preserve existing form schemas, view models, redirects, and visible messages.

### 4. Vacancies and Volunteers

- Replace owner vacancy CRUD, public vacancy pages, applications, `my-status`,
  volunteer profile, public cards, and public volunteer detail.
- Preserve current slugs, UI types, filters, and route URLs.

### 5. Team, Admin, and Public Data

- Replace team listing/toggle, manager assignments, admin shelter list, map
  statistics, and database dataset access.
- Keep the existing 900-second page/cache semantics for public data.

### 6. Supabase Removal

- Prove no runtime imports or requests reference Supabase.
- Remove old Next route handlers except `cookie-consent`, Supabase clients,
  server repositories, obsolete auth/data services, types, and dependencies.
- Keep pure UI utilities that are still imported by components.

## Error Handling

- Backend `{ error: string }` messages remain the user-facing source of truth.
- Client forms map known `400`, `401`, `404`, and `409` responses to their
  existing field or form states.
- Protected server paths redirect to `/login` only for an absent/invalid
  session. Authorization failures do not masquerade as authentication failures.
- Ownership-sensitive `403`/`404` responses retain the backend behavior and do
  not reveal another user's resources.
- Public pages handle missing records through the existing Next.js `notFound()`
  behavior.
- Network and non-JSON failures become a stable generic error through
  `ApiError`; raw response bodies and secrets are not logged in the browser.

## Validation Strategy

Each stage is committed and validated independently before the next starts:

- lint, TypeScript, and production build;
- focused tests for API URL construction, error parsing, claims, redirects, and
  migrated hooks where practical;
- both local servers running on ports 3000 and 3001;
- browser validation for login/logout, cookie refresh, protected redirects,
  role-specific navigation, and every migrated data domain;
- regression checks for public pages without a session;
- backend database/Redis baseline checks after synthetic end-to-end fixtures.

The final manual matrix covers abrigo, voluntario, gerente, admin, team-only,
team-disabled, and anonymous users. The refactor branch is not eligible for
integration until the matrix passes and the existing Supabase branch remains
deployable independently.

## Rollback

Before integration, rollback means switching the frontend back to `develop`;
that branch continues to use Supabase and receives no cutover commits. During
implementation, each domain is a separate commit so a faulty migration can be
reverted without discarding later-independent work.

After eventual production integration, rollback requires redeploying the last
Supabase-based frontend revision. Database writes made through NestJS are not
automatically replayed to Supabase, so production cutover and rollback require a
separate deployment/data synchronization decision before merge.

## Out of Scope

- A runtime Supabase/NestJS feature flag.
- Direct browser-to-NestJS CORS configuration.
- UI redesign or changes to form/business schemas.
- Merging or deploying the refactor branch.
- Production data synchronization after backend cutover.
