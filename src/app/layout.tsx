import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { FC } from 'react';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { QueryClientProvider } from '@/core/queryClientProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tracks App',
  description: 'Tracks App',
};

const RootLayout: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider>{children}</QueryClientProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
};

export default RootLayout;
