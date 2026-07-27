'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  Play, 
  HeartPulse, 
  Droplet, 
  BookOpen, 
  Bell, 
  Award, 
  ChevronDown, 
  Globe, 
  Star, 
  Zap, 
  Check, 
  Share2, 
  Calculator,
  Activity,
  Layers,
  Users,
  Download,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Lock
} from 'lucide-react';

// Google Play Badge Component
function GooglePlayButton({ href = "#download" }: { href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 shadow-md hover:shadow-lg transition-all duration-200 group"
    >
      <svg className="w-7 h-7 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 512 512">
        <path fill="#410593" d="M325.8 244.6L79.7 490.7c-7.9-5-12.7-13.7-12.7-23.7V45c0-10 4.8-18.7 12.7-23.7l246.1 223.3z"/>
        <path fill="#00E676" d="M386.4 300.2l-60.6-55.6 60.6-55.6 68.3 38.9c19.5 11.1 19.5 29.2 0 40.3l-68.3 32z"/>
        <path fill="#FF3D00" d="M79.7 21.3L325.8 244.6l60.6-55.6-267.8-152.6c-12-6.8-26.3-5-38.9 4.9z"/>
        <path fill="#FFC107" d="M79.7 490.7l246.1-223.3 60.6 55.6-267.8 152.6c-12 6.8-26.3 5-38.9-4.9z"/>
      </svg>
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">DISPONIBLE EN</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">Google Play</span>
      </div>
    </a>
  );
}

// Apple App Store Badge Component
function AppStoreButton({ href = "#download" }: { href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 shadow-md hover:shadow-lg transition-all duration-200 group"
    >
      <svg className="w-7 h-7 fill-current shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 384 512">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 32.1 114.7c20.1 30.1 44.1 63.8 75.9 62.6 30.5-1.2 42.6-19.4 79.4-19.4 36.5 0 47.6 19.4 79.4 18.2 32.4-1.2 53.6-30.8 73.1-60.6 15.6-23.7 22.1-47.2 22.5-48.4-1.2-.6-43.7-17-43.7-61.9zM258.6 92.4c15.3-18.6 25.8-44.4 23-70.4-22.3 1-49.1 14.9-64.8 33.3-13.8 16.1-26 42.4-22.7 67.5 24.8 1.9 50-13 64.5-30.4z"/>
      </svg>
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">CONSIGUELO EN EL</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">App Store</span>
      </div>
    </a>
  );
}

