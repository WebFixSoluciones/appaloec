'use client';

import React, { useState } from 'react';
import { CreditCard, Building2, Globe, ShieldCheck } from 'lucide-react';
import PayphoneBox from './PayphoneBox';
import BankTransferBox, { BankAccount } from './BankTransferBox';

interface BankConfig {
  isActive: boolean;
  whatsappNumber: string;
  supportEmail: string;
  instructions: string;
  accounts: BankAccount[];
}

interface CheckoutViewProps {
  orderId: string;
  invoiceNumber: string;
  clientTransactionId: string;
  token?: string;
  userId: string;
  planName: string;
  amountCents: number;
  email: string;
  initialCountry: string;
  ppToken: string;
  ppStoreId: string;
  bankConfig: BankConfig | null;
}

export default function CheckoutView({
  orderId,
  invoiceNumber,
  clientTransactionId,
  token,
  userId,
  planName,
  amountCents,
  email,
  initialCountry,
  ppToken,
  ppStoreId,
  bankConfig,
}: CheckoutViewProps) {
  const isEcUser = initialCountry.toUpperCase() === 'EC';
  const [country, setCountry] = useState<'EC' | 'INT'>(isEcUser ? 'EC' : 'EC'); // Default to EC
  const [selectedMethod, setSelectedMethod] = useState<'bank_transfer' | 'payphone'>(
    isEcUser && bankConfig?.isActive !== false ? 'bank_transfer' : 'payphone'
  );

  const canShowBankTransfer = country === 'EC' && bankConfig?.isActive !== false && (bankConfig?.accounts?.length ?? 0) > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#008000]/10 flex items-center justify-center font-bold text-[#008000] text-xs rounded-lg">
              🌱
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900">Pago seguro — ALOEC</p>
              <p className="text-xs text-gray-500">
                {planName} · ${(amountCents / 100).toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* Country Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => {
                setCountry('EC');
                if (bankConfig?.isActive !== false) {
                  setSelectedMethod('bank_transfer');
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                country === 'EC' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>🇪🇨</span> Ecuador
            </button>
            <button
              type="button"
              onClick={() => {
                setCountry('INT');
                setSelectedMethod('payphone');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                country === 'INT' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Globe size={13} /> Internacional
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        {/* Payment Method Selector Tabs */}
        {canShowBankTransfer && (
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto mb-6">
            <button
              type="button"
              onClick={() => setSelectedMethod('bank_transfer')}
              className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                selectedMethod === 'bank_transfer'
                  ? 'border-[#008000] bg-emerald-50/50 text-[#008000] shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building2 size={18} className="shrink-0" />
              <span>Transferencia Bancaria (Ecuador)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('payphone')}
              className={`p-3.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                selectedMethod === 'payphone'
                  ? 'border-[#008000] bg-emerald-50/50 text-[#008000] shadow-xs'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={18} className="shrink-0" />
              <span>Tarjeta de Crédito / Débito</span>
            </button>
          </div>
        )}

        {/* Selected Payment View */}
        {selectedMethod === 'bank_transfer' && canShowBankTransfer ? (
          <BankTransferBox
            orderId={orderId}
            invoiceNumber={invoiceNumber}
            token={token}
            amountCents={amountCents}
            planName={planName}
            email={email}
            whatsappNumber={bankConfig?.whatsappNumber || '593999504321'}
            instructions={bankConfig?.instructions}
            accounts={bankConfig?.accounts || []}
          />
        ) : (
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="text-center pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Pasarela de Pago Segura
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-1">
                  Paga con Tarjeta de Crédito o Débito
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visa, Mastercard, Diners, American Express vía PayPhone.
                </p>
              </div>

              <PayphoneBox
                token={ppToken}
                storeId={ppStoreId}
                amountCents={amountCents}
                clientTransactionId={clientTransactionId}
                planName={planName}
                email={email}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Security Badge */}
      <div className="border-t border-gray-200 bg-white py-3 px-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <ShieldCheck size={14} className="text-[#008000]" />
        <span>Pagos procesados y protegidos con encriptación TLS 256-bit por ALOEC</span>
      </div>
    </div>
  );
}
