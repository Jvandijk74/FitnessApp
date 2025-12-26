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
      <body className="min-h-screen">
        <Providers>
          <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/60">Progressive endurance & strength with fixed weekly cadence</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn-secondary">Install PWA</button>
                <a className="btn-primary" href="/dashboard">
                  Open app
                </a>
              </div>
            </header>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
