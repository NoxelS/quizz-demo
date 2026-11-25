# Quizz Lead Funnel Demo

Scaffold for Jana Pohl Running's quiz and lead funnel.

## Getting started

Requires Node.js 22, pnpm 12, and Docker.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
docker compose --env-file .env.local up -d
docker compose --env-file .env.local exec -T db pg_isready -U quiz -d quiz
docker compose --env-file .env.local exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < migrations/001_create_leads.sql
docker compose --env-file .env.local exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < migrations/002_calendly_events.sql
pnpm dev
```

Open http://localhost:3000. Apply both migrations once to a fresh database; they intentionally fail if the tables already exist. The Compose database persists in a named volume. Changing `.env.local` does not change credentials already initialized in that volume. If port 5432 is occupied, set `POSTGRES_PORT` in `.env.local` and use the same port in `DATABASE_URL`; do not stop the service using that port. The `DATABASE_URL` username, password, and database must match `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`. URL-encode special characters in the database URL password.

The quiz stores contact details, answers including injury and acute-pain responses, and the calculated runner type after explicit consent. Newsletter opt-in is separate. `DATABASE_URL` is server-only and must never use a `NEXT_PUBLIC_` prefix. The sample credentials are for local development only; production must supply independent credentials and suitable database access controls. The notice and consent wording are not a substitute for production privacy/legal review. This demo does not import historical CSV leads or collect surname/UTM values.

Set `NEXT_PUBLIC_CALENDLY_URL` in `.env.local` to the shared booking page for Mara or Jana. The quiz result shows a booking link only when this URL is configured; quiz answers are not sent to Calendly.

Set `CALENDLY_WEBHOOK_SIGNING_KEY` to the secret used to create the Calendly webhook subscription. `POST /api/calendly` verifies signed deliveries and stores the event type, event creation time, invitee URI and email in PostgreSQL before returning 200. Repeated deliveries for the same invitee and event type are stored once. Database failures return 503 for retry. The webhook does not update or associate leads automatically. It subscribes at the Calendly user scope, so events for other event types owned by that user may also arrive. Restrict access to the database and define retention and deletion procedures for stored personal data.

`NEXT_PUBLIC_CALENDLY_URL` is embedded at build time in the browser bundle. The image workflow builds with the configured booking URL; changing it requires a new image. `/robots.txt` asks crawlers not to index the site; it is not access control.

With the app running and the local database migrated, run `set -a; . ./.env.local; set +a; pnpm test:integration`. Run `pnpm lint` and `pnpm typecheck` for checks.

## Tests

Requires Node.js 22. `pnpm test` runs the CI-safe function tests; `pnpm test:integration` runs the PostgreSQL API integration test and requires the running app and migrated database described above.

`pnpm test:calendly:recorded` replays the ten recorded webhook requests using their original raw bodies and signatures. It requires the ignored local `exercise-data/posteingang.md` and `exercise-data/calendly-webhooks/`; it fails with instructions if either is missing. The recordings and handover credentials are not committed.
