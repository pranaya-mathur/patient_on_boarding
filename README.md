# Patient On-Boarding (MVP scaffold)

Next.js (App Router) + TypeScript + Tailwind v4 + Prisma (PostgreSQL) + FastAPI (AI backend). This repo is now split into:

- `src/` web app scaffold
- `backend/` AI services for patient access automation

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to a database (dev) |
| `npm run db:seed` | Run seed entrypoint |

Copy `.env.example` → `.env` and set `DATABASE_URL` before `db:push` / `db:seed`.

## AI backend (FastAPI + LangChain)

The `backend/` service implements:

- Insurance card OCR parsing using OpenAI vision models
- Eligibility reasoning using Groq models through LangChain
- Patient communication chatbot using Groq through LangChain

Quick start:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

Then open `http://localhost:8001/docs` for interactive API docs.

## Folder map

See `docs/ARCHITECTURE.md` for a short tour of `app/`, `components/`, `lib/`, `server/`, `services/`, and `prisma/`.
