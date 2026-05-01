/**
 * Integration check: mirrors next-auth/react credentials signIn (CSRF + callback).
 *
 *   TEST_BASE_URL=http://127.0.0.1:3011 STAFF_PASSWORD=... node scripts/test-staff-credentials.mjs
 */

function cookiePairsFromResponse(res) {
  const list =
    typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (list.length) {
    return list.map((c) => c.split(";")[0].trim()).join("; ");
  }
  const single = res.headers.get("set-cookie");
  if (!single) return "";
  return single
    .split(/,(?=[^;,]+=[^;,]+)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

function mergeCookieHeaders(a, b) {
  const map = new Map();
  for (const part of `${a};${b}`.split(";")) {
    const p = part.trim();
    if (!p.includes("=")) continue;
    const [name] = p.split("=", 1);
    map.set(name, p);
  }
  return [...map.values()].join("; ");
}

async function tryLogin(base, email, password, csrfCookies) {
  const csrfRes = await fetch(`${base}/api/auth/csrf`);
  if (!csrfRes.ok) {
    throw new Error(`CSRF failed: HTTP ${csrfRes.status} ${await csrfRes.text()}`);
  }
  const { csrfToken } = await csrfRes.json();
  if (!csrfToken) throw new Error("No csrfToken in CSRF response");

  const csrfPair = cookiePairsFromResponse(csrfRes);
  const cookieHeader = mergeCookieHeaders(csrfCookies ?? "", csrfPair);

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${base}/staff`,
  });

  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body,
  });

  const text = await loginRes.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { _raw: text };
  }

  return { loginRes, data, cookieHeader, loginCookies: cookiePairsFromResponse(loginRes) };
}

async function main() {
  const base = (process.env.TEST_BASE_URL || "http://127.0.0.1:3011").replace(/\/$/, "");
  const email = process.env.TEST_STAFF_EMAIL || "intake.demo@clinic.example";
  const password = process.env.STAFF_PASSWORD || process.env.TEST_STAFF_PASSWORD;
  if (!password) {
    console.error("Missing STAFF_PASSWORD (or TEST_STAFF_PASSWORD)");
    process.exit(1);
  }

  console.log("Staff auth probe:", base, "email:", email);

  const wrong = await tryLogin(base, email, `${password}__wrong__`, "");
  const wrongUrl = wrong.data?.url ?? "";
  if (!String(wrongUrl).includes("error=")) {
    console.error("Expected failed login (error in redirect URL); got:", wrong.loginRes.status, wrong.data);
    process.exit(1);
  }
  console.log("OK wrong password rejected");

  const good = await tryLogin(base, email, password, "");
  if (!good.loginRes.ok) {
    console.error("Expected HTTP 200 from credentials callback; got:", good.loginRes.status, good.data);
    process.exit(1);
  }
  const okUrl = good.data?.url ?? "";
  if (String(okUrl).includes("error=")) {
    console.error("Login returned error in URL:", okUrl);
    process.exit(1);
  }
  console.log("OK credentials callback:", String(okUrl).slice(0, 96));

  const sessionCookie = mergeCookieHeaders(good.cookieHeader, good.loginCookies);
  const sessRes = await fetch(`${base}/api/auth/session`, {
    headers: {
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
  });
  if (!sessRes.ok) {
    console.error("Session GET failed:", sessRes.status, await sessRes.text());
    process.exit(1);
  }
  const session = await sessRes.json();
  if (!session?.user?.email || session.user.email.toLowerCase() !== email.toLowerCase()) {
    console.error("Session missing user email:", session);
    process.exit(1);
  }
  console.log("OK session:", session.user.email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
