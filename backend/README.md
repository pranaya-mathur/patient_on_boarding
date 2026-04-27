# Patient Access AI Backend

Python FastAPI service for AI-powered patient access workflows:

- Insurance card OCR parsing (OpenAI vision)
- Eligibility reasoning and normalization (Groq via LangChain)
- Patient-facing virtual assistant/chat (Groq via LangChain)

## 1) Setup virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

## 2) Install dependencies

```bash
pip install -r requirements.txt
```

## 3) Configure environment

```bash
cp .env.example .env
```

Required keys:

- `GROQ_API_KEY`
- `OPENAI_API_KEY`

## 4) Run API

```bash
uvicorn app.main:app --reload --port 8001
```

API docs:

- [http://localhost:8001/docs](http://localhost:8001/docs)

## Endpoints

- `GET /health`
- `POST /v1/patient-access/ocr/insurance-card` (multipart: `file`, optional `side`)
- `POST /v1/patient-access/eligibility/check`
- `POST /v1/patient-access/chat/respond`

## Example calls

```bash
curl -X POST "http://localhost:8001/v1/patient-access/eligibility/check" \
  -H "Content-Type: application/json" \
  -d '{"payer_key":"AETNA","member_id":"XDK8829103","group_number":"GRP-00921"}'
```

```bash
curl -X POST "http://localhost:8001/v1/patient-access/chat/respond" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"intake_123","message":"Can you help verify my insurance and payment options?"}'
```

