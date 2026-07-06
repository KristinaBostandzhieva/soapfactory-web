// Server-side Cloudflare Turnstile verification.
//
// This is the ONLY thing that actually gates a request — the client widget is
// just UX. Every protected endpoint must call verifyTurnstile() and reject when
// it returns false. Cloudflare enforces that each token is single-use and
// short-lived, so a captured/replayed token fails on its second use here.
//
// Fails CLOSED: a missing/invalid token, a failed siteverify, or a network
// error all return false. When no secret is configured we allow requests in
// development only (so local work isn't blocked) but reject in production.

const SECRET = process.env.TURNSTILE_SECRET_KEY;
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileConfigured(): boolean {
  return !!SECRET;
}

export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  if (!SECRET) {
    // Not configured: allow in dev, block in production (fail closed).
    return process.env.NODE_ENV !== 'production';
  }
  if (!token || typeof token !== 'string') return false;

  try {
    const form = new URLSearchParams();
    form.append('secret', SECRET);
    form.append('response', token);
    if (ip && ip !== 'unknown') form.append('remoteip', ip);

    const res = await fetch(VERIFY_URL, { method: 'POST', body: form });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // fail closed on any network/parse error
  }
}
