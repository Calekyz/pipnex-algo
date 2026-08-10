'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Log any client-side errors
    const handler = (event: ErrorEvent) => {
      console.error('Client error:', event.error);
      setHasError(true);
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  if (hasError) {
    return (
      <html lang="en">
        <body>
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-8 max-w-md text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h1>
              <p className="text-gray-300">Please refresh the page or try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
