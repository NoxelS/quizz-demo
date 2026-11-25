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
pnpm dev
```

Open http://localhost:3000. Apply the migration once to a fresh database; it intentionally fails if the table already exists. The Compose database persists in a named volume. Changing `.env.local` does not change credentials already initialized in that volume. If port 5432 is occupied, set `POSTGRES_PORT` in `.env.local` and use the same port in `DATABASE_URL`; do not stop the service using that port. The `DATABASE_URL` username, password, and database must match `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`. URL-encode special characters in the database URL password.

The quiz stores contact details, answers including injury and acute-pain responses, and the calculated runner type after explicit consent. Newsletter opt-in is separate. `DATABASE_URL` is server-only and must never use a `NEXT_PUBLIC_` prefix. The sample credentials are for local development only; production must supply independent credentials and suitable database access controls. The notice and consent wording are not a substitute for production privacy/legal review. This demo does not import historical CSV leads or collect surname/UTM values.

With the app running and the local database migrated, run `set -a; . ./.env.local; set +a; pnpm test:integration`. Run `pnpm lint` and `pnpm typecheck` for checks.

## Tests

Requires Node.js 22. `pnpm test` runs the function tests; `pnpm test:integration` runs the PostgreSQL API integration test and requires the running app and migrated database described above.
