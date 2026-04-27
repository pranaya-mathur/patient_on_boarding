# Patient On-Boarding (MVP scaffold)

Next.js (App Router) + TypeScript + Tailwind v4 + Prisma (PostgreSQL). This repo is an **architecture scaffold** — not the full product yet.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to a database (dev) |
| `npm run db:seed` | Run seed entrypoint |

Copy `.env.example` → `.env` and set `DATABASE_URL` before `db:push` / `db:seed`.

## Folder map

See `docs/ARCHITECTURE.md` for a short tour of `app/`, `components/`, `lib/`, `server/`, `services/`, and `prisma/`.
