import { getAdminDb } from '../firebase/admin';

export interface PayphoneConfig {
  token: string;
  storeId: string;
  isSandbox: boolean;
}

export interface CreateLinkParams {
  amountCents: number;
  clientTransactionId: string;
  email: string;
  reference: string;
  phoneNumber?: string;
  config: PayphoneConfig;
}

export interface PayphoneStatus {
  statusCode: number;
  transactionStatus: string;
  authorizationCode?: string;
  clientTransactionId?: string;
}

export async function getPayphoneConfig(): Promise<PayphoneConfig> {
  const db = getAdminDb();
  const snap = await db.collection('gateways').doc('payphone').get();
  if (!snap.exists) throw new Error('Payphone no configurado');
  const data = snap.data()!;
  if (!data.isActive) throw new Error('Payphone no está activo');
  return {
    token: data.secretKey,
    storeId: data.publicKey,
    isSandbox: data.environment === 'sandbox',
  };
}

function baseUrl(isSandbox: boolean): string {
  return isSandbox
    ? 'https://sandbox-api.payphonetodoesposible.com/api'
    : 'https://api.payphonetodoesposible.com/api';
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function createPaymentLink(
  params: CreateLinkParams
): Promise<{ paymentId: number; payUrl: string }> {
  const { config, amountCents, clientTransactionId, email, reference, phoneNumber } = params;
  const storeId = parseInt(config.storeId) || config.storeId;

  const body: Record<string, unknown> = {
    amount: amountCents,
    amountWithoutTax: amountCents,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    clientTransactionId,
    reference,
    storeId,
    currency: 'USD',
    email: email || 'cliente@aloec.com',
  };
  if (phoneNumber) body.phoneNumber = phoneNumber.replace(/\D/g, '');

  const res = await fetch(`${baseUrl(config.isSandbox)}/Pay`, {
    method: 'POST',
    headers: headers(config.token),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Payphone HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch {
    throw new Error('Respuesta inválida de Payphone');
  }

  const map = decoded as Record<string, unknown>;
  const rawId = map['paymentId'] ?? map['id'] ?? map['transactionId'];
  const paymentId =
    typeof rawId === 'number'
      ? rawId
      : typeof rawId === 'string'
      ? parseInt(rawId)
      : 0;

  const rawUrl =
    map['payWithPayPhone'] ?? map['payUrl'] ?? map['url'] ?? map['paymentUrl'];
  const payUrl = typeof rawUrl === 'string' ? rawUrl : undefined;

  if (!payUrl) throw new Error('Payphone no devolvió URL de pago');
  return { paymentId, payUrl };
}

export async function getPaymentStatus(
  paymentId: number,
  config: PayphoneConfig
): Promise<PayphoneStatus> {
  const res = await fetch(`${baseUrl(config.isSandbox)}/Pay/${paymentId}`, {
    headers: headers(config.token),
  });
  if (!res.ok) throw new Error(`Payphone status HTTP ${res.status}`);
  return res.json() as Promise<PayphoneStatus>;
}
