import { createHmac } from 'crypto';

const SECRET = process.env.CHECKOUT_SECRET ?? 'dev_secret';

export function createCheckoutToken(userId: string, planId: string): string {
  const payload = `${userId}:${planId}:${Date.now()}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  const raw = `${payload}:${sig}`;
  return Buffer.from(raw).toString('base64url');
}

export function verifyCheckoutToken(token: string): { userId: string; planId: string } | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 4) return null;
    const [userId, planId, ts, sig] = parts;
    // Expirar tokens después de 30 minutos
    if (Date.now() - parseInt(ts) > 30 * 60 * 1000) return null;
    const payload = `${userId}:${planId}:${ts}`;
    const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    return { userId, planId };
  } catch {
    return null;
  }
}
