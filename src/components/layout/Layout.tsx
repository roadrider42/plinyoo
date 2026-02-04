/**
 * layout/Layout.tsx
 * Haupt-Layout-Container nach Entwicklungsrichtlinien
 * Mobile-First, responsive Design
 */

import React from 'react';
import { Header } from './Header';
import Footer from '../ui.Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-screen-2xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
