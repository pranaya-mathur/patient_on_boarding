# Architecture (scaffold)

## `src/app/`

Next.js **App Router** routes and layouts.

| Path | Role |
|------|------|
| `/` | Public landing (no PHI) |
| `/intake/[token]` | Patient session surface — route group `(patient)` keeps URL clean while allowing a dedicated layout |
| `/staff/*` | Staff console — route group `(staff)` + `StaffAppShell` |
| `/checkin/[token]` | QR / link self check-in (minimal placeholder) |
| `/api/health` | Liveness probe |

## `src/components/`

| Folder | Role |
|--------|------|
| `patient/` | Intake-only UI (e.g. `PatientAppShell`) |
| `staff/` | Dashboard UI (e.g. `StaffAppShell`) |
| `shared/` | Cross-surface pieces (badges, empty states, upload, chat — to be added) |
| `ui/` | shadcn primitives (empty until `shadcn init`) |

## `src/lib/`

App-wide utilities and singletons (`cn`, Prisma client). **No** business rules.

## `src/server/`

Server-only orchestration (session resolution, staff auth, Prisma queries). Populated in later passes.

## `src/services/`

**Mock-first adapters** for OCR, eligibility, reminders, and chat. Route handlers / server actions call these instead of inlining vendor logic.

## `src/schemas/` · `src/types/` · `src/hooks/`

Reserved for Zod form schemas, shared TS types, and client hooks — see each folder’s `README.md`.

## `src/styles/`

`design-tokens.css` holds RGB design variables; `globals.css` imports Tailwind and maps tokens into `@theme inline` for utilities like `bg-background` and `text-accent`.

## `prisma/`

`schema.prisma` is a **placeholder** data model (string enums where Prisma enums will land later). `seed/` is modular: `index.ts` runs `data/*` fixtures.