function LandingContent() {
  const searchParams = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);

  // IMC Calculator State
  const [heightCm, setHeightCm] = useState<number>(168);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [recommendedProtocol, setRecommendedProtocol] = useState<string>('');

  // Active showcase tab
  const [activeTab, setActiveTab] = useState<number>(0);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const code = searchParams.get('ref');
    if (code) {
      setRefCode(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aloec_ref_code', code);
      }
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aloec_ref_code');
      if (stored) setRefCode(stored);
    }
  }, [searchParams]);

  // Handle live BMI calculation
  useEffect(() => {
    if (heightCm > 0 && weightKg > 0) {
      const hM = heightCm / 100;
      const bmi = parseFloat((weightKg / (hM * hM)).toFixed(1));
      setCalculatedBmi(bmi);

      if (bmi < 18.5) {
        setBmiCategory('Bajo Peso');
        setRecommendedProtocol('Protocolo de Nutrición Celular y Recuperación Vital');
      } else if (bmi >= 18.5 && bmi < 25) {
        setBmiCategory('Peso Saludable (Normal)');
        setRecommendedProtocol('Protocolo de Mantenimiento y Vitalidad Diaria');
      } else if (bmi >= 25 && bmi < 30) {
        setBmiCategory('Sobrepeso Leve / Moderado');
        setRecommendedProtocol('Protocolo para Pérdida de Peso y Limpieza Digestiva');
      } else if (bmi >= 30 && bmi < 35) {
        setBmiCategory('Obesidad Grado I');
        setRecommendedProtocol('Protocolo Intensivo Antiinflamatorio y Desintoxicación Hepática');
      } else {
        setBmiCategory('Obesidad Grado II / Severa');
        setRecommendedProtocol('Protocolo Metabólico Integral y Terapia Gerson');
      }
    }
  }, [heightCm, weightKg]);

  const faqs = [
    {
      q: '¿Qué es la aplicación ALOEC y cómo me ayuda?',
      a: 'ALOEC (Alimentación Orgánica Ecuador) es la plataforma móvil de salud holística que te guía paso a paso en la sanación mediante jugoterapia orgánica. Calcula tu IMC, te asigna un protocolo médico natural personalizado y te brinda acceso a recetas curativas, videocursos y alarmas de consumo.'
    },
    {
      q: '¿Cómo funciona la suscripción del Plan Único de $2.00 USD?',
      a: 'Por un único pago de $2.00 USD obtienes acceso completo a todas las funcionalidades premium de la app por 30 días: diagnósticos de IMC, protocolos detallados, videocursos HD y recordatorios automáticos sin cobros ocultos.'
    },
    {
      q: '¿Puedo usar la aplicación en mi teléfono Android e iPhone?',
      a: '¡Sí! ALOEC está optimizada para smartphones Android e iOS, y también puedes acceder a tus planes y hacer tu checkout desde cualquier navegador web en app.alimentacionorganicaec.com.'
    },
    {
      q: '¿Qué ingredientes se utilizan en las recetas de los jugos?',
      a: 'Todas las recetas están diseñadas con frutas, verduras y superalimentos 100% naturales y fáciles de conseguir en los mercados y ferias de Ecuador (manzana verde, zanahoria, espinaca, apio, jengibre, aloe vera, etc.).'
    },
    {
      q: '¿Cómo funciona el Programa de Referidos?',
      a: 'Cada usuario registrado obtiene un enlace único como app.alimentacionorganicaec.com/?ref=TU_CODIGO. Al compartirlo con amigos y familiares, acumulas recompensas y meses gratis de suscripción cuando tus referidos se unan.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── Top Announcement Bar ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 text-white px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-sm">
        <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Nuevo
        </span>
        <span>App ALOEC v1.4 disponible en <strong>app.alimentacionorganicaec.com</strong></span>
        {refCode && (
          <span className="hidden md:inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold ml-2">
            🎁 Ref: {refCode}
          </span>
        )}
      </div>

      {/* ── Navigation Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="ALOEC Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">ALOEC</span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Alimentación Orgánica EC</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#beneficios" className="hover:text-emerald-700 transition-colors">Beneficios</a>
            <a href="#calculadora" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
              <Calculator className="w-4 h-4 text-emerald-600" /> Calculadora IMC
            </a>
            <a href="#recetas" className="hover:text-emerald-700 transition-colors">Jugos Verdes</a>
            <a href="#precios" className="hover:text-emerald-700 transition-colors">Plan Único ($2.00)</a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors">Preguntas</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <UserCheck className="w-3.5 h-3.5" /> Acceso Admin
            </Link>
            <a
              href="#precios"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-600/20 transition-all transform active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> Empezar por $2.00
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Domain & Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/80 border border-emerald-300/60 rounded-full text-emerald-800 text-xs font-bold shadow-xs">
                <Globe className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span>Plataforma Oficial: <strong>app.alimentacionorganicaec.com</strong></span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Sanación Natural con <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-500">Jugoterapia Orgánica</span> en Ecuador.
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Calcula tu IMC, recibe un protocolo médico personalizado de desintoxicación y accede a más de 50+ recetas de jugos curativos, videocursos y recordatorios automáticos en tu celular.
              </p>

              {/* Download Buttons & CTA Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <GooglePlayButton href="#download" />
                <AppStoreButton href="#download" />
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pago 100% Seguro (PayPhone)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>4.9 / 5 Valoración en Ecuador</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sin permanencia ni contratos</span>
                </div>
              </div>

            </div>

            {/* Hero Right Visual Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                
                {/* Decorative glow background */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500 to-green-300 rounded-[3rem] blur-2xl opacity-40 animate-pulse"></div>

                {/* Smartphone Mockup */}
                <div className="relative bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-slate-800">
                  
                  {/* Speaker notch */}
                  <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
                  </div>

                  {/* Phone Screen Frame */}
                  <div className="bg-slate-50 rounded-[1.8rem] overflow-hidden p-4 space-y-4 text-left border border-slate-200">
                    
                    {/* App Header Mock */}
                    <div className="flex justify-between items-center bg-emerald-700 text-white p-3.5 rounded-xl shadow-xs">
                      <div>
                        <p className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">PROTOCOLO ACTIVO</p>
                        <p className="text-xs font-bold">Desintoxicación Hepática</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-800 text-emerald-100 text-[10px] font-extrabold rounded-md">
                        IMC: 26.4
                      </span>
                    </div>

                    {/* Today's Juicing Schedule Mock */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Horario de Jugos del Día</p>
                      
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 shrink-0">
                          <Droplet className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">08:00 AM</span>
                          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">Jugo Verde Renovador</p>
                          <p className="text-[10px] text-slate-500 truncate">Manzana verde, apio, espinaca y pepino</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 shrink-0">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">11:00 AM</span>
                          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">Batido Quinua Dorada</p>
                          <p className="text-[10px] text-slate-500 truncate">Cápsula de hígado + pancreatina</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0"></div>
                      </div>
                    </div>

                    {/* Featured Video Course Card Mock */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-xl shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded uppercase">CURSO DESTACADO</span>
                          <p className="text-xs font-bold mt-1">Terapia Gerson en Ecuador</p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Floating App CTA */}
                    <div className="pt-1 text-center">
                      <a href="#precios" className="block w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-colors">
                        🔔 Activar Recordatorios Diarios
                      </a>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Key Metrics Bar ──────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-10 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">+10,000</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Pacientes Beneficiados</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">+50</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Recetas Terapéuticas</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">9</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Protocolos según IMC</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-400">$2.00</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Suscripción Accesible</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Live IMC Calculator ─────────────────────────────────── */}
      <section id="calculadora" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-700" /> Diagnóstico Biológico en Vivo
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Calcula tu Índice de Masa Corporal (IMC)
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Descubre qué protocolo médico de jugoterapia orgánica necesita tu organismo hoy mismo.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Inputs Column */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800">Estatura (cm)</label>
                  <span className="text-sm font-mono font-extrabold text-emerald-700">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="210"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-800">Peso Actual (kg)</label>
                  <span className="text-sm font-mono font-extrabold text-emerald-700">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">📌 ¿Sabías que?</p>
                <p>El índice de masa corporal orienta la selección de enzimas, antioxidantes e ingredientes verdes específicos para desbloquear tu metabolismo.</p>
              </div>
            </div>

            {/* Results Column */}
            <div className="md:col-span-6 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Tu Resultado IMC</span>
                <p className="text-5xl font-black text-white mt-1 font-mono tracking-tight">{calculatedBmi ?? '--'}</p>
                <p className="text-sm font-bold text-amber-300 mt-2 px-3 py-1 bg-white/10 rounded-full inline-block">
                  {bmiCategory}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 text-left">
                <p className="text-[11px] text-emerald-300 uppercase font-bold tracking-wider mb-1">Protocolo Sugerido por ALOEC:</p>
                <p className="text-sm font-bold text-white leading-snug">{recommendedProtocol}</p>
              </div>

              <a
                href="#precios"
                className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all transform active:scale-95 text-center"
              >
                Obtener Mi Protocolo Completo →
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ── Feature Pillars (Flat Modern Grid) ──────────────────────────────── */}
      <section id="beneficios" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" /> Todo en una sola aplicación
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Diseñada para transformar tu alimentación y estilo de vida
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Combina el conocimiento ancestral del naturismo con tecnología móvil avanzada para acompañarte diariamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplet className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Recetario Terapéutico HD</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accede a más de 50 recetas detalladas de jugos verdes curativos, batidos nutricionales y sopas vegetales con ingredientes orgánicos de Ecuador.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Protocolos Médicos por IMC</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recibe guías específicas según tu rango corporal para desintoxicación hepática, control metabólico, enemas de café y terapia Gerson.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Videocursos & Lecciones</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Academia en video dictada por profesionales para aprender las bases de la medicina integrativa, limpieza digestiva y hábitos saludables.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Recordatorios Inteligentes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Notificaciones automáticas en tu celular para consumir cada jugo y cápsula a la hora exacta definida por tu protocolo de salud.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Programa de Referidos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comparte tu enlace personalizado <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-emerald-700 font-bold">app.alimentacionorganicaec.com</code> y gana meses gratis por cada invitado.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Soporte Directo & Checkout Web</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Realiza tus pagos de forma 100% segura mediante PayPhone con tarjetas de débito o crédito directamente desde la app o web.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── Juicing Catalog Preview ─────────────────────────────────────────── */}
      <section id="recetas" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                Recetario Terapéutico
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">Jugos Verdes Destacados</h2>
            </div>
            <a href="#precios" className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm hover:underline">
              Ver catálogo completo en la app <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Juice Card 1 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-48 bg-gradient-to-br from-emerald-600 to-green-500 p-6 flex flex-col justify-between text-white relative">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold w-max">
                  🌿 ALOEC-J01 · Desintoxicante
                </span>
                <div>
                  <h3 className="text-2xl font-black">Jugo Verde Renovador</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">Alcaliniza e impulsa la digestión</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="font-bold text-slate-800">Ingredientes Principales:</p>
                  <p>• 1 Manzana verde + 2 ramas de Apio</p>
                  <p>• 1 manojo de Espinaca + 1 Pepino</p>
                  <p>• Zumo de 1 Limón fresco</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-emerald-700">
                  <span>Dificultad: Fácil</span>
                  <span>Tiempo: 5 min</span>
                </div>
              </div>
            </div>

            {/* Juice Card 2 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-48 bg-gradient-to-br from-amber-600 to-orange-500 p-6 flex flex-col justify-between text-white relative">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold w-max">
                  🥕 ALOEC-J02 · Hepático
                </span>
                <div>
                  <h3 className="text-2xl font-black">Jugo de Zanahoria & Manzana</h3>
                  <p className="text-xs text-amber-100 mt-0.5">Rico en Betacarotenos y Antioxidantes</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="font-bold text-slate-800">Ingredientes Principales:</p>
                  <p>• 5 Zanahorias orgánicas</p>
                  <p>• 1 Manzana verde descorazonada</p>
                  <p>• 1 trozo de Jengibre fresco (1 cm)</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-amber-700">
                  <span>Dificultad: Fácil</span>
                  <span>Tiempo: 7 min</span>
                </div>
              </div>
            </div>

            {/* Juice Card 3 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all">
              <div className="h-48 bg-gradient-to-br from-teal-700 to-emerald-600 p-6 flex flex-col justify-between text-white relative">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold w-max">
                  🌱 ALOEC-J03 · Antiinflamatorio
                </span>
                <div>
                  <h3 className="text-2xl font-black">Batido Quinua Dorada</h3>
                  <p className="text-xs text-teal-100 mt-0.5">Proteína vegetal y fuerza celular</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="font-bold text-slate-800">Ingredientes Principales:</p>
                  <p>• Quinua cocida + Leche de almendras</p>
                  <p>• Cúrcuma + Pizca de pimienta negra</p>
                  <p>• 1 Cápsula de Hígado / Pancreatina</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-teal-700">
                  <span>Dificultad: Intermedio</span>
                  <span>Tiempo: 10 min</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Pricing Section (Plan Único $2.00 USD) ─────────────────────────── */}
      <section id="precios" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" /> Precio Accesible para Todos
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Invierte en tu salud por solo $2.00 USD
            </h2>
            <p className="text-base sm:text-lg text-slate-400">
              Acceso total e ilimitado a todas las herramientas de la app ALOEC en tu smartphone.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Ribbon */}
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-xs">
              MÁS POPULAR
            </div>

            <div className="text-center space-y-4 pb-8 border-b border-slate-800">
              <h3 className="text-2xl font-extrabold text-white">Plan Único ALOEC</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-black text-white font-mono">$2.00</span>
                <span className="text-sm font-bold text-slate-400">USD / mes</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium">Cancelación en cualquier momento · Sin cargos sorpresa</p>
            </div>

            <div className="py-8 space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Calculadora Inteligente de IMC y diagnóstico instantáneo.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Acceso completo a los 9 protocolos médicos de jugoterapia.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Catálogo HD de más de 50 jugos verdes y batidos curativos.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Videocursos de la Terapia Gerson y salud integrativa.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Alarmas y recordatorios diarios automatizados en tu smartphone.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Enlace de referidos personal para ganar beneficios adicionales.</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Link
                href="/checkout?plan=plan-nico"
                className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl shadow-lg transition-all text-center transform active:scale-95"
              >
                Suscribirme Ahora por $2.00 USD →
              </Link>
              <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Transacción encriptada a través de PayPhone
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── App Downloads Section ───────────────────────────────────────────── */}
      <section id="download" className="py-20 bg-emerald-700 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Descarga la App ALOEC en tu smartphone
            </h2>
            <p className="text-lg text-emerald-100">
              Lleva tu salud al siguiente nivel. Disponible para Android e iOS en Ecuador.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <GooglePlayButton href="#download" />
            <AppStoreButton href="#download" />
          </div>

          <div className="pt-6">
            <p className="text-xs text-emerald-200">
              ¿Prefieres usar la versión web? Visita <strong className="underline">app.alimentacionorganicaec.com</strong> desde cualquier navegador.
            </p>
          </div>

        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4">
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
              Resuelve tus dudas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left font-bold text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="ALOEC Logo" className="h-8 w-auto brightness-200" />
                <span className="font-extrabold text-white text-base">ALOEC</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Alimentación Orgánica Ecuador. Promoviendo la salud natural y la jugoterapia científica.
              </p>
              <p className="text-emerald-400 font-mono font-bold">
                app.alimentacionorganicaec.com
              </p>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Navegación</p>
              <ul className="space-y-2">
                <li><a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a></li>
                <li><a href="#calculadora" className="hover:text-white transition-colors">Calculadora IMC</a></li>
                <li><a href="#recetas" className="hover:text-white transition-colors">Jugos Verdes</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Plan Único $2.00</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Descargas & Web</p>
              <ul className="space-y-2">
                <li><a href="#download" className="hover:text-white transition-colors">Google Play Store</a></li>
                <li><a href="#download" className="hover:text-white transition-colors">Apple App Store</a></li>
                <li><a href="https://app.alimentacionorganicaec.com" className="hover:text-white transition-colors">Plataforma Web</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Administración</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
                    Acceso Panel Administrativo <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li><span className="text-slate-600">Soporte: soporte@aloec.com</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} ALOEC — Todos los derechos reservados.</p>
            <p>
              Desarrollado con excelencia por{' '}
              <a
                href="https://webfixsoluciones.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-bold"
              >
                Web Fix Soluciones
              </a>
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default function SalesLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
        Cargando ALOEC...
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}
