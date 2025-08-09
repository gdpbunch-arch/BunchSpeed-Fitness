import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bunchspeed Fitness',
  description: 'Bunchspeed Fitness — client portal for coaching: workouts, meals, logging.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
