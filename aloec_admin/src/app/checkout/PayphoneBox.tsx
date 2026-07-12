'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    PPaymentButtonBox: new (config: object) => { render: (id: string) => void };
  }
}

interface Props {
  token: string;
  storeId: string;
  amountCents: number;
  clientTransactionId: string;
  planName: string;
  email: string;
}

export default function PayphoneBox({ token, storeId, amountCents, clientTransactionId, planName, email }: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js';
    script.onload = () => {
      new window.PPaymentButtonBox({
        token,
        clientTransactionId,
        amount: amountCents,
        amountWithoutTax: amountCents,
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        currency: 'USD',
        storeId,
        reference: `Suscripcion ${planName} ALOEC`,
        email,
      }).render('pp-button');
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center py-4">
      <div id="pp-button"></div>
    </div>
  );
}
