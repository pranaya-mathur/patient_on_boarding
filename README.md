# Patient On-Boarding (MVP)

A premium Next.js 14 + FastAPI healthcare patient onboarding system featuring AI-powered eligibility, OCR, and a smart intake assistant.

## Features
- **AI Intake Assistant**: Real-time patient support with medical guardrails.
- **Automated Eligibility**: Smart verification via Groq LLaMA 3.
- **Insurance OCR**: Vision-based card parsing (GPT-4o / Groq LLaVA).
- **Self Check-in**: Secure, token-based arrival confirmation.
- **Local-First**: No cloud dependencies required for development (SQLite + Local Storage).

## Quick Start (Main App)

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

3. **Database Initialization (SQLite)**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000/intake/demo-token](http://localhost:3000/intake/demo-token) to test.

## AI Backend (FastAPI)

The `backend/` directory contains supplementary Python services for specialized AI reasoning.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Folder Map
- `src/app`: Next.js App Router (APIs and Pages)
- `src/components`: UI components (Radix + Tailwind 4)
- `src/services`: Adapter-based business logic (Eligibility, OCR, Chat)
- `src/lib`: Core utilities and storage adapters
- `backend/`: FastAPI Python services
- `uploads/`: Local directory for insurance card storage (auto-created)

## Technology Stack
- **Frontend**: Next.js 14, Tailwind CSS 4, React Hook Form, Zod
- **Backend**: Next.js Route Handlers, FastAPI
- **Database**: Prisma (SQLite for local dev)
- **AI**: LangChain, Groq, OpenAI
- **Auth**: NextAuth.js v5 (Auth.js)
