'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  HeartPulse,
  CreditCard,
  UserCheck,
  AlertTriangle,
  BookOpen,
  Scale,
  Lock,
  ArrowLeft,
  Printer,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Gift,
  HelpCircle,
  Mail,
  Smartphone,
  Globe
} from 'lucide-react';

export default function TermsAndConditionsView() {
  const [activeSection, setActiveSection] = useState<string>('sec-1');

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Notice */}
      <header className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              MARCO LEGAL & CUMPLIMIENTO APP STORES
            </span>
            <span>Términos y Condiciones Oficiales de Uso y Contratación — ALOEC</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">Última actualización: 19 de Octubre de 2026</span>
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
            <img
              src="/logo.png"
              alt="ALOEC Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                ALOEC
              </span>
              <span className="text-[11px] font-medium text-emerald-600 block">
                Alimentación Orgánica EC
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/politicas-de-privacidad"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Políticas de Privacidad</span>
              <span className="sm:hidden">Privacidad</span>
            </Link>

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
      <section className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4">
            <Scale className="w-4 h-4 text-emerald-400" />
            Condiciones de Servicio, Licencia y Contratación
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-6">
            Bienvenido a <strong className="text-emerald-300 font-semibold">ALOEC (Alimentación Orgánica EC)</strong>. Por favor lee atentamente estos términos antes de descargar la aplicación móvil, registrarte, suscribirte o acceder a nuestro libro digital oficial y contenidos de salud.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              🌐 Portal Web: <strong className="text-white">app.alimentacionorganicaec.net</strong>
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              📱 Apps: <strong className="text-white">ALOEC (Android & iOS)</strong>
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              📖 Obra: <strong className="text-white">&ldquo;Ama Lo Que Comes&rdquo; — José Rengifo</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Quick Highlights Summary Cards */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 relative z-20 print:mt-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Deslinde Médico</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nuestros protocolos, jugoterapia y calculadora de IMC tienen fines educativos e informativos. No sustituyen el criterio ni el tratamiento de un médico colegiado.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Libro y Propiedad</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El libro digital oficial, recetas, videos y protocolos están protegidos por derechos de autor. Su licencia es estrictamente personal e intransferible.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Pagos PayPhone</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Las membresías y compras se procesan con los más altos estándares de seguridad bancaria vía PayPhone. Acceso inmediato a la web y a la app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 print:hidden">
            <div className="sticky top-24 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                Índice de Secciones
              </p>
              <nav className="space-y-1 text-xs">
                {[
                  { id: 'sec-1', label: '1. Aceptación del Acuerdo' },
                  { id: 'sec-2', label: '2. Identificación del Titular' },
                  { id: 'sec-3', label: '3. Deslinde de Responsabilidad Médica' },
                  { id: 'sec-4', label: '4. Cuentas de Usuario y Seguridad' },
                  { id: 'sec-5', label: '5. Membresías, Pagos y Libro Digital' },
                  { id: 'sec-6', label: '6. Política de Reembolsos y Devoluciones' },
                  { id: 'sec-7', label: '7. Propiedad Intelectual y Derechos' },
                  { id: 'sec-8', label: '8. Sistema de Referidos y Bonificaciones' },
                  { id: 'sec-9', label: '9. Uso Aceptable y Prohibiciones' },
                  { id: 'sec-10', label: '10. Disponibilidad del Servicio' },
                  { id: 'sec-11', label: '11. Cancelación y Baja de Cuenta' },
                  { id: 'sec-12', label: '12. Ley Aplicable y Jurisdicción' },
                  { id: 'sec-13', label: '13. Contacto y Soporte Oficial' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                      activeSection === item.id
                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 pl-2.5'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  href="/politicas-de-privacidad"
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl border border-slate-200 transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ver Política de Privacidad</span>
                </Link>

                <Link
                  href="/eliminacion-de-datos"
                  className="w-full py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Eliminación de Cuenta / Datos</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Detailed Legal Content */}
          <main className="lg:col-span-8 space-y-8">

            {/* SECCIÓN 1 */}
            <section id="sec-1" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Aceptación del Acuerdo
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                El presente documento constituye un contrato legalmente vinculante entre usted (en adelante, el <strong>&ldquo;Usuario&rdquo;</strong> o <strong>&ldquo;Cliente&rdquo;</strong>) y <strong>ALOEC (Alimentación Orgánica EC)</strong>, que regula el acceso, navegación, registro, suscripción y utilización de:
              </p>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>La aplicación móvil oficial <strong>ALOEC</strong> para sistemas operativos Android e iOS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>La plataforma web accesible en <strong>app.alimentacionorganicaec.net</strong> y sus subdominios asociados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Los contenidos digitales, libro digital oficial <em>&ldquo;Ama Lo Que Comes&rdquo;</em>, recetas de jugoterapia, calculadoras interactivas y 9 protocolos de salud integral.</span>
                </li>
              </ul>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <strong>Manifestación de conformidad:</strong> Al presionar los botones <em>&ldquo;Registrarme&rdquo;</em>, <em>&ldquo;Comprar&rdquo;</em>, <em>&ldquo;Proceder al Pago&rdquo;</em>, o al instalar y hacer uso activo de la aplicación en su smartphone, usted declara haber leído, comprendido y aceptado en su totalidad estos Términos y Condiciones, así como nuestra <Link href="/politicas-de-privacidad" className="font-bold underline text-emerald-800">Política de Privacidad</Link>. Si no está de acuerdo, le solicitamos abstenerse de utilizar el servicio.
              </div>
            </section>

            {/* SECCIÓN 2 */}
            <section id="sec-2" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Identificación del Titular del Servicio
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                La plataforma ALOEC y la distribución de sus obras digitales son administradas bajo la siguiente titularidad jurídica y técnica:
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
                <p><strong>Denominación comercial:</strong> ALOEC — Alimentación Orgánica EC</p>
                <p><strong>Autor y Creador del Contenido:</strong> José Rengifo (Autor del libro <em>&ldquo;Ama Lo Que Comes&rdquo;</em>)</p>
                <p><strong>Desarrollo y Operación Tecnológica:</strong> WebFix Soluciones</p>
                <p><strong>País de Registro y Operación:</strong> República del Ecuador</p>
                <p><strong>Correo Electrónico de Contacto Legal y Soporte:</strong> <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-700 font-bold hover:underline">soporte@alimentacionorganicaec.net</a></p>
                <p><strong>Sitio Web Oficial:</strong> <a href="https://app.alimentacionorganicaec.net" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">https://app.alimentacionorganicaec.net</a></p>
              </div>
            </section>

            {/* SECCIÓN 3: DESLINDE MÉDICO (CRÍTICO GOOGLE/APPLE) */}
            <section id="sec-3" className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm scroll-mt-24 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/60 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Deslinde de Responsabilidad Médica y Salud
                </h2>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-2 leading-relaxed">
                <div className="flex items-center gap-2 font-black text-amber-900 uppercase tracking-wide">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  Aviso Preventivo Obligatorio (Medical Disclaimer)
                </div>
                <p>
                  <strong>ALOEC NO ES UN SERVICIO MÉDICO NI PROVEE ASISTENCIA DE EMERGENCIA.</strong> El contenido brindado en la aplicación, el libro <em>&ldquo;Ama Lo Que Comes&rdquo;</em>, los protocolos para patologías específicas, las recetas de jugos curativos y la calculadora de Índice de Masa Corporal (IMC) tienen un carácter <strong>estrictamente informativo, divulgativo, educativo y de orientación sobre hábitos saludables y nutrición basada en plantas</strong>.
                </p>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>1. No sustituye la consulta médica:</strong> Ninguna recomendación emitida en ALOEC debe interpretarse como un diagnóstico clínico, prescripción médica, tratamiento de enfermedades o reemplazo de la consulta con su médico de cabecera, endocrinólogo, nutricionista titulado o profesional sanitario.
                </p>
                <p>
                  <strong>2. Poblaciones de especial cuidado:</strong> Si usted está embarazada, en periodo de lactancia, es menor de edad, padece diabetes tipo 1 o 2, insuficiencia renal, afecciones hepáticas, hipertensión arterial, o se encuentra bajo tratamiento farmacológico continuo, <strong>es indispensable que consulte a su médico especialista antes de modificar sus hábitos alimenticios, realizar ayunos o ingerir preparados de jugoterapia en concentraciones elevadas</strong>.
                </p>
                <p>
                  <strong>3. Responsabilidad personal:</strong> La adopción de cualquiera de los protocolos dietéticos, ingredientes y recetas es una decisión libre, informada y de exclusiva responsabilidad del Usuario. ALOEC, su autor José Rengifo y su equipo de desarrollo quedan expresamente exonerados de cualquier daño, efecto adverso, alergia o complicación derivada del uso inadecuado o negligente de la información.
                </p>
              </div>
            </section>

            {/* SECCIÓN 4 */}
            <section id="sec-4" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  4
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Cuentas de Usuario, Edad y Seguridad
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>Capacidad jurídica y edad mínima:</strong> Para registrarse en ALOEC debe tener al menos 18 años de edad o contar con la expresa autorización de sus padres o tutores legales.
                </p>
                <p>
                  <strong>Veracidad de la información:</strong> El Usuario garantiza que los datos suministrados (nombre completo, correo electrónico, peso, estatura y diagnósticos de IMC) son fidedignos, exactos y actualizados.
                </p>
                <p>
                  <strong>Custodia de credenciales:</strong> La contraseña de acceso es confidencial, personal e intransferible. El Usuario es el único responsable de mantener la seguridad de sus claves y de cualquier actividad desarrollada bajo su cuenta. En caso de detectar accesos no autorizados, deberá notificar a la brevedad a nuestro equipo de soporte.
                </p>
              </div>
            </section>

            {/* SECCIÓN 5 */}
            <section id="sec-5" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  5
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Membresías, Pagos y Libro Digital
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>Modalidades de contratación:</strong> ALOEC ofrece planes de membresía por períodos determinados (ej. 30 días, anuales o accesos completos) que incluyen:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                  <li>Copia digital oficial del libro <em>&ldquo;Ama Lo Que Comes&rdquo;</em> (escrito por José Rengifo).</li>
                  <li>Acceso total a los 9 protocolos clínicos y catálogo de recetas de jugoterapia en alta resolución.</li>
                  <li>Calculadora interactiva de IMC con recomendaciones personalizadas.</li>
                  <li>Acceso multiplataforma: en la App móvil (Google Play / APK / App Store) y en la plataforma web sincronizada en tiempo real.</li>
                </ul>
                <p>
                  <strong>Procesamiento de pagos y pasarela PayPhone:</strong> Los pagos son recaudados de forma cifrada y segura a través de <strong>PayPhone</strong>, pasarela certificada internacionalmente bajo normativa PCI-DSS. Ni ALOEC ni sus servidores almacenan números completos de tarjetas de crédito o códigos CVV.
                </p>
                <p>
                  <strong>Moneda y cargos:</strong> Salvo indicación expresa en contrario, todos los precios están estipulados en <strong>Dólares de los Estados Unidos de América (USD)</strong> e incluyen los impuestos de ley según la jurisdicción aplicable.
                </p>
              </div>
            </section>

            {/* SECCIÓN 6 */}
            <section id="sec-6" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  6
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Política de Reembolsos y Devoluciones
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>Naturaleza del contenido digital inmediato:</strong> De conformidad con las legislaciones de comercio electrónico y protección al consumidor, los productos digitales (tales como libros electrónicos descargables y membresías de acceso inmediato a contenido premium) se consideran entregados y consumidos desde el momento en que se efectúa la activación de la cuenta o la descarga del material.
                </p>
                <p>
                  <strong>Causales admisibles de reembolso:</strong> ALOEC evaluará y procesará solicitudes de reembolso únicamente en los siguientes casos justificados:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                  <li>Cobros duplicados generados por error en la pasarela de pagos.</li>
                  <li>Imposibilidad técnica comprobada de acceso a la plataforma no resuelta por soporte en un plazo de 72 horas laborales tras el reporte.</li>
                </ul>
                <p>
                  Las solicitudes deben enviarse dentro de los <strong>3 días calendario</strong> posteriores a la compra a <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-700 font-bold hover:underline">soporte@alimentacionorganicaec.net</a> adjuntando el comprobante de PayPhone y el correo de usuario.
                </p>
              </div>
            </section>

            {/* SECCIÓN 7 */}
            <section id="sec-7" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  7
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Propiedad Intelectual y Derechos Reservados
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  Todos los elementos disponibles en la plataforma ALOEC —incluyendo sin limitación: textos del libro digital, formulaciones de recetas, fotografías originales de jugos, videos educativos, logotipos, interfaces de usuario, código fuente y bases de datos— son propiedad exclusiva de <strong>José Rengifo</strong> y <strong>WebFix Soluciones</strong>, y están protegidos por las leyes de propiedad intelectual y tratados internacionales de derechos de autor.
                </p>
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700">
                  <strong>Licencia limitada al Usuario:</strong> Se le otorga una licencia limitada, personal, no exclusiva, no sublicenciable e intransferible para visualizar y utilizar los contenidos en sus dispositivos para su propio bienestar. <strong>Queda expresamente prohibido:</strong> copiar, redistribuir, revender, alquilar, publicar en sitios web públicos, extraer mediante scraping o utilizar con fines comerciales los materiales de ALOEC sin autorización escrita previa.
                </div>
              </div>
            </section>

            {/* SECCIÓN 8 */}
            <section id="sec-8" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  8
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Sistema de Referidos y Bonificaciones
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  ALOEC cuenta con un programa de recomendación donde usuarios activos pueden compartir enlaces o códigos personalizados (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">?ref=...</code>):
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                  <li><strong>Uso ético y prohibición de spam:</strong> Está estrictamente prohibido difundir enlaces de referido mediante correos masivos no solicitados (spam), publicidad engañosa o creando cuentas ficticias para autobeneficiarse.</li>
                  <li><strong>Acreditación de recompensas:</strong> Las bonificaciones o comisiones se liquidarán conforme a las políticas vigentes publicadas en el panel de afiliados tras validar la efectiva confirmación de pago por parte del referido.</li>
                  <li><strong>Suspensión por fraude:</strong> Cualquier indicio de manipulación, uso de bots o falsedad conllevará la anulación inmediata de los saldos acumulados y la cancelación de la cuenta.</li>
                </ul>
              </div>
            </section>

            {/* SECCIÓN 9 */}
            <section id="sec-9" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  9
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Uso Aceptable y Prohibiciones
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>El Usuario se compromete a no incurrir en las siguientes conductas prohibidas:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
                  <li>Descompilar, realizar ingeniería inversa o intentar extraer el código fuente de la app o web.</li>
                  <li>Introducir virus, troyanos, gusanos o cualquier programa malicioso en los servidores de ALOEC.</li>
                  <li>Suplantar la identidad de otro usuario o registrar cuentas con correos electrónicos de terceros sin su consentimiento.</li>
                  <li>Utilizar mecanismos automatizados (bots, scrapers) para recopilar datos de la plataforma.</li>
                </ul>
              </div>
            </section>

            {/* SECCIÓN 10 */}
            <section id="sec-10" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  10
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Disponibilidad del Servicio y Actualizaciones
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Nos esforzamos por brindar una disponibilidad ininterrumpida de nuestros servicios las 24 horas del día. No obstante, el servicio puede experimentar interrupciones programadas por tareas de mantenimiento, mejoras técnicas, actualización de servidores o eventos de fuerza mayor ajenos a nuestro control. ALOEC se reserva el derecho de enriquecer, actualizar o modificar funcionalidades de la app para optimizar la experiencia de los usuarios.
              </p>
            </section>

            {/* SECCIÓN 11 */}
            <section id="sec-11" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  11
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Cancelación y Eliminación de Cuentas
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>Por voluntad del Usuario:</strong> Usted puede en cualquier momento dar por terminada su relación contractual y solicitar la eliminación total de su cuenta y registros de salud mediante nuestra sección oficial de <Link href="/eliminacion-de-datos" className="text-emerald-700 font-bold underline">Eliminación de Datos</Link> o enviando un correo a <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-700 font-bold hover:underline">soporte@alimentacionorganicaec.net</a>.
                </p>
                <p>
                  <strong>Por parte de ALOEC:</strong> Nos reservamos la facultad de suspender o cancelar de forma inmediata el acceso a cualquier Usuario que incumpla los presentes Términos, cometa actos fraudulentos o utilice la plataforma de manera perjudicial.
                </p>
              </div>
            </section>

            {/* SECCIÓN 12 */}
            <section id="sec-12" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  12
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Legislación Aplicable y Jurisdicción
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Estos Términos y Condiciones se rigen e interpretan en su totalidad bajo las leyes de la <strong>República del Ecuador</strong>, en particular la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos, la Ley Orgánica de Protección de Datos Personales y el Código Orgánico de la Economía Social de los Conocimientos. Para cualquier disputa que no pueda resolverse de forma amistosa en un plazo de 30 días, las partes se someten a la jurisdicción de los tribunales competentes de la República del Ecuador.
              </p>
            </section>

            {/* SECCIÓN 13 */}
            <section id="sec-13" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                  13
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Contacto y Canales de Soporte Oficial
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Si tiene dudas, observaciones o requiere asistencia sobre estos Términos y Condiciones, puede comunicarse con nosotros por cualquiera de los siguientes canales:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Correo Electrónico Oficial</span>
                  </div>
                  <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-700 font-bold hover:underline block pt-1">
                    soporte@alimentacionorganicaec.net
                  </a>
                  <p className="text-slate-500 text-[11px]">Respuesta regular en 24 a 48 horas laborables.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Sitio Web & Soporte en Línea</span>
                  </div>
                  <a href="https://app.alimentacionorganicaec.net" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline block pt-1">
                    app.alimentacionorganicaec.net
                  </a>
                  <p className="text-slate-500 text-[11px]">Plataforma y soporte técnico ALOEC.</p>
                </div>
              </div>
            </section>

          </main>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 border-t border-slate-800 print:hidden text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ALOEC Logo" className="h-8 w-auto object-contain brightness-90" />
            <p>© {new Date().getFullYear()} ALOEC — Alimentación Orgánica EC. Todos los derechos reservados.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/politicas-de-privacidad" className="hover:text-emerald-400 transition-colors">
              Políticas de Privacidad
            </Link>
            <Link href="/eliminacion-de-datos" className="hover:text-rose-400 transition-colors">
              Eliminación de Datos
            </Link>
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
