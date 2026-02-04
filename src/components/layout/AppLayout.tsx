import React from 'react';
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/Toaster";
import Footer from "@/components/layout/Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  fullWidth?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showHeader = true,
  fullWidth = false
}) => {
  return (
    <>
      <div className="flex flex-col min-h-screen bg-spoonup-offwhite">
        {showHeader && <Header />}
        <main className="flex-grow">
          {fullWidth ? (
            <div className="w-full">
              {children}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          )}
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export default AppLayout;
