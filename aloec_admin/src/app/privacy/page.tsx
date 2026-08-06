import React from 'react';
import { Metadata } from 'next';
import PrivacyPolicyView from '../../components/PrivacyPolicyView';


export const metadata: Metadata = {
  title: 'Privacy Policy | ALOEC - Alimentación Orgánica EC',
  description: 'Official Privacy Policy for ALOEC mobile app and web platform.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicyView />;
}
