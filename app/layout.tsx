import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Endurance Coach PWA',
  description: 'Deterministic weekly training with fixed structure and auditable rules.',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
