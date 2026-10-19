import React from 'react';
import { Metadata } from 'next';
import TermsAndConditionsView from '../../components/TermsAndConditionsView';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso | ALOEC',
  description: 'Términos y Condiciones oficiales de la aplicación móvil y plataforma web ALOEC.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return <TermsAndConditionsView />;
}
