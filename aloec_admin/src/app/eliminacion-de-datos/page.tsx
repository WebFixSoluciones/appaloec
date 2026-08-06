import { Metadata } from 'next';
import DataDeletionView from '../../components/DataDeletionView';

export const metadata: Metadata = {
  title: 'Eliminación de Datos | ALOEC',
  description: 'Solicitud de eliminación de cuenta y datos personales para la aplicación ALOEC (Alimentación Orgánica EC), en cumplimiento con las políticas de Google Play Store y Apple App Store.',
};

export default function DataDeletionPage() {
  return <DataDeletionView />;
}
