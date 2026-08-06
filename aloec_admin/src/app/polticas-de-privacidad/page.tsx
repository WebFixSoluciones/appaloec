import React from 'react';
import { Metadata } from 'next';
import PrivacyPolicyView from '../../components/PrivacyPolicyView';


export const metadata: Metadata = {
  title: 'Política de Privacidad | ALOEC - Alimentación Orgánica EC',
  description: 'Política de Privacidad y Protección de Datos Personales oficial para la aplicación móvil y plataforma ALOEC (Alimentación Orgánica EC). Cumplimiento Google Play Store.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PolticasDePrivacidadPage() {
  return <PrivacyPolicyView />;
}
