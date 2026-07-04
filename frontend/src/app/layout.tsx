import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreamSave - Production Fintech Super App',
  description: 'A real-world continuous payroll streaming and micro-savings protocol on Stellar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
