'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Copy, 
  Check, 
  UploadCloud, 
  Phone, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'Ahorros' | 'Corriente';
  accountNumber: string;
  holderName: string;
  idNumber: string;
  email: string;
  isActive: boolean;
}

interface BankTransferBoxProps {
  orderId: string;
  invoiceNumber: string;
  token?: string;
  amountCents: number;
  planName: string;
  email: string;
  whatsappNumber: string;
  instructions?: string;
  accounts: BankAccount[];
}

export default function BankTransferBox({
  orderId,
  invoiceNumber,
  token,
  amountCents,
  planName,
  email,
  whatsappNumber,
  instructions,
  accounts,
}: BankTransferBoxProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [payerIdNumber, setPayerIdNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formattedAmount = (amountCents / 100).toFixed(2);
  const cleanPhone = (whatsappNumber || '593999504321').replace(/\D/g, '');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copiado al portapapeles');
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máximo 15MB).');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerIdNumber.trim()) {
      toast.error('Por favor ingresa la cédula de identidad o RUC de quien realiza el pago.');
      return;
    }

    if (!referenceNumber.trim()) {
      toast.error('Por favor ingresa el número de comprobante o referencia de tu transferencia.');
      return;
    }

    if (!selectedFile) {
      toast.error('Por favor adjunta la foto o captura del comprobante bancario.');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Subiendo comprobante bancario...');

    try {
      // 1. Upload via backend endpoint (bypasses Firebase client storage rules & auth restrictions)
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('orderId', orderId);

      const uploadRes = await fetch('/api/checkout/upload-receipt', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || 'Error al subir la imagen del comprobante.');
      }

      const downloadUrl = uploadData.url;

      // 2. Call backend endpoint to register receipt
      const res = await fetch('/api/checkout/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          token,
          receiptUrl: downloadUrl,
          receiptReference: referenceNumber.trim(),
          payerIdNumber: payerIdNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar el comprobante.');
      }

      setIsSuccess(true);
      toast.success('¡Comprobante enviado con éxito!', { id: toastId });
    } catch (err: any) {
      console.error('Error uploading receipt:', err);
      toast.error('Error: ' + (err?.message || 'No se pudo enviar el comprobante.'), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenWhatsApp = async () => {
    try {
      await fetch('/api/checkout/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          token,
          receiptUrl: '',
          receiptReference: referenceNumber.trim() || 'Notificado por WhatsApp',
          payerIdNumber: payerIdNumber.trim(),
        }),
      });
    } catch (_) {}

    const text = `¡Hola ALOEC! Acabo de realizar una transferencia bancaria para mi plan ${planName} por $${formattedAmount}.\n\n👤 Mi correo: ${email}\n🪪 Cédula de quien transfiere: ${payerIdNumber.trim() || 'Adjunta en comprobante'}\n🧾 Factura: #${invoiceNumber}${
      referenceNumber ? `\n🔢 N° Referencia: ${referenceNumber}` : ''
    }\n\nAdjunto mi comprobante en esta conversación para su validación.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto my-6 p-8 bg-[#F4FBF6] text-center rounded-2xl space-y-5">
        <div className="w-16 h-16 bg-[#E8F5E9] text-[#008000] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-xl font-black text-gray-900">¡Comprobante Recibido con Éxito!</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Tu comprobante bancario para la factura <strong className="font-mono text-gray-900">#{invoiceNumber}</strong> ha sido enviado a nuestro equipo de validación.
        </p>

        <div className="bg-white p-5 rounded-2xl text-left text-xs space-y-2.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Plan:</span>
            <span className="font-bold text-gray-900">{planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Monto:</span>
            <span className="font-bold text-[#008000]">${formattedAmount} USD</span>
          </div>
          {payerIdNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Cédula / RUC del Pagador:</span>
              <span className="font-mono font-bold text-gray-900">{payerIdNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">N° Referencia:</span>
            <span className="font-mono font-bold text-gray-900">{referenceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estado:</span>
            <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[11px]">
              En revisión (activación en minutos)
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            Acelerar Validación por WhatsApp
          </button>
          <p className="text-[11px] text-gray-400">
            Una vez validado el pago, tu cuenta se actualizará a Premium automáticamente tanto en la app móvil como en la web.
          </p>
        </div>
      </div>
    );
  }

  const activeAccounts = accounts.filter((a) => a.isActive !== false);

  return (
    <div className="max-w-2xl mx-auto my-4 p-5 sm:p-7 bg-white rounded-2xl space-y-6">
      {/* Header Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#008000] font-extrabold text-base">
          <Building2 size={20} className="text-[#008000]" />
          <span>Datos para Transferencia Bancaria (Ecuador)</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          {instructions ||
            'Realiza la transferencia desde la app de tu banco favorito por el monto exacto y remite tu comprobante por cualquiera de los dos medios disponibles a continuación.'}
        </p>
      </div>

      {/* Monto destacado - Flat ALOEC Modern */}
      <div className="bg-[#E8F5E9] p-5 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-800 block">Total a transferir:</span>
          <span className="text-2xl font-black text-emerald-900">${formattedAmount} <span className="text-xs font-medium text-emerald-700">USD</span></span>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-800 block">{planName}</span>
          <span className="text-[11px] text-emerald-700 font-medium">Factura #{invoiceNumber}</span>
        </div>
      </div>

      {/* Cuentas Bancarias */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Cuentas Bancarias Oficiales ({activeAccounts.length}):
        </h4>

        {activeAccounts.length === 0 ? (
          <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-xl">
            No hay cuentas bancarias activas registradas en este momento. Por favor notifica tu pago por WhatsApp.
          </div>
        ) : (
          <div className="space-y-3">
            {activeAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 bg-[#F8FAF9] rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-gray-900">{acc.bankName}</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-white text-gray-700 rounded-lg uppercase">
                    Cuenta {acc.accountType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  {/* Account Number */}
                  <div className="bg-white p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Número de Cuenta:</span>
                      <span className="font-mono font-bold text-gray-900">{acc.accountNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(acc.accountNumber, `num_${acc.id}`)}
                      className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Copiar número de cuenta"
                    >
                      {copiedKey === `num_${acc.id}` ? <Check size={14} className="text-[#008000]" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* ID / RUC */}
                  <div className="bg-white p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Cédula / RUC:</span>
                      <span className="font-mono font-bold text-gray-900">{acc.idNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(acc.idNumber, `id_${acc.id}`)}
                      className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Copiar identificación"
                    >
                      {copiedKey === `id_${acc.id}` ? <Check size={14} className="text-[#008000]" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Holder */}
                  <div className="bg-white p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Titular:</span>
                      <span className="font-medium text-gray-900 truncate max-w-[150px]">{acc.holderName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(acc.holderName, `name_${acc.id}`)}
                      className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Copiar titular"
                    >
                      {copiedKey === `name_${acc.id}` ? <Check size={14} className="text-[#008000]" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Email */}
                  {acc.email && (
                    <div className="bg-white p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Correo para avisos:</span>
                        <span className="font-medium text-gray-900 truncate max-w-[150px]">{acc.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(acc.email, `mail_${acc.id}`)}
                        className="p-1.5 text-gray-500 hover:text-[#008000] hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Copiar correo"
                      >
                        {copiedKey === `mail_${acc.id}` ? <Check size={14} className="text-[#008000]" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Opciones de Reporte de Pago */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
          ¿Cómo deseas confirmar tu pago?
        </h4>

        {/* Opción 1: Formulario directo en pantalla */}
        <form onSubmit={handleSubmitReceipt} className="p-5 bg-[#F4FBF6] rounded-2xl space-y-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <span className="h-5 w-5 bg-[#008000] text-white rounded-full flex items-center justify-center text-xs">1</span>
            Subir comprobante directamente aquí:
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Cédula de Identidad / RUC de quien realiza el pago: *
            </label>
            <input
              type="text"
              required
              className="w-full p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#008000] text-sm font-mono text-gray-900"
              placeholder="Ej. 0928374651 o RUC"
              value={payerIdNumber}
              onChange={(e) => setPayerIdNumber(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Número de referencia / comprobante bancario: *
            </label>
            <input
              type="text"
              required
              className="w-full p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#008000] text-sm font-mono text-gray-900"
              placeholder="Ej. 00482910 o número de documento"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1.5">
              Foto o captura de pantalla del comprobante: *
            </label>
            <input
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full p-2.5 bg-white rounded-xl text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#E8F5E9] file:text-emerald-900 hover:file:bg-emerald-200"
            />
          </div>

          {filePreview && (
            <div className="p-3 bg-white rounded-xl flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={filePreview} alt="Vista previa" className="h-16 w-16 object-cover rounded-lg" />
              <div className="text-[11px] text-gray-600">
                <span className="font-bold block text-gray-900 truncate max-w-xs">{selectedFile?.name}</span>
                <span>{(selectedFile!.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Subiendo comprobante...
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Enviar Comprobante para Activación
              </>
            )}
          </button>
        </form>

        {/* Separador visual minimalista */}
        <div className="relative flex items-center justify-center py-1">
          <div className="h-[1px] bg-gray-100 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase">o también</span>
        </div>

        {/* Opción 2: Notificar por WhatsApp */}
        <div className="p-5 bg-[#F8FAF9] rounded-2xl space-y-3 text-xs">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <span className="h-5 w-5 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
            Notificar compra y adjuntar comprobante por WhatsApp:
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Si lo prefieres, puedes enviarnos el comprobante directamente a nuestro WhatsApp oficial para que un asesor te asista de inmediato.
          </p>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            Notificar mi Transferencia por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
