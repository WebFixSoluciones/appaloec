import './globals.css';

import { Toaster } from 'sonner';

export const metadata = {
  title: 'ALOEC Admin Panel',
  description: 'Admin Panel for ALOEC application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
