import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'ALOEC - Ama Lo Que Comes | Medicina Integrativa',
  description: 'Libro oficial de nutrición celular y jugoterapia por José Rengifo, con acceso completo a la aplicación móvil ALOEC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${inter.className}`}>
      <body className={`${inter.className} font-sans antialiased text-[#0a1112]`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
