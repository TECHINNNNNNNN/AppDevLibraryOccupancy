import React, { ReactNode } from 'react';
import Sidebar from '@/components/layout/sidebar';
import MobileNav from '@/components/layout/mobile-nav';
import Header from '@/components/layout/header';

interface AppShellProps {
  children: ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* Top header */}
        <Header />
        
        {/* Page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      
      {/* Mobile navigation bar */}
      <MobileNav />
    </div>
  );
};

export default AppShell;
