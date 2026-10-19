import React from 'react';
import { Metadata } from 'next';
import TermsAndConditionsView from '../../components/TermsAndConditionsView';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso | ALOEC - Alimentación Orgánica EC',
  description: 'Términos y Condiciones oficiales de uso, licencia, contratación y deslinde médico para la aplicación móvil y plataforma web de ALOEC. Cumplimiento Google Play Store y Apple App Store.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TerminosYCondicionesPage() {
  return <TermsAndConditionsView />;
}
