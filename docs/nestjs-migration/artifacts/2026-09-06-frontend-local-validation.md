# Frontend NestJS cutover - local validation

Validation date: 2026-09-09 (America/Sao_Paulo)

## Scope and branches

- Frontend: `refactor/auth-cutover-nestjs` (Supabase `develop` and `main` unchanged)
- Backend: `develop`
- Integration boundary: same-origin Next rewrite `/api/v1/*` to NestJS on port 3001
- No push, merge, or deployment was performed.

## Imported-data baseline

The validation used the imported Postgres volume attached to `mv-pg`, not the
empty Compose volume. Before and after validation:

| Table | Rows |
| --- | ---: |
| users | 446 |
| shelters | 337 |
| volunteers | 277 |
| vacancies | 55 |
| vacancy_applications | 39 |
| shelter_dynamics | 1,369 |
| shelter_history | 1,025 |
| shelter_volunteers | 0 |
| team_memberships | 46 |
| wp_users_legacy | 973 |
| deletion_flags | 4 |

All synthetic `task9+*@test.local` users, the synthetic vacancy/volunteer, and
all Redis keys in databases 0-15 were zero after cleanup.

## Browser matrix

Playwright 1.63.0 ran against installed Chrome with isolated browser contexts.
The runner lived only in the ignored local ledger and was removed after use.

- Anonymous: home, database, volunteer program, public vacancy, public
  volunteer, and protected redirect to login.
- Shelter: login, panel, profile, history load, dynamics, vacancies, and team.
- Volunteer: login, panel, profile, vacancy list, successful application,
  duplicate application (409), logout, and protected redirect.
- Manager: linked shelter panel and dynamics using a negative synthetic
  `wp_post_id`; unlinked manager returned `shelterId: null` without leaking the
  linked shelter.
- Admin: panel, manager list, and shelter list.
- Active team-only user: limited panel and dynamics.
- Disabled team-only user: inactive panel and blocked dynamics write (403).
- Session: removing only `mv_at` and navigating to `/painel` rotated the refresh
  session and restored `mv_at`.

Result: 26 page checks and 6 explicit API/session checks passed. Every checked
page had document width at or below viewport width.

## Network and cookies

- Rewrite health: `http://localhost:3000/api/v1/health` returned 200 with
  Postgres and Redis up.
- Supabase requests: 0.
- Business/auth browser calls: same-origin `/api/v1/*`.
- Other external hosts: Google Fonts and `servicodados.ibge.gov.br` only.
- `mv_at` and `mv_rt`: HttpOnly, SameSite=Lax, Path=/, Secure=false locally.
- Browser page errors: 0.
- The observed 401 responses were anonymous `/auth/me` probes and were expected.

Desktop and 390x844 mobile screenshots were inspected from the ignored local
artifact directory. No incoherent overlap or horizontal overflow was found.

## Defects reproduced and fixed with TDD

1. `CookieBanner` read `document.cookie` during the first client render, causing
   hydration mismatch. A failing SSR/first-render parity test was added before
   switching the component to a hydration-stable external-store snapshot.
2. `proxy.ts` was at the repository root while the application uses `src/app`,
   so Next did not load it. A failing location test was added before moving it to
   `src/proxy.ts`. The production build now reports `Proxy (Middleware)`.
3. Admin-created shelters receive negative synthetic `wp_post_id` values, but
   frontend and backend dynamics parsers rejected negatives. Failing tests were
   observed in both repositories before accepting signed nonzero int32 values.

## Verification gates

Frontend:

- `npm test`: 34 files, 192 tests passed.
- `npm run lint`: 0 errors, 3 pre-existing warnings.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed, 91 static/dynamic routes generated and Proxy present.

Backend:

- `npm test -- --runInBand`: 48 suites, 439 tests passed.
- `npm run test:import -- --runInBand`: 3 suites, 49 tests passed.
- `REDIS_TEST_URL=redis://localhost:6380/15 npm run test:e2e`: 10 suites,
  61 tests passed.
- `npm run lint`: passed with zero warnings.
- `npx tsc --noEmit`: passed.
- `npx prisma validate`: passed.
- `npm run build`: passed.

The remaining frontend lint warnings are the existing `opengraph-image.tsx`
`img` warning and two `useChartReflow.ts` hook dependency warnings.
