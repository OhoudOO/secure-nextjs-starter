# Secure Next.js starter

Starting point for the "Secure Full-Stack Development" service. Next.js 16 (App Router), TypeScript strict,
Auth.js, Zod. Each security control is small, tested, and marked in the code with why it is there.

| Control | Where | What it does |
| --- | --- | --- |
| Security headers | `next.config.ts` | HSTS, nosniff, frame denial, referrer and permissions policies, no `X-Powered-By` |
| Content-Security-Policy | `src/proxy.ts`, `src/lib/security/csp.ts` | Per-request nonce; only nonce-tagged scripts run |
| Authentication | `src/auth.ts` | Auth.js with GitHub, encrypted JWT session cookie, 8-hour lifetime |
| Route protection | `src/proxy.ts` + each page | Signed-out users are redirected; pages check again |
| Authorization (IDOR) | `src/lib/authz.ts`, `src/app/api/notes/[id]` | Every record fetched by id is checked against the signed-in user |
| Input validation | `src/lib/validation/contact.ts` | Zod schemas with lengths, formats, and unknown keys rejected |
| Rate limiting | `src/lib/security/rateLimit.ts` | Per-IP fixed window behind an interface (swap memory for Redis in production) |
| Safe errors | `src/lib/errors.ts` | Generic messages to users, no stack traces or request bodies in logs |
| Environment | `src/lib/env.ts`, `src/instrumentation.ts` | Startup fails if a secret is missing or too short |
| Container | `Dockerfile` | Standalone build, non-root user, no npm in the final image |
| Pipeline | `.github/workflows` | `ci.yml` (lint, types, tests, build) and `devsecops.yml` (secrets, Semgrep, Trivy, image + SBOM) |

## Develop

```bash
cp .env.example .env.local   # fill in, AUTH_SECRET from: openssl rand -base64 32
pnpm install
pnpm dev
pnpm test && pnpm typecheck && pnpm lint
```

## Tested (October 2026)

- 9 unit tests pass; type check and lint are clean; `pnpm audit --prod` finds no known vulnerabilities.
- Production build over HTTP: every response carries the headers above; all 14 page scripts carry the CSP nonce;
  `/dashboard` redirects signed-out users; `/api/notes/1` returns 401 without a session; the contact API rejects bad
  input and unknown fields with 400 and returns 429 after the hourly limit.
- Docker image: builds, runs as `node`, has no npm, and Trivy finds 0 HIGH/CRITICAL fixable vulnerabilities.
- The quick-scan toolkit's `review.sh` on this repository: no secrets, and 11 low findings only (unpinned base
  image digests, `apk upgrade`, untranslated JSX text), none medium or above.
- Not covered: the GitHub sign-in flow itself (needs a real OAuth app).
