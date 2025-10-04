
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { AuthStateGate } from '@/components/auth/AuthStateGate';
import { ThemeToggle } from './ThemeToggle';
import { Separator } from './ui/separator';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const renderHeader = () => (
    <header className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold inline-block">Promptamist</span>
        </Link>
        {pathname !== '/auth' && (
           <div className="flex items-center gap-2 sm:gap-4">
            <UserProfile />
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {renderHeader()}
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <AuthStateGate>{children}</AuthStateGate>
      </main>
    </div>
  );
}

    