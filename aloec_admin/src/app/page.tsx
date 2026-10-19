'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '../lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
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
  Lock,
  RefreshCw,
  Flame,
  Calendar,
  Gift,
  X
} from 'lucide-react';

interface DynamicMembership {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features?: string[];
  isActive?: boolean;
}

// Google Play Official Store Button Component
function GooglePlayButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://play.google.com/store/apps/details?id=net.alimentacionorganica.aloec&hl=es_419"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-[#0a1112] hover:bg-[#3e9d51] text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-0.5 ${className}`}
    >
      <svg className="w-6 h-6 shrink-0 fill-white transition-transform group-hover:scale-105" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.609 1.814L13.792 12 3.61 22.186A2.404 2.404 0 0 1 3 20.575V3.425c0-.623.226-1.196.609-1.611zm1.484-.814L15.206 6.838 12.593 9.451 5.093 1zM5.093 23l7.5-8.451 2.613 2.613L5.093 23zm11.393-7.514l2.946-1.7c.947-.546.947-1.436 0-1.982l-2.946-1.7-2.353 2.691 2.353 2.691z"/>
      </svg>
      <span className="text-base sm:text-lg font-black tracking-tight text-white">Google Play</span>
    </a>
  );
}

// Android APK Download Button Component (Alternative Direct Download)
function AndroidAPKButton() {
  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-3 px-5 py-3 bg-[#3e9d51] hover:bg-[#348745] text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
    >
      <Download className="w-5 h-5 text-white transition-transform group-hover:translate-y-0.5 shrink-0" />
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-white/80">DESCARGA DIRECTA</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">Android APK</span>
      </div>
    </Link>
  );
}

// Apple App Store Badge Component (Triggers "Muy pronto en App Store" Popup)
function AppStoreButton({ onClick, className = "" }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-white hover:bg-[#0a1112] text-[#0a1112] hover:text-white border-2 border-[#0a1112] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer text-left transform hover:-translate-y-0.5 ${className}`}
    >
      <svg className="w-6 h-6 fill-current shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 384 512" aria-hidden="true">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 32.1 114.7c20.1 30.1 44.1 63.8 75.9 62.6 30.5-1.2 42.6-19.4 79.4-19.4 36.5 0 47.6 19.4 79.4 18.2 32.4-1.2 53.6-30.8 73.1-60.6 15.6-23.7 22.1-47.2 22.5-48.4-1.2-.6-43.7-17-43.7-61.9zM258.6 92.4c15.3-18.6 25.8-44.4 23-70.4-22.3 1-49.1 14.9-64.8 33.3-13.8 16.1-26 42.4-22.7 67.5 24.8 1.9 50-13 64.5-30.4z"/>
      </svg>
      <span className="text-base sm:text-lg font-black tracking-tight">App Store</span>
    </button>
  );
}

