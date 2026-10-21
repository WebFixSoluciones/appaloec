import { NextRequest, NextResponse } from 'next/server';
import { processOrderReferralCommission } from '../../../../../lib/referral/commissions';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Falta orderId' }, { status: 400 });
    }

    const result = await processOrderReferralCommission(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[process-order route] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
