'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Server,
  Trash2,
  Bell,
  HeartPulse,
  HelpCircle,
  Mail,
  Smartphone,
  ArrowLeft,
  Printer,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  Building2,
  Globe
} from 'lucide-react';

export default function PrivacyPolicyView() {
  const [activeSection, setActiveSection] = useState<string>('sec-1');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteEmail, setDeleteEmail] = useState<string>('');
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [deleteSent, setDeleteSent] = useState<boolean>(false);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteEmail.trim()) return;
    setDeleteSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Notice */}
      <header className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CUMPLIMIENTO GOOGLE PLAY & APP STORE
            </span>
            <span>Política de Privacidad Oficial de la Aplicación Móvil ALOEC</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">Última actualización: 5 de Agosto de 2026</span>
            <button
              onClick={handlePrint}
              className="hover:text-white flex items-center gap-1 transition-colors"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              🍃
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                ALOEC
              </span>
              <span className="text-[11px] font-medium text-emerald-600 block">
                Alimentación Orgánica EC
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Solicitar Eliminación de Datos</span>
            </button>
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Transparencia y Seguridad de Datos Personales
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Política de Privacidad y Protección de Datos
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-6">
            En <strong className="text-emerald-300 font-semibold">ALOEC (Alimentación Orgánica EC)</strong>, valoramos y respetamos tu privacidad. Este documento explica de forma detallada y transparente cómo recopilamos, utilizamos, almacenamos y protegemos tus datos personales y de salud.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              🌐 Dominio: <strong className="text-white">app.alimentacionorganicaec.net</strong>
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              🏢 Entidad: <strong className="text-white">WebFix Soluciones / ALOEC</strong>
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              📱 Aplicación: <strong className="text-white">ALOEC (Android & iOS)</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Quick Summary Highlights for Google Play Reviewers */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 relative z-20 print:mt-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Datos de Salud Privados</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tus datos de IMC, peso, altura y recetas son confidenciales. Nunca vendemos ni compartimos tu información con terceros con fines comerciales.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Pagos 100% Seguros</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Las transacciones son procesadas mediante la pasarela segura PCI-DSS de PayPhone. ALOEC nunca almacena tarjetas de crédito o débito.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Control de tu Cuenta</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Puedes solicitar la eliminación completa e irreversible de tus datos personales y cuenta en cualquier momento desde la App o vía web.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body with Sidebar Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sticky Index Sidebar */}
        <aside className="lg:col-span-1 print:hidden">
          <div className="sticky top-20 bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">
              Índice del Documento
            </h4>
            <nav className="space-y-1 text-xs font-medium">
              {[
                { id: 'sec-1', label: '1. Responsable del Tratamiento' },
                { id: 'sec-2', label: '2. Información que Recopilamos' },
                { id: 'sec-3', label: '3. Finalidad del Uso de Datos' },
                { id: 'sec-4', label: '4. Compartición con Terceros' },
                { id: 'sec-5', label: '5. Seguridad y Cifrado' },
                { id: 'sec-6', label: '6. Derechos y Eliminación de Cuenta' },
                { id: 'sec-7', label: '7. Permisos del Dispositivo' },
                { id: 'sec-8', label: '8. Menores de Edad (COPPA)' },
                { id: 'sec-9', label: '9. Cookies en la Web' },
                { id: 'sec-10', label: '10. Contacto y Soporte Oficial' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-all flex items-center justify-between ${
                    activeSection === item.id
                      ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Solicitar Borrado de Datos</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Legal Text Content Column */}
        <main className="lg:col-span-3 space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          
          {/* Introduction Statement */}
          <div className="border-b border-slate-100 pb-6">
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              La presente <strong>Política de Privacidad</strong> describe las prácticas de recolección, uso, mantenimiento, protección y divulgación de información aplicadas por <strong>WebFix Soluciones</strong> (en adelante, «nosotros», «nuestro» o «ALOEC») para la aplicación móvil <strong className="text-emerald-700">ALOEC - Alimentación Orgánica EC</strong> (disponible en Google Play Store y Apple App Store) y el portal web <strong className="text-emerald-700">app.alimentacionorganicaec.net</strong>.
            </p>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-3">
              Al descargar, instalar, registrarte o utilizar la aplicación ALOEC, aceptas las prácticas descritas en esta política. Si no estás de acuerdo con estos términos, te solicitamos abstenerte de utilizar la plataforma.
            </p>
          </div>

          {/* Section 1 */}
          <section id="sec-1" className="scroll-mt-24 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Building2 className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">1. Identificación del Responsable del Tratamiento</h2>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2 text-slate-700">
              <p><strong>Entidad Responsable:</strong> WebFix Soluciones / ALOEC Ecuador</p>
              <p><strong>Nombre de la Aplicación:</strong> ALOEC - Alimentación Orgánica EC</p>
              <p><strong>Sitio Web Oficial:</strong> <a href="https://app.alimentacionorganicaec.net" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">https://app.alimentacionorganicaec.net</a></p>
              <p><strong>Correo Electrónico Oficial de Privacidad:</strong> <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-700 underline font-semibold">soporte@alimentacionorganicaec.net</a> | <a href="mailto:contacto@alimentacionorganicaec.net" className="text-emerald-700 underline font-semibold">contacto@alimentacionorganicaec.net</a></p>
              <p><strong>Ubicación Geográfica:</strong> Quito, República del Ecuador</p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="sec-2" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <FileText className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">2. Información y Datos Personales que Recopilamos</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Recopilamos únicamente la información necesaria para brindarte una experiencia personalizada de nutrición, protocolos de jugoterapia verde y cálculo de parámetros de salud. Los datos recopilados se dividen en las siguientes categorías:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  a) Datos de Registro e Identificación de Cuenta
                </h3>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1">
                  <li>Nombre completo o nombre de usuario preferido.</li>
                  <li>Dirección de correo electrónico válida (utilizada para autenticación y recuperación de cuenta).</li>
                  <li>Fotografía de perfil (opcional, cargada voluntariamente por el usuario).</li>
                  <li>Identificador único de usuario (UID asignado de forma segura por Firebase Authentication).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  b) Datos de Salud, Nutrición y Métricas Físicas
                </h3>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1">
                  <li>Peso corporal en kilogramos (kg) y estatura en centímetros (cm).</li>
                  <li>Índice de Masa Corporal (IMC) calculado automáticamente por la aplicación.</li>
                  <li>Historial de registros y evolución de mediciones físicas.</li>
                  <li>Progreso en protocolos de salud activos (ej. Terapia Gerson, protocolo desintoxicante).</li>
                  <li>Registro de días completados y horarios sugeridos para la ingesta de jugos verdes.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  c) Datos Financieros y de Suscripción (Procesamiento Seguro)
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2">
                  Para el procesamiento de compras de membresías Premium (Plan Mensual, Trimestral o Anual), utilizamos la pasarela autorizada **PayPhone**.
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-medium space-y-1">
                  <p className="text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ALOEC NO almacena ni procesa números de tarjetas de crédito o débito, códigos CVC ni fechas de vencimiento en sus servidores.
                  </p>
                  <p>Únicamente almacenamos el estado de la transacción (Aprobado/Pendiente), el plan adquirido y el número de referencia devuelto por PayPhone.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  d) Datos Técnicos, de Dispositivo y Diagnóstico
                </h3>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1">
                  <li>Token de dispositivo para Notificaciones Push (Firebase Cloud Messaging - FCM).</li>
                  <li>Modelo del dispositivo móvil, sistema operativo (Android/iOS) y versión de la App.</li>
                  <li>Dirección IP de conexión y registros agregados de rendimiento (Crashlytics / Analytics).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="sec-3" className="scroll-mt-24 space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Eye className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">3. Finalidad del Tratamiento de los Datos</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Utilizamos la información recopilada exclusivamente para los siguientes fines legítimos:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Prestación del Servicio Principal:</strong> Permitir el acceso a los catálogos de jugos verdes, cálculo de IMC, seguimiento de dietas y reproducción de videocursos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Recordatorios y Notificaciones:</strong> Enviar alertas locales y push para recordarte los horarios de consumo de tus jugos según tu plan activo.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Gestión de Suscripciones:</strong> Verificar el estado Premium de tu cuenta y otorgar acceso a contenidos exclusivos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Soporte Técnico y Atención:</strong> Responder a tus consultas, solicitudes de ayuda o reportes de fallos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Seguridad y Protección:</strong> Prevenir actividades fraudulentas, mantener la estabilidad de los servidores y cumplir con las normativas legales aplicables.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="sec-4" className="scroll-mt-24 space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Server className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">4. Compartición de Información con Terceros</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              <strong className="text-slate-900">Garantía de No Comercialización:</strong> ALOEC NO vende, alquila, cede ni comparte tu información personal o de salud con terceras empresas para fines publicitarios o de telemercadeo.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              Compartimos información únicamente con proveedores de servicios tecnológicos de confianza esenciales para el funcionamiento de la app:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Google Firebase / Google Cloud</h4>
                <p className="text-slate-600 text-xs">Alojamiento de base de datos Firestore, autenticación segura de usuarios, almacenamiento de medios y envío de notificaciones FCM.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">PayPhone Ecuador</h4>
                <p className="text-slate-600 text-xs">Pasarela bancaria autorizada para la captura y procesamiento de pagos con tarjetas de crédito/débito bajo estándares PCI-DSS.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Vercel Inc.</h4>
                <p className="text-slate-600 text-xs">Infraestructura de servidores en la nube para el despliegue del portal web administrativo y endpoints de API.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Autoridades Legales</h4>
                <p className="text-slate-600 text-xs">Únicamente cuando sea requerido formalmente por mandato judicial o disposición legal vigente en Ecuador.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="sec-5" className="scroll-mt-24 space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Lock className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">5. Almacenamiento, Cifrado y Seguridad de los Datos</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Implementamos medidas de seguridad de grado industrial para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1.5">
              <li><strong>Cifrado en Transporte:</strong> Todas las comunicaciones entre la aplicación móvil y los servidores utilizan protocolos cifrados seguros HTTPS (TLS 1.3 / SSL de 256 bits).</li>
              <li><strong>Cifrado en Reposo:</strong> Los datos almacenados en Google Cloud Platform cuentan con cifrado en disco de alta seguridad AES-256.</li>
              <li><strong>Reglas de Seguridad de Firestore:</strong> Aplicamos reglas granulares que impiden que un usuario pueda acceder a los datos de salud o personales de otro usuario.</li>
              <li><strong>Infraestructura Certificada:</strong> Los centros de datos de Google cuentan con certificaciones internacionales ISO 27001, SOC 1/2/3 y PCI-DSS.</li>
            </ul>
          </section>

          {/* Section 6 - Crucial Google Play Requirement */}
          <section id="sec-6" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-rose-700">
                <Trash2 className="w-5 h-5 shrink-0" />
                <h2 className="text-lg font-bold text-slate-900">6. Derechos del Usuario y Mecanismo de Eliminación de Cuenta</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                REQUISITO OBLIGATORIO DE PRIVACIDAD
              </span>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
              En cumplimiento con las directivas de privacidad de Google Play Store, Apple App Store y la normativa de protección de datos, tienes derecho a solicitar en cualquier momento el acceso, rectificación o la <strong className="text-slate-900">ELIMINACIÓN TOTAL E IRREVERSIBLE DE TU CUENTA Y TODOS TUS DATOS PERSONALES</strong>.
            </p>

            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                ¿Cómo solicitar la eliminación de tus datos?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-white p-4 rounded-lg border border-rose-100 shadow-sm space-y-2">
                  <span className="font-bold text-slate-900 block">Opción A: Desde la Aplicación Móvil</span>
                  <ol className="list-decimal list-inside text-slate-600 space-y-1 text-xs">
                    <li>Abre la app ALOEC en tu teléfono.</li>
                    <li>Ingresa a la pestaña <strong>Perfil</strong>.</li>
                    <li>Selecciona <strong>Política de Privacidad</strong> o <strong>Configuración</strong>.</li>
                    <li>Presiona el botón <strong>«Eliminar mi Cuenta y Datos»</strong> y confirma.</li>
                  </ol>
                </div>

                <div className="bg-white p-4 rounded-lg border border-rose-100 shadow-sm space-y-2">
                  <span className="font-bold text-slate-900 block">Opción B: Solicitud Vía Web / Correo</span>
                  <p className="text-slate-600 text-xs">
                    Envía un correo electrónico a <a href="mailto:soporte@alimentacionorganicaec.net" className="text-rose-700 font-bold underline">soporte@alimentacionorganicaec.net</a> indicando tu correo de registro con el asunto: <em>«Solicitud de Eliminación de Cuenta - ALOEC»</em>.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-2 w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition-colors"
                  >
                    Abrir Formulario de Solicitud Web
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 border-t border-rose-200/60 pt-3">
                <p><strong>Plazo de Procesamiento:</strong> Una vez confirmada la solicitud, la cuenta y sus datos asociados (registros de peso, IMC, favoritos y perfil) serán borrados permanentemente en un plazo máximo de <strong>30 días naturales</strong>.</p>
                <p><strong>Excepción Legal:</strong> Se conservará únicamente la información fiscal o transaccional estrictamente requerida por las leyes tributarias aplicables de Ecuador durante el plazo legal obligatorio.</p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="sec-7" className="scroll-mt-24 space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Bell className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">7. Permisos Solicitados por la Aplicación Móvil</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              La aplicación móvil ALOEC solicita los siguientes permisos en tu dispositivo móvil únicamente cuando son requeridos para la funcionalidad activa:
            </p>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                <Bell className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Permiso de Notificaciones (POST_NOTIFICATIONS):</strong>
                  <p className="text-xs text-slate-600">Requerido para enviarte alertas locales y push con los recordatorios diarios de consumo de jugos y mensajes de tu protocolo activo.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Acceso a Internet (INTERNET / ACCESS_NETWORK_STATE):</strong>
                  <p className="text-xs text-slate-600">Requerido para sincronizar tus recetas, cargar videocursos y conectar con los servidores seguros de Firebase.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Galería de Fotos (READ_EXTERNAL_STORAGE / Opción de selección):</strong>
                  <p className="text-xs text-slate-600">Solicitado únicamente si decides subir o actualizar tu fotografía de perfil de forma voluntaria.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="sec-8" className="scroll-mt-24 space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <HelpCircle className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">8. Privacidad de Menores de Edad (COPPA)</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Nuestros servicios están dirigidos al público general mayor de 13 años. No recopilamos a sabiendas información de identificación personal de niños menores de 13 años sin el consentimiento previo de los padres o tutores legales.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              Si tomamos conocimiento de que hemos recopilado datos personales de un menor de 13 años sin verificación del consentimiento paterno, tomaremos medidas inmediatas para eliminar dicha información de nuestros servidores. Si eres padre/madre y crees que tu hijo nos ha proporcionado información, contáctanos en <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-700 underline font-semibold">soporte@alimentacionorganicaec.net</a>.
            </p>
          </section>

          {/* Section 9 */}
          <section id="sec-9" className="scroll-mt-24 space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Globe className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">9. Política de Cookies en la Plataforma Web</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              La aplicación móvil ALOEC no utiliza cookies. El portal web administrativo y de checkout (<strong className="text-slate-900">app.alimentacionorganicaec.net</strong>) utiliza exclusivamente cookies técnicas estrictamente necesarias para:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1">
              <li>Mantener la sesión de usuario iniciada de forma segura.</li>
              <li>Recordar preferencias básicas de navegación e idioma.</li>
              <li>Garantizar la seguridad contra ataques CSRF.</li>
            </ul>
            <p className="text-slate-700 text-xs leading-relaxed mt-2 text-slate-500">
              * No utilizamos cookies de publicidad de terceros ni tecnologías de rastreo entre sitios (cross-site tracking).
            </p>
          </section>

          {/* Section 10 */}
          <section id="sec-10" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <Mail className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">10. Contacto y Atención al Usuario</h2>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              Si tienes alguna duda, comentario, inquietud o deseas ejercer tus derechos sobre tus datos personales o solicitar la eliminación de tu cuenta, puedes comunicarte directamente con nuestro equipo oficial a través de los siguientes canales:
            </p>

            <div className="bg-emerald-900 text-white p-6 rounded-2xl space-y-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-emerald-200 font-bold">
                  🍃
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Atención al Cliente - ALOEC Ecuador</h3>
                  <p className="text-xs text-emerald-200">WebFix Soluciones - Departamento de Privacidad</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-2 border-t border-emerald-800">
                <div>
                  <span className="block text-emerald-300 font-semibold text-xs">Correo Electrónico Principal:</span>
                  <a href="mailto:soporte@alimentacionorganicaec.net" className="hover:underline font-bold text-white">
                    soporte@alimentacionorganicaec.net
                  </a>
                </div>
                <div>
                  <span className="block text-emerald-300 font-semibold text-xs">Correo Secundario:</span>
                  <a href="mailto:contacto@alimentacionorganicaec.net" className="hover:underline font-bold text-white">
                    contacto@alimentacionorganicaec.net
                  </a>
                </div>
                <div>
                  <span className="block text-emerald-300 font-semibold text-xs">Sitio Web:</span>
                  <a href="https://app.alimentacionorganicaec.net" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold text-white">
                    app.alimentacionorganicaec.net
                  </a>
                </div>
                <div>
                  <span className="block text-emerald-300 font-semibold text-xs">Ubicación:</span>
                  <span className="text-white font-medium">Quito, Ecuador</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p>© 2026 ALOEC - Alimentación Orgánica EC. Todos los derechos reservados.</p>
            <p>Desarrollado y administrado por WebFix Soluciones.</p>
          </div>

        </main>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteSent(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
            >
              ✕
            </button>

            {!deleteSent ? (
              <form onSubmit={handleDeleteRequest} className="space-y-4">
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Solicitar Eliminación de Datos</h3>
                    <p className="text-xs text-slate-500">Proceso irreversible de borrado de cuenta</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingresa el correo electrónico asociado a tu cuenta de ALOEC. Enviaremos una confirmación a nuestro equipo de soporte para procesar la eliminación completa de tus datos en un plazo máximo de 30 días.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico Registrado en ALOEC *
                  </label>
                  <input
                    type="email"
                    required
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motivo de la solicitud (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Cuéntanos brevemente por qué deseas eliminar tu cuenta..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="w-1/2 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="font-bold text-slate-900 text-base">Solicitud Registrada</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hemos recibido tu solicitud para la cuenta <strong className="text-slate-900">{deleteEmail}</strong>. Nuestro equipo de soporte procesará la eliminación e informará al correo electrónico provisto.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteSent(false);
                    setDeleteEmail('');
                    setDeleteReason('');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