function LandingContent() {
  const searchParams = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);

  // App Store Modal State
  const [showAppStoreModal, setShowAppStoreModal] = useState<boolean>(false);

  // Dynamic Memberships State
  const [memberships, setMemberships] = useState<DynamicMembership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(true);

  // IMC Calculator State
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState<number>(168);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');
  const [recommendedProtocol, setRecommendedProtocol] = useState<string>('');

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

  // Load memberships dynamically from Firestore
  useEffect(() => {
    async function fetchMemberships() {
      try {
        setLoadingMemberships(true);
        const snap = await getDocs(collection(db, 'memberships'));
        const list: DynamicMembership[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.deletedAt && data.isActive !== false) {
            list.push({
              id: docSnap.id,
              name: data.name || 'Plan ALOEC',
              price: Number(data.price) || 0,
              durationDays: Number(data.durationDays) || 30,
              features: data.features || [],
              isActive: data.isActive,
            });
          }
        });
        // Sort by price ascending
        list.sort((a, b) => a.price - b.price);
        setMemberships(list);
      } catch (err) {
        console.error('Error loading memberships:', err);
      } finally {
        setLoadingMemberships(false);
      }
    }
    fetchMemberships();
  }, []);

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
      q: '¿Cómo funciona la oferta del Libro + la App ALOEC?',
      a: 'Al adquirir tu ejemplar del libro "Ama Lo Que Comes — Una Guía Segura al Bienestar" (por José Rengifo), obtienes de forma automatizada acceso completo e ilimitado a la App Móvil ALOEC para Android, iOS y Web con todos sus protocolos y videocursos.'
    },
    {
      q: '¿Qué contenido encontraré en la App ALOEC?',
      a: 'La aplicación complementa el libro con herramientas interactivas: Calculadora de IMC, 9 Protocolos Médicos personalizados por tu rango de salud, catálogo HD de más de 50 recetas de jugos verdes curativos, contador de racha/progreso diario y lecciones en video.'
    },
    {
      q: '¿Puedo comprar la suscripción a la App desde cualquier país?',
      a: '¡Sí! ALOEC es una plataforma global accesible desde cualquier lugar del mundo a través de las tiendas Google Play Store, Apple App Store o en la plataforma web app.alimentacionorganicaec.com con pagos seguros internacionalmente en PayPhone.'
    },
    {
      q: '¿Qué recetas y lecciones incluye el programa?',
      a: 'Incluye preparaciones paso a paso de jugos alcalinizantes (como el Jugo ZanaFruta y Verde Renovador), batidos proteicos, sopas vegetales y videocursos sobre la Terapia Gerson y desintoxicación hepática.'
    },
    {
      q: '¿Cómo funciona el Programa de Referidos?',
      a: 'Cada usuario registrado obtiene un enlace único como app.alimentacionorganicaec.com/?ref=TU_CODIGO. Al compartirlo con amigos o familiares, ganas beneficios de suscripción y recompensas por cada invitado.'
    }
  ];

  const defaultFeatures = [
    'Incluye el libro "Ama Lo Que Comes — Una Guía Segura al Bienestar".',
    'Acceso completo ilimitado a la Aplicación Móvil ALOEC (iOS/Android/Web).',
    'Calculadora Inteligente de IMC y diagnóstico biológico instantáneo.',
    'Acceso completo a los 9 protocolos médicos de jugoterapia.',
    'Catálogo HD de más de 50 jugos verdes y batidos curativos.',
    'Academia de Videocursos en HD (Terapia Gerson, Limpieza Digestiva).',
    'Recordatorios automáticos en tu smartphone y contador de racha diaria.'
  ];

  return (
    <div className="min-h-screen bg-white text-[#0a1112] font-sans selection:bg-[#3e9d51] selection:text-white">
      
      {/* ── Top Announcement Bar ────────────────────────────────────────────── */}
      <div className="bg-[#0a1112] text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-white/10">
        <span className="inline-flex items-center gap-1 bg-[#e2f859] text-[#0a1112] px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-black">
          LIBRO + APP
        </span>
        <span className="text-white/90">
          Adquiere el Libro <strong>"Ama Lo Que Comes"</strong> y obtén acceso total a la <strong>App ALOEC</strong>
        </span>
        {refCode && (
          <span className="hidden md:inline-flex items-center gap-1 bg-[#3e9d51] text-white px-2 py-0.5 rounded-full text-[11px] font-bold ml-2">
            Ref: {refCode}
          </span>
        )}
      </div>

      {/* ── Navigation Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ALOEC Logo" className="h-10 w-auto object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-[#0a1112]">
            <a href="#libro-app" className="hover:text-[#3e9d51] transition-colors">Libro + App</a>
            <a href="#beneficios" className="hover:text-[#3e9d51] transition-colors">Beneficios</a>
            <a href="#calculadora" className="hover:text-[#3e9d51] transition-colors flex items-center gap-1">
              <Calculator className="w-4 h-4 text-[#3e9d51]" /> Calculadora IMC
            </a>
            <a href="#recetas" className="hover:text-[#3e9d51] transition-colors">Jugos Verdes</a>
            <a href="#precios" className="hover:text-[#3e9d51] transition-colors">Planes & Ofertas</a>
            <a href="#faq" className="hover:text-[#3e9d51] transition-colors">Preguntas</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0a1112] hover:text-[#3e9d51] hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              <UserCheck className="w-3.5 h-3.5" /> Acceso Admin
            </Link>
            <a
              href="#precios"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3e9d51] hover:bg-[#348745] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-[#e2f859]" /> Comprar Libro + App
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Minimalist Fresh Style with #e2f859 and #0a1112) ──── */}
      <div className="bg-white">
        <section id="libro-app" className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-[#e2f859] rounded-b-[2.5rem] lg:rounded-b-[3.5rem]">
          <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0a1112] leading-[1.12]">
                  Transforma tu salud con el libro <span className="underline decoration-[#0a1112]/20 underline-offset-8">"Ama Lo Que Comes"</span> y la App ALOEC
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[#0a1112]/85 font-medium leading-relaxed max-w-xl">
                  Una plataforma integral de nutrición y medicina integrativa. Recetas de jugoterapia celular, calculadora biológica de IMC y 9 protocolos guiados día a día por José Rengifo.
                </p>

                {/* The Two Main Hero Buttons: Google Play & App Store */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <GooglePlayButton />
                  <AppStoreButton onClick={() => setShowAppStoreModal(true)} />
                </div>

                {/* Trust Row */}
                <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#0a1112] font-semibold">
                  <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-black/5 shadow-2xs">
                    🇪🇨 Atención y soporte en español
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-black/5 shadow-2xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <strong>4.9 / 5</strong> (+10,000 lectores y pacientes)
                  </span>
                </div>

              </div>

              {/* Hero Right Visual: Book Cover Clean */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-md lg:max-w-lg">
                  <img 
                    src="/book_hero.jpg" 
                    alt="Libro Ama Lo Que Comes y App ALOEC" 
                    className="w-full h-auto rounded-3xl shadow-2xl object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* ── Key Metrics Bar (Clean Minimalist Typography Without Icons or Dividers) ── */}
      <section className="bg-white text-[#0a1112] py-10 sm:py-14 border-b border-slate-200/80">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            
            {/* Metric 1 */}
            <div className="px-2 sm:px-4 space-y-1">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0a1112] tracking-tight">
                +10,000
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#0a1112]">
                Lectores y Pacientes
              </p>
              <p className="text-xs text-[#0a1112]/60 font-medium">
                Transformando su salud celular
              </p>
            </div>

            {/* Metric 2 */}
            <div className="px-2 sm:px-4 space-y-1">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#3e9d51] tracking-tight">
                +50
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#0a1112]">
                Recetas de Jugoterapia
              </p>
              <p className="text-xs text-[#0a1112]/60 font-medium">
                Fórmulas alcalinizantes con video HD
              </p>
            </div>

            {/* Metric 3 */}
            <div className="px-2 sm:px-4 space-y-1">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0a1112] tracking-tight">
                9
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#0a1112]">
                Protocolos según IMC
              </p>
              <p className="text-xs text-[#0a1112]/60 font-medium">
                Guías médicas personalizadas
              </p>
            </div>

            {/* Metric 4 */}
            <div className="px-2 sm:px-4 space-y-1">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#3e9d51] tracking-tight">
                100%
              </p>
              <p className="text-sm sm:text-base font-extrabold text-[#0a1112]">
                Orgánico e Internacional
              </p>
              <p className="text-xs text-[#0a1112]/60 font-medium">
                Medicina integrativa y respaldo
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Unified Section: IMC Calculator & App Experience ────────────────── */}
      <section id="calculadora" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4 space-y-10">
          
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-[#e2f859] text-[#0a1112] text-xs font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#3e9d51]" /> Diagnóstico Biológico & App ALOEC
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0a1112] sm:whitespace-nowrap">
              Calcula tu IMC y Conoce las Funciones de la App
            </h2>
            <p className="text-base sm:text-lg text-[#0a1112]/75 max-w-2xl mx-auto">
              Determina tu rango biológico al instante y descubre cómo la aplicación acompaña tu lectura con planes y hábitos diarios.
            </p>
          </div>

          {/* Interactive Calculator Card */}
          <div className="max-w-6xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg shadow-slate-200/50 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Inputs Column */}
            <div className="md:col-span-6 space-y-6">
              
              {/* Gender selector */}
              <div>
                <label className="text-sm font-bold text-[#0a1112] block mb-2">Género</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      gender === 'male' 
                        ? 'bg-[#3e9d51] text-white border-[#3e9d51] shadow-sm' 
                        : 'bg-slate-50 text-[#0a1112] border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ♂ Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      gender === 'female' 
                        ? 'bg-[#3e9d51] text-white border-[#3e9d51] shadow-sm' 
                        : 'bg-slate-50 text-[#0a1112] border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ♀ Femenino
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[#0a1112]">Estatura (cm)</label>
                  <span className="text-sm font-mono font-extrabold text-[#3e9d51]">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="210"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3e9d51]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[#0a1112]">Peso Actual (kg)</label>
                  <span className="text-sm font-mono font-extrabold text-[#3e9d51]">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3e9d51]"
                />
              </div>

              <div className="bg-[#e2f859]/30 p-3.5 rounded-xl border border-[#3e9d51]/20 text-xs text-[#0a1112] space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#3e9d51]">
                  <Sparkles className="w-3.5 h-3.5" /> Diagnóstico Automatizado
                </p>
                <p className="text-[#0a1112]/80 leading-relaxed text-[11px]">
                  El IMC orienta la selección de enzimas, antioxidantes e ingredientes verdes específicos para desbloquear tu metabolismo.
                </p>
              </div>
            </div>

            {/* Results Column */}
            <div className="md:col-span-6 bg-[#0a1112] text-white rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-[#3e9d51]/20 rounded-full blur-xl pointer-events-none"></div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#e2f859] font-black">Tu Resultado IMC</span>
                <p className="text-5xl font-black text-white mt-1 font-mono tracking-tight">{calculatedBmi ?? '--'}</p>
                <p className="text-sm font-bold text-[#0a1112] bg-[#e2f859] mt-2 px-3 py-1 rounded-full inline-block">
                  {bmiCategory}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 text-left">
                <p className="text-[11px] text-[#3e9d51] uppercase font-bold tracking-wider mb-1">Protocolo Sugerido por ALOEC:</p>
                <p className="text-sm font-bold text-white leading-snug">{recommendedProtocol}</p>
              </div>

              <a
                href="#precios"
                className="block w-full py-3.5 bg-[#3e9d51] hover:bg-[#348745] text-white font-extrabold text-sm rounded-xl shadow-md transition-all transform active:scale-95 text-center"
              >
                Obtener Mi Protocolo Completo →
              </a>
            </div>

          </div>

          {/* Compact Feature Highlights (Racha, Videocursos, Protocolos) */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-start gap-3.5 hover:border-[#3e9d51] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#3e9d51]/10 text-[#3e9d51] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#0a1112] uppercase tracking-wider">9 Protocolos Médicos</h4>
                <p className="text-xs text-[#0a1112]/70 leading-relaxed">
                  Asignados al instante según tu diagnóstico para desintoxicación, control de peso y salud celular.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-start gap-3.5 hover:border-[#3e9d51] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#e2f859] text-[#0a1112] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#0a1112] uppercase tracking-wider">Progreso & Racha</h4>
                <p className="text-xs text-[#0a1112]/70 leading-relaxed">
                  Registra tus hábitos diarios, cumplimiento semanal de jugos y evolución corporal en tu móvil.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-start gap-3.5 hover:border-[#3e9d51] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#0a1112] text-[#e2f859] flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#0a1112] uppercase tracking-wider">Videocursos en HD</h4>
                <p className="text-xs text-[#0a1112]/70 leading-relaxed">
                  Lecciones guiadas de nutrición, terapia Gerson y preparación correcta de cada jugo verde.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Visual Product Showcase (More Images, Less AI Noise) ─────────────── */}
      <section id="beneficios" className="py-20 bg-white border-b border-slate-200/80">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3.5 py-1.5 bg-[#e2f859] text-[#0a1112] text-xs font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#3e9d51]" /> Ecosistema ALOEC
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0a1112]">
              Tres pilares reales para tu salud celular
            </h2>
            <p className="text-base sm:text-lg text-[#0a1112]/70">
              Menos teoría, más herramientas prácticas: el libro físico/digital, la aplicación móvil interactiva y el recetario guiado en video.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1: El Libro */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden hover:border-[#3e9d51] transition-all group shadow-xs hover:shadow-lg flex flex-col justify-between">
              <div className="h-64 overflow-hidden bg-slate-900 relative">
                <img 
                  src="/book_hero.jpg" 
                  alt="Libro Ama Lo Que Comes" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-[#e2f859] text-[#0a1112] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  LIBRO OFICIAL
                </div>
              </div>
              <div className="p-7 space-y-3">
                <h3 className="text-xl font-black text-[#0a1112]">"Ama Lo Que Comes"</h3>
                <p className="text-xs font-bold text-[#3e9d51]">Por José Rengifo · Medicina Integrativa</p>
                <p className="text-sm text-[#0a1112]/75 leading-relaxed">
                  Comprende el origen real de la inflamación, la regeneración del hígado y la combinación biológica de alimentos sin dietas restrictivas ni fármacos innecesarios.
                </p>
              </div>
            </div>

            {/* Pillar 2: La App Móvil */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden hover:border-[#3e9d51] transition-all group shadow-xs hover:shadow-lg flex flex-col justify-between">
              <div className="h-64 bg-gradient-to-br from-[#0a1112] to-slate-900 p-6 flex flex-col justify-center items-center text-white relative">
                <div className="w-16 h-16 rounded-2xl bg-[#3e9d51] flex items-center justify-center text-white shadow-xl mb-3">
                  <Smartphone className="w-8 h-8" />
                </div>
                <p className="text-sm font-black text-white">App ALOEC en tu Celular</p>
                <p className="text-xs text-[#e2f859] font-semibold mt-1">Android · iOS · Plataforma Web</p>
                <div className="absolute top-4 left-4 bg-[#3e9d51] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  APP INCLUIDA
                </div>
              </div>
              <div className="p-7 space-y-3">
                <h3 className="text-xl font-black text-[#0a1112]">Herramientas en Tiempo Real</h3>
                <p className="text-xs font-bold text-[#3e9d51]">Diagnóstico, Protocolos & Racha</p>
                <p className="text-sm text-[#0a1112]/75 leading-relaxed">
                  Lleva tu diagnóstico biológico en el bolsillo, recibe notificaciones con los horarios de cada jugo y registra tus hábitos diarios con contador de progreso.
                </p>
              </div>
            </div>

            {/* Pillar 3: Recetas en Video */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden hover:border-[#3e9d51] transition-all group shadow-xs hover:shadow-lg flex flex-col justify-between">
              <div className="h-64 overflow-hidden bg-slate-900 relative">
                <img 
                  src="/juices/jugo-verde.jpg" 
                  alt="Recetas de Jugoterapia" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-[#0a1112] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  +50 RECETAS EN VIDEO
                </div>
              </div>
              <div className="p-7 space-y-3">
                <h3 className="text-xl font-black text-[#0a1112]">Jugoterapia & Videocursos</h3>
                <p className="text-xs font-bold text-[#3e9d51]">Alta Definición Paso a Paso</p>
                <p className="text-sm text-[#0a1112]/75 leading-relaxed">
                  Catálogo con más de 50 recetas curativas, batidos nutricionales, lecciones en video de la Terapia Gerson y preparación exacta de extractos alcalinizantes.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Juicing Catalog Preview ─────────────────────────────────────────── */}
      <section id="recetas" className="py-20 bg-white border-b border-slate-200/80">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="px-3 py-1 bg-[#e2f859] text-[#0a1112] text-xs font-black rounded-full uppercase tracking-wider">
                Recetario Terapéutico
              </span>
              <h2 className="text-3xl font-black text-[#0a1112] mt-2">Jugos Verdes Destacados</h2>
            </div>
            <a href="#precios" className="inline-flex items-center gap-2 text-[#3e9d51] font-bold text-sm hover:underline">
              Ver catálogo completo en la app <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Juice Card 1 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#3e9d51] hover:shadow-md transition-all group">
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img 
                  src="/juices/jugo-verde.jpg" 
                  alt="Jugo Verde Renovador" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="text-2xl font-black text-white drop-shadow-sm">Jugo Verde Renovador</h3>
                  <p className="text-xs text-[#e2f859] font-semibold mt-0.5">Alcaliniza e impulsa la digestión</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5 text-xs text-[#0a1112]/75">
                  <p className="font-black text-[#0a1112]">Ingredientes Principales:</p>
                  <p>• 1 Manzana verde + 2 ramas de Apio</p>
                  <p>• 1 manojo de Espinaca + 1 Pepino</p>
                  <p>• Zumo de 1 Limón fresco</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-[#3e9d51]">
                  <span>Dificultad: Fácil</span>
                  <span>Tiempo: 5 min</span>
                </div>
              </div>
            </div>

            {/* Juice Card 2 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#3e9d51] hover:shadow-md transition-all group">
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img 
                  src="/juices/jugo-zanahoria.jpg" 
                  alt="Jugo ZanaFruta" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="text-2xl font-black text-white drop-shadow-sm">Jugo ZanaFruta</h3>
                  <p className="text-xs text-[#e2f859] font-semibold mt-0.5">Rico en Betacarotenos y Antioxidantes</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5 text-xs text-[#0a1112]/75">
                  <p className="font-black text-[#0a1112]">Ingredientes Principales:</p>
                  <p>• 5 Zanahorias orgánicas</p>
                  <p>• 1 Manzana verde descorazonada</p>
                  <p>• 1 trozo de Jengibre fresco (1 cm)</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-[#3e9d51]">
                  <span>Dificultad: Fácil</span>
                  <span>Tiempo: 7 min</span>
                </div>
              </div>
            </div>

            {/* Juice Card 3 */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#3e9d51] hover:shadow-md transition-all group">
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img 
                  src="/juices/batido-quinua.jpg" 
                  alt="Batido Quinua Dorada" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="text-2xl font-black text-white drop-shadow-sm">Batido Quinua Dorada</h3>
                  <p className="text-xs text-[#e2f859] font-semibold mt-0.5">Proteína vegetal y fuerza celular</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5 text-xs text-[#0a1112]/75">
                  <p className="font-black text-[#0a1112]">Ingredientes Principales:</p>
                  <p>• Quinua cocida + Leche de almendras</p>
                  <p>• Cúrcuma + Pizca de pimienta negra</p>
                  <p>• 1 Cápsula de Hígado / Pancreatina</p>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-[#3e9d51]">
                  <span>Dificultad: Intermedio</span>
                  <span>Tiempo: 10 min</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Pricing / Memberships Section (Dynamic Firestore Plans) ─────────── */}
      <section id="precios" className="py-20 bg-[#0a1112] text-white relative">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3.5 py-1.5 bg-[#e2f859] text-[#0a1112] text-xs font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#3e9d51]" /> PLANES DISPONIBLES
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white whitespace-nowrap">
              Planes de Suscripción ALOEC
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Elige el plan ideal para adquirir el libro "Ama Lo Que Comes" y acceder a todas las herramientas de la app ALOEC.
            </p>
          </div>

          {/* Dynamic Memberships Grid */}
          {loadingMemberships ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex items-center gap-3 text-[#3e9d51] font-bold text-sm">
                <RefreshCw className="w-6 h-6 animate-spin" /> Cargando planes desde el sistema...
              </div>
            </div>
          ) : memberships.length > 0 ? (
            <div className={`grid grid-cols-1 ${memberships.length === 1 ? 'max-w-md mx-auto' : memberships.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3 max-w-6xl mx-auto'} gap-8 items-stretch`}>
              {memberships.map((m, idx) => (
                <div 
                  key={m.id}
                  className="bg-[#0a1112] border-2 border-[#3e9d51] hover:border-[#e2f859] rounded-3xl p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 group"
                >
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-[#e2f859] text-[#0a1112] font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-xs">
                      OFERTA RECOMENDADA
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="text-center space-y-3 pb-6 border-b border-white/10">
                      <h3 className="text-2xl font-extrabold text-white">{m.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-black text-white font-mono">${m.price.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-400">USD / {m.durationDays} días</span>
                      </div>
                      <p className="text-xs text-[#e2f859] font-medium">Incluye Libro + App ALOEC · Sin cargos ocultos</p>
                    </div>

                    <div className="space-y-3 text-sm text-slate-300">
                      {(m.features && m.features.length > 0 ? m.features : defaultFeatures).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#3e9d51] shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-300 leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-8 mt-6 border-t border-white/10">
                    <Link
                      href={`/checkout?plan=${m.id}`}
                      className="block w-full py-3.5 bg-[#3e9d51] hover:bg-[#348745] text-white font-black text-sm rounded-xl shadow-lg transition-all text-center transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-[#e2f859]" /> Comprar Libro + App ALOEC →
                    </Link>
                    <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Transacción internacional segura (PayPhone)
                    </p>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Fallback Card if no active membership documents exist yet */
            <div className="max-w-lg mx-auto bg-[#0a1112] border-2 border-[#3e9d51] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#e2f859] text-[#0a1112] font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-xs">
                OFERTA RECOMENDADA
              </div>
              
              <div className="text-center space-y-3 pb-6 border-b border-white/10">
                <h3 className="text-2xl font-extrabold text-white">Plan único</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-white font-mono">$49.99</span>
                  <span className="text-xs font-bold text-slate-400">USD / 3000 días</span>
                </div>
                <p className="text-xs text-[#e2f859] font-medium">Incluye Libro + App ALOEC · Sin cargos ocultos</p>
              </div>

              <div className="py-8 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3e9d51] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Acceso ilimitado a jugos y recetas</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3e9d51] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Todos los protocolos de salud</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3e9d51] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Notificaciones de horarios</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3e9d51] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Manual de Jugos Verdes</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#3e9d51] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Video Tutoriales</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Link
                  href="/checkout?plan=plan-nico"
                  className="block w-full py-4 bg-[#3e9d51] hover:bg-[#348745] text-white font-black text-base rounded-xl shadow-lg transition-all text-center transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5 text-[#e2f859]" /> Adquirir Libro + App ALOEC →
                </Link>
                <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Transacción encriptada a través de PayPhone
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── App Downloads Section ───────────────────────────────────────────── */}
      <section id="download" className="py-20 bg-[#0a1112] border-t border-white/10 text-white relative overflow-hidden">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4 text-center space-y-8 relative z-10">
          
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="px-3.5 py-1.5 bg-[#e2f859] text-[#0a1112] text-xs font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              INSTALA LA APLICACIÓN
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight sm:whitespace-nowrap">
              Descarga la App ALOEC
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Acompaña la lectura del libro "Ama Lo Que Comes" con la app oficial. Disponible globalmente para Android e iOS.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <GooglePlayButton />
            <AppStoreButton onClick={() => setShowAppStoreModal(true)} />
          </div>

          <div className="pt-6">
            <p className="text-xs text-slate-400">
              ¿Prefieres usar la versión web? Visita <strong className="underline text-[#e2f859]">app.alimentacionorganicaec.com</strong> desde cualquier navegador.
            </p>
          </div>

        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4">
            <span className="px-3.5 py-1.5 bg-[#e2f859] text-[#0a1112] text-xs font-black rounded-full uppercase tracking-wider">
              Resuelve tus dudas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0a1112]">Preguntas Frecuentes</h2>
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
                    className="w-full p-6 text-left font-bold text-[#0a1112] flex justify-between items-center gap-4 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#3e9d51] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-[#0a1112]/75 leading-relaxed border-t border-slate-200/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Footer: Brevo Style for ALOEC in Black ───────────────────────────── */}
      <footer className="bg-black text-neutral-400 font-sans border-t border-neutral-900 pt-16 pb-12">
        <div className="w-[90%] max-w-[1600px] mx-auto px-2 sm:px-4">
          
          {/* Top Row: Logo on Left, Social Icons on Right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-12 border-b border-neutral-800/80">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-white p-1.5 rounded-xl inline-flex items-center shadow-sm">
                <img src="/logo.png" alt="ALOEC Logo" className="h-7 w-auto object-contain" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                ALOEC<span className="text-[#3e9d51]">.</span>
              </span>
            </Link>

            {/* Social Icons row (X, LinkedIn, Instagram, YouTube, Facebook, TikTok) */}
            <div className="flex items-center gap-4 text-neutral-400">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:text-white hover:scale-110 transition-all p-1">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white hover:scale-110 transition-all p-1">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white hover:scale-110 transition-all p-1">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-white hover:scale-110 transition-all p-1">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white hover:scale-110 transition-all p-1">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-white hover:scale-110 transition-all p-1">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.25-1.54 3.25-3.35V.02z"/></svg>
              </a>
            </div>
          </div>

          {/* Middle Row: 5 Columns (PRODUCTO, PARA EMPEZAR, RECURSOS, PARTNERS, EMPRESA) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 py-12 text-[13px]">
            
            {/* Col 1: PRODUCTO */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">PRODUCTO</h3>
              <ul className="space-y-2.5">
                <li>
                  <a 
                    href="https://play.google.com/store/apps/details?id=net.alimentacionorganica.aloec&hl=es_419"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3e9d51] transition-colors inline-flex items-center gap-1.5"
                  >
                    App Android (Google Play)
                    <ExternalLink className="w-2.5 h-2.5 text-neutral-600" />
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowAppStoreModal(true)}
                    className="hover:text-[#3e9d51] transition-colors text-left"
                  >
                    App iOS (App Store)
                  </button>
                </li>
                <li>
                  <a href="/appaloecv16.apk" download="appaloecv16.apk" className="hover:text-[#3e9d51] transition-colors">
                    Descarga APK Directo (v16)
                  </a>
                </li>
                <li>
                  <a href="https://app.alimentacionorganicaec.com" className="hover:text-[#3e9d51] transition-colors">
                    Plataforma Web ALOEC
                  </a>
                </li>
                <li>
                  <a href="#calculadora" className="hover:text-[#3e9d51] transition-colors">
                    Calculadora de IMC
                  </a>
                </li>
                <li>
                  <a href="#recetas" className="hover:text-[#3e9d51] transition-colors">
                    Catálogo de Jugoterapia
                  </a>
                </li>
                <li>
                  <a href="#protocolos" className="hover:text-[#3e9d51] transition-colors">
                    9 Protocolos Médicos
                  </a>
                </li>
                <li>
                  <a href="#precios" className="hover:text-[#3e9d51] transition-colors">
                    Planes & Membresías
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 2: PARA EMPEZAR */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">PARA EMPEZAR</h3>
              <ul className="space-y-2.5">
                <li>
                  <a href="#libro-app" className="hover:text-[#3e9d51] transition-colors">
                    Libro "Ama Lo Que Comes"
                  </a>
                </li>
                <li>
                  <a href="#libro-app" className="hover:text-[#3e9d51] transition-colors">
                    Autor José Rengifo
                  </a>
                </li>
                <li>
                  <a href="#beneficios" className="hover:text-[#3e9d51] transition-colors">
                    Nutrición Basada en Plantas
                  </a>
                </li>
                <li>
                  <a href="#beneficios" className="hover:text-[#3e9d51] transition-colors">
                    Beneficios del Jugo Verde
                  </a>
                </li>
                <li>
                  <a href="#calculadora" className="hover:text-[#3e9d51] transition-colors">
                    Diagnóstico Nutricional
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#3e9d51] transition-colors">
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#3e9d51] transition-colors">
                    Crear Cuenta Gratuita
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: RECURSOS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">RECURSOS</h3>
              <ul className="space-y-2.5">
                <li>
                  <a href="#calculadora" className="hover:text-[#3e9d51] transition-colors">
                    Calculadora IMC Online
                  </a>
                </li>
                <li>
                  <a href="#recetas" className="hover:text-[#3e9d51] transition-colors">
                    Biblioteca de Jugoterapia
                  </a>
                </li>
                <li>
                  <a href="#protocolos" className="hover:text-[#3e9d51] transition-colors">
                    Protocolos Clínicos
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#3e9d51] transition-colors">
                    Guía de Ayuno y Jugos
                  </a>
                </li>
                <li>
                  <a href="mailto:soporte@alimentacionorganicaec.net" className="hover:text-[#3e9d51] transition-colors">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <span className="text-neutral-500 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3e9d51]"></span>
                    Estado Operativo 99.9%
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 4: PARTNERS */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">PARTNERS</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/referral" className="hover:text-[#3e9d51] transition-colors">
                    Programa de Referidos
                  </Link>
                </li>
                <li>
                  <Link href="/referral" className="hover:text-[#3e9d51] transition-colors">
                    Portal de Afiliados
                  </Link>
                </li>
                <li>
                  <Link href="/referral" className="hover:text-[#3e9d51] transition-colors">
                    Ganar Comisiones
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-[#3e9d51] transition-colors">
                    Generar Código de Invitación
                  </Link>
                </li>
                <li>
                  <a href="mailto:soporte@alimentacionorganicaec.net" className="hover:text-[#3e9d51] transition-colors">
                    Soporte para Socios
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 5: EMPRESA */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">EMPRESA</h3>
              <ul className="space-y-2.5">
                <li>
                  <a href="#libro-app" className="hover:text-[#3e9d51] transition-colors">
                    Sobre ALOEC
                  </a>
                </li>
                <li>
                  <a href="https://webfixsoluciones.net" target="_blank" rel="noopener noreferrer" className="hover:text-[#3e9d51] transition-colors inline-flex items-center gap-1">
                    WebFix Soluciones
                    <ExternalLink className="w-2.5 h-2.5 text-neutral-600" />
                  </a>
                </li>
                <li>
                  <Link href="/terminos-y-condiciones" className="hover:text-[#3e9d51] transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/politicas-de-privacidad" className="hover:text-[#3e9d51] transition-colors">
                    Políticas de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/eliminacion-de-datos" className="hover:text-rose-400 transition-colors">
                    Eliminación de Datos
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#3e9d51] transition-colors inline-flex items-center gap-1 text-slate-300">
                    <Lock className="w-3 h-3 text-[#3e9d51]" /> Acceso Administrativo
                  </Link>
                </li>
                <li>
                  <a href="mailto:soporte@alimentacionorganicaec.net" className="hover:text-[#3e9d51] transition-colors">
                    Contacto y Soporte
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Horizontal Divider Rule */}
          <div className="border-t border-neutral-800/80 my-8"></div>

          {/* Bottom Bar: Horizontally Spread Legal Links & Copyright (exact Brevo layout) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="text-neutral-500">Cookies</span>
              <Link href="/politicas-de-privacidad" className="hover:text-white transition-colors">
                Política Anti-Spam
              </Link>
              <Link href="/politicas-de-privacidad" className="hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">
                Términos y condiciones
              </Link>
              <Link href="/terminos-y-condiciones#sec-3" className="hover:text-white transition-colors">
                Aviso legal
              </Link>
              <Link href="/eliminacion-de-datos" className="hover:text-rose-400 transition-colors">
                Eliminación de datos
              </Link>
            </div>

            <div className="text-neutral-400 whitespace-nowrap">
              © ALOEC {new Date().getFullYear()}. Todos los derechos reservados.
            </div>
          </div>

        </div>
      </footer>

      {/* ── App Store Coming Soon Modal ────────────────────────────────────── */}
      {showAppStoreModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1112]/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAppStoreModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAppStoreModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#0a1112] hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-[#0a1112] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-black/20">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 32.1 114.7c20.1 30.1 44.1 63.8 75.9 62.6 30.5-1.2 42.6-19.4 79.4-19.4 36.5 0 47.6 19.4 79.4 18.2 32.4-1.2 53.6-30.8 73.1-60.6 15.6-23.7 22.1-47.2 22.5-48.4-1.2-.6-43.7-17-43.7-61.9zM258.6 92.4c15.3-18.6 25.8-44.4 23-70.4-22.3 1-49.1 14.9-64.8 33.3-13.8 16.1-26 42.4-22.7 67.5 24.8 1.9 50-13 64.5-30.4z"/>
              </svg>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-[#e2f859] text-[#0a1112] text-xs font-black rounded-full uppercase tracking-wider">
                Próximamente
              </span>
              <h3 className="text-2xl font-black text-[#0a1112]">
                ¡Muy pronto en App Store!
              </h3>
              <p className="text-sm text-[#0a1112]/75 leading-relaxed">
                Estamos finalizando el proceso de publicación con Apple. Muy pronto podrás descargar la aplicación oficial de <strong>ALOEC</strong> en tu iPhone o iPad.
              </p>
            </div>

            <div className="p-4 bg-[#3e9d51]/10 rounded-2xl border border-[#3e9d51]/20 text-left space-y-1">
              <p className="text-xs font-bold text-[#0a1112]">
                ¿Tienes un dispositivo Android o deseas usar la versión Web?
              </p>
              <p className="text-xs text-[#0a1112]/80">
                Ya puedes instalar ALOEC desde <strong>Google Play Store</strong> o ingresar a la plataforma web directamente.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="https://play.google.com/store/apps/details?id=net.alimentacionorganica.aloec&hl=es_419"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#3e9d51] hover:bg-[#348745] text-white font-black text-sm rounded-xl shadow-md transition-colors"
              >
                Ver en Google Play Store →
              </a>
              <button
                type="button"
                onClick={() => setShowAppStoreModal(false)}
                className="w-full px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-[#0a1112] hover:bg-slate-100 rounded-xl transition-colors"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
