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

function linksUrl(isSandbox: boolean): string {
  return isSandbox
    ? 'https://pay.payphonetodoesposible.com/api/Links'
    : 'https://pay.payphonetodoesposible.com/api/Links';
}

function confirmUrl(): string {
  return 'https://paymentbox.payphonetodoesposible.com/api/confirm';
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
  const { config, amountCents, clientTransactionId, email, reference } = params;

  // API Links acepta máximo 15 caracteres en clientTransactionId
  const txId = clientTransactionId.slice(0, 15);

  // Sanitizar reference: Payphone no acepta caracteres especiales/tildes
  const safeReference = reference.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 50);

  const body: Record<string, unknown> = {
    amount: amountCents,
    amountWithoutTax: amountCents,
    amountWithTax: 0,
    tax: 0,
    clientTransactionId: txId,
    reference: safeReference,
    currency: 'USD',
    email: email || 'cliente@aloec.com',
  };

  const url = linksUrl(config.isSandbox);
  console.log('[payphone] POST', url, 'storeId:', config.storeId, 'txId:', txId);

  const res = await fetch(url, {
    method: 'POST',
    headers: headers(config.token),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('[payphone] error', res.status, text.slice(0, 500));
    throw new Error(`Payphone HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  // La API Links devuelve directamente el string de la URL
  const payUrl = text.replace(/^"|"$/g, '').trim();
  if (!payUrl.startsWith('http')) throw new Error('Payphone no devolvió URL de pago');

  return { paymentId: 0, payUrl };
}

export async function confirmPayment(
  paymentId: number,
  clientTxId: string,
  config: PayphoneConfig
): Promise<PayphoneStatus> {
  const res = await fetch(confirmUrl(), {
    method: 'POST',
    headers: headers(config.token),
    body: JSON.stringify({ id: paymentId, clientTxId }),
  });
  if (!res.ok) throw new Error(`Payphone confirm HTTP ${res.status}`);
  return res.json() as Promise<PayphoneStatus>;
}

export async function getPaymentStatus(
  paymentId: number,
  config: PayphoneConfig
): Promise<PayphoneStatus> {
  const base = config.isSandbox
    ? 'https://sandbox-api.payphonetodoesposible.com/api'
    : 'https://api.payphonetodoesposible.com/api';

  const res = await fetch(`${base}/Pay/${paymentId}`, {
    method: 'GET',
    headers: headers(config.token),
  });
  if (!res.ok) throw new Error(`Payphone status HTTP ${res.status}`);
  return res.json() as Promise<PayphoneStatus>;
}
