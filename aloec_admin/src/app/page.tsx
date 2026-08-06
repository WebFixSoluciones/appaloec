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
  Gift
} from 'lucide-react';

interface DynamicMembership {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features?: string[];
  isActive?: boolean;
}

// Android APK Download Button Component
function AndroidAPKButton() {
  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-3 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border border-emerald-500/50 shadow-md hover:shadow-lg transition-all duration-200 group"
    >
      <Download className="w-6 h-6 text-emerald-100 transition-transform group-hover:translate-y-0.5 shrink-0" />
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-200">DESCARGA DIRECTA</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">Android APK (v16)</span>
      </div>
    </Link>
  );
}

// Apple App Store Badge Component
function AppStoreButton({ href = "/register" }: { href?: string }) {
  return (
    <Link
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
    </Link>
  );
}

function LandingContent() {
  const searchParams = useSearchParams();
  const [refCode, setRefCode] = useState<string | null>(null);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── Top Announcement Bar ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 text-white px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-sm">
        <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> OFERTA EXCLUSIVA
        </span>
        <span>Adquiere el Libro <strong>"Ama Lo Que Comes"</strong> e incluye acceso total a la <strong>App ALOEC</strong></span>
        {refCode && (
          <span className="hidden md:inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold ml-2">
            🎁 Ref: {refCode}
          </span>
        )}
      </div>

      {/* ── Navigation Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Only */}
          <div className="flex items-center">
            <img src="/logo.png" alt="ALOEC Logo" className="h-10 w-auto object-contain" />
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#libro-app" className="hover:text-emerald-700 transition-colors">Libro + App</a>
            <a href="#beneficios" className="hover:text-emerald-700 transition-colors">Beneficios</a>
            <a href="#calculadora" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
              <Calculator className="w-4 h-4 text-emerald-600" /> Calculadora IMC
            </a>
            <a href="#recetas" className="hover:text-emerald-700 transition-colors">Jugos Verdes</a>
            <a href="#precios" className="hover:text-emerald-700 transition-colors">Planes & Ofertas</a>
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
              <BookOpen className="w-4 h-4 text-amber-300" /> Comprar Libro + App
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Book + App Offer) ────────────────────────────────── */}
      <section id="libro-app" className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-slate-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Domain & Offer Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/80 border border-emerald-300/60 rounded-full text-emerald-800 text-xs font-bold shadow-xs">
                <BookOpen className="w-4 h-4 text-emerald-700 animate-bounce" />
                <span>Libro Best-Seller + Acceso Completo a la App ALOEC</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Transforma tu salud con el Libro <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-500 font-black">"Ama Lo Que Comes"</span> y la App ALOEC.
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Al adquirir el libro oficial de medicina integrativa y jugoterapia (por José Rengifo), obtienes de forma automatizada tu cuenta de acceso a la <strong>App ALOEC</strong> para calcular tu IMC, recibir tu protocolo médico personalizado y acceder a videocursos y recetas.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#precios"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-xl hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 transform active:scale-95"
                >
                  <BookOpen className="w-5 h-5 text-amber-300" /> Adquirir Libro + App Incluida →
                </a>
              </div>

              {/* Download Store Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <AndroidAPKButton />
                <AppStoreButton href="#download" />
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pago Internacional Seguro (PayPhone)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>4.9 / 5 Valoración de Lectores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Acceso Inmediato en Smartphone y Web</span>
                </div>
              </div>

            </div>

            {/* Hero Right Visual: Book Cover Photo + App Interactive Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Decorative glow background */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500 to-green-300 rounded-[3rem] blur-2xl opacity-40 animate-pulse"></div>

                {/* Unified Book Photo Card */}
                <div className="relative bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 overflow-hidden group">
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100">
                    <img 
                      src="/book_hero.jpg" 
                      alt="Libro Ama Lo Que Comes y App ALOEC" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Floating Offer Badge */}
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 shadow-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center font-black text-lg shrink-0">
                          📖
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">Ama Lo Que Comes</p>
                          <p className="text-[10px] text-emerald-300 font-bold">Por José Rengifo · Incluye App ALOEC</p>
                        </div>
                      </div>
                      <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase">
                        OFERTA
                      </span>
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
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Lectores y Pacientes</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">+50</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Recetas de Jugoterapia</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">9</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Protocolos según IMC</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-400">100%</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Orgánico e Internacional</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── App Interface Showcase (Real Screenshots Mock) ──────────────────── */}
      <section className="py-20 bg-slate-100 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-700" /> Experiencia Móvil de Primera
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Conoce la interfaz de la Aplicación Móvil ALOEC
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Diseño limpio, minimalista y libre de distracciones para acompañar tu lectura del libro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Screen 1: IMC Calculator */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  PANTALLA 1
                </span>
                <span className="text-xs text-slate-500 font-bold">Calculadora de IMC</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-700 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1">
                    <span>♂ Masculino</span>
                  </div>
                  <div className="p-3 bg-slate-200 text-slate-600 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1">
                    <span>♀ Femenino</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Resultado IMC</span>
                  <p className="text-3xl font-black text-amber-600 font-mono">26.6</p>
                  <p className="text-xs font-bold text-amber-700 bg-amber-50 py-0.5 px-2 rounded-full inline-block">Sobrepeso</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingresa tu género, edad, estatura y peso para determinar al instante tu rango biológico y asignarte tu protocolo médico.
              </p>
            </div>

            {/* Screen 2: Progress & Daily Streaks */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  PANTALLA 2
                </span>
                <span className="text-xs text-slate-500 font-bold">Progreso & Racha</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-200">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Días Consecutivos</p>
                    <p className="text-[10px] text-slate-500">Completa tus jugos para subir tu racha</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-slate-700">Cumplimiento Semanal</span>
                    <span className="text-emerald-700 font-mono">100%</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">M</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">X</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">J</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">V</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">S</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">D</span>
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">L</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitorea tu racha de hábitos saludables, cumplimiento semanal de jugos y evolución corporal día tras día.
              </p>
            </div>

            {/* Screen 3: Video Lessons */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  PANTALLA 3
                </span>
                <span className="text-xs text-slate-500 font-bold">Lecciones en Video</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-200">
                <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">CURSO JUGOS</span>
                    <p className="text-xs font-bold mt-1">Clase 1: Jugo ZanaFruta</p>
                    <p className="text-[10px] text-slate-400">Jugo de Zanahoria con Manzanas Verdes</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aprende la preparación correcta de cada jugo verde con las lecciones dictadas en video por instructores expertos.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── Interactive Live IMC Calculator Section ──────────────────────────── */}
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
              
              {/* Gender selector */}
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-2">Género</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      gender === 'male' 
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ♂ Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      gender === 'female' 
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ♀ Femenino
                  </button>
                </div>
              </div>

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
              <Sparkles className="w-4 h-4 text-emerald-700" /> Libro + App Móvil Unificada
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Diseñada para transformar tu alimentación y estilo de vida
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Combina la lectura del libro "Ama Lo Que Comes" con tecnología móvil avanzada para acompañarte diariamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Libro "Ama Lo Que Comes"</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Guía completa de salud integrativa por José Rengifo para comprender la raíz de las inflamaciones y la sanación por alimentos.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplet className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Recetario Terapéutico HD</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accede a más de 50 recetas detalladas de jugos verdes curativos, batidos nutricionales y sopas vegetales en la app.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Protocolos Médicos por IMC</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recibe guías específicas según tu rango corporal para desintoxicación hepática, control metabólico, enemas de café y terapia Gerson.
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
                Comparte tu enlace personalizado <code className="bg-slate-100 px-1 py-0.5 rounded text-xs text-emerald-700 font-bold">app.alimentacionorganicaec.com</code> y gana beneficios por cada invitado.
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
                  <h3 className="text-2xl font-black">Jugo ZanaFruta</h3>
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

      {/* ── Pricing / Memberships Section (Dynamic Firestore Plans) ─────────── */}
      <section id="precios" className="py-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" /> PLANES DISPONIBLES
            </span>
            {/* Title formatted in a single line as requested */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white whitespace-nowrap">
              Planes de Suscripción ALOEC
            </h2>
            <p className="text-base sm:text-lg text-slate-400">
              Elige el plan ideal para adquirir el libro "Ama Lo Que Comes" y acceder a todas las herramientas de la app ALOEC.
            </p>
          </div>

          {/* Dynamic Memberships Grid */}
          {loadingMemberships ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm">
                <RefreshCw className="w-6 h-6 animate-spin" /> Cargando planes desde el sistema...
              </div>
            </div>
          ) : memberships.length > 0 ? (
            <div className={`grid grid-cols-1 ${memberships.length === 1 ? 'max-w-md mx-auto' : memberships.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3 max-w-6xl mx-auto'} gap-8 items-stretch`}>
              {memberships.map((m, idx) => (
                <div 
                  key={m.id}
                  className="bg-slate-900 border-2 border-emerald-500/80 hover:border-emerald-400 rounded-3xl p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 group"
                >
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-xs">
                      OFERTA RECOMENDADA
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="text-center space-y-3 pb-6 border-b border-slate-800">
                      <h3 className="text-2xl font-extrabold text-white">{m.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-black text-white font-mono">${m.price.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-400">USD / {m.durationDays} días</span>
                      </div>
                      <p className="text-xs text-emerald-400 font-medium">Incluye Libro + App ALOEC · Sin cargos ocultos</p>
                    </div>

                    <div className="space-y-3 text-sm text-slate-300">
                      {(m.features && m.features.length > 0 ? m.features : defaultFeatures).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-300 leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-8 mt-6 border-t border-slate-800">
                    <Link
                      href={`/checkout?plan=${m.id}`}
                      className="block w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all text-center transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> Comprar Libro + App ALOEC →
                    </Link>
                    <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Transacción internacional segura (PayPhone)
                    </p>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Fallback Card if no active membership documents exist yet */
            <div className="max-w-lg mx-auto bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-xs">
                OFERTA RECOMENDADA
              </div>
              
              <div className="text-center space-y-3 pb-6 border-b border-slate-800">
                <h3 className="text-2xl font-extrabold text-white">Plan único</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-white font-mono">$49.99</span>
                  <span className="text-xs font-bold text-slate-400">USD / 3000 días</span>
                </div>
                <p className="text-xs text-emerald-400 font-medium">Incluye Libro + App ALOEC · Sin cargos ocultos</p>
              </div>

              <div className="py-8 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Acceso ilimitado a jugos y recetas</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Todos los protocolos de salud</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Notificaciones de horarios</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Manual de Jugos Verdes</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-snug">Video Tutoriales</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Link
                  href="/checkout?plan=plan-nico"
                  className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl shadow-lg transition-all text-center transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5" /> Adquirir Libro + App ALOEC →
                </Link>
                <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Transacción encriptada a través de PayPhone
                </p>
              </div>
            </div>
          )}

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
              Acompaña la lectura del libro "Ama Lo Que Comes" con la app oficial. Disponible globalmente para Android e iOS.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <AndroidAPKButton />
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
              <div className="flex items-center">
                <img src="/logo.png" alt="ALOEC Logo" className="h-8 w-auto brightness-200" />
              </div>
              <p className="text-slate-500 leading-relaxed">
                Alimentación Orgánica & Salud Holística. Promoviendo la salud natural y la jugoterapia científica globalmente.
              </p>
              <p className="text-emerald-400 font-mono font-bold">
                app.alimentacionorganicaec.com
              </p>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Navegación</p>
              <ul className="space-y-2">
                <li><a href="#libro-app" className="hover:text-white transition-colors">Libro + App</a></li>
                <li><a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a></li>
                <li><a href="#calculadora" className="hover:text-white transition-colors">Calculadora IMC</a></li>
                <li><a href="#recetas" className="hover:text-white transition-colors">Jugos Verdes</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Planes & Ofertas</a></li>
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
              <p className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">Legales & Administración</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/politicas-de-privacidad" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <span>Política de Privacidad</span>
                  </Link>
                </li>

                <li>
                  <Link href="/login" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
                    Acceso Panel Administrativo <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
                <li><span className="text-slate-500">Soporte: soporte@alimentacionorganicaec.net</span></li>
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
