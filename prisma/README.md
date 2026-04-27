# Prisma

This folder holds the database schema and seed entrypoint.

- **`schema.prisma`** — full MVP models (patient intake, insurance, eligibility, comms, check-in, consents, staff audit). Run migrations after changing fields.
- **`seed/`** — modular seed data (`data/*.ts`) consumed by `seed/index.ts` after the schema stabilizes.

Run `npm run db:generate` after schema changes. Use `db:push` or migrations once `DATABASE_URL` points at a real Postgres instance.
