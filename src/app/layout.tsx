import './globals.css';
import type { Metadata, Viewport } from 'next';
import RegisterSW from './register-sw';

export const metadata: Metadata = {
  title: 'Bunchspeed Fitness',
  description: 'Coaching portal',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}

