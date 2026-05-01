#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Paths are relative to prisma/schema.prisma — use ./auth-ci.db (not ./prisma/...).
export DATABASE_URL="${DATABASE_URL:-file:./auth-ci.db}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://127.0.0.1:3011}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")}"
export STAFF_PASSWORD="${STAFF_PASSWORD:-CiSmokeTestStaffPwd9!}"
export STAFF_ALLOWED_EMAILS="${STAFF_ALLOWED_EMAILS:-intake.demo@clinic.example}"
export GROQ_API_KEY="${GROQ_API_KEY:-dummy}"
export NODE_ENV="${NODE_ENV:-production}"
export TEST_BASE_URL="${NEXTAUTH_URL}"
export PORT="${PORT:-3011}"

rm -f prisma/auth-ci.db prisma/auth-ci.db-journal 2>/dev/null || true
npx prisma db push --accept-data-loss
npm run db:seed
if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "Skipping next build (SKIP_BUILD=1)"
else
  npm run build
fi

npx next start -p "${PORT}" &
PID=$!
cleanup() {
  kill "${PID}" 2>/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 90); do
  if curl -sf "${NEXTAUTH_URL}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf "${NEXTAUTH_URL}/api/health" >/dev/null 2>&1; then
  echo "Server did not become healthy at ${NEXTAUTH_URL}/api/health" >&2
  exit 1
fi

node scripts/test-staff-credentials.mjs
echo "All staff auth checks passed."
