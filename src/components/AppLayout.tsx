
'use client';

import Link from 'next/link';
import { Bot } from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { ThemeToggle } from './ThemeToggle';
import { useUser } from '@/firebase';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

const LANDING_PATHS = ['/'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const pathname = usePathname();
  const isLandingPage = LANDING_PATHS.includes(pathname);

  const renderHeaderContent = () => {
    if (isLandingPage && !user) {
        return (
            <>
                 <Link href="/" className="flex items-center space-x-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <span className="font-bold inline-block">Promptamist</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button asChild variant="outline">
                        <Link href="/auth">Sign In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/auth">Get Started</Link>
                    </Button>
                </div>
            </>
        )
    }

    return (
        <>
            <Link href={user ? "/prompts" : "/"} className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-bold inline-block">Promptamist</span>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-4">
                <UserProfile />
                <ThemeToggle />
            </div>
        </>
    );
  };
  
  const mainContent = isLandingPage && !user ? children : (
    <main className='container mx-auto max-w-7xl flex-grow py-6 sm:py-8'>
        {children}
    </main>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b'>
        <div className="container mx-auto flex justify-between items-center py-3">
            {renderHeaderContent()}
        </div>
      </header>
      {mainContent}
    </div>
  );
}
