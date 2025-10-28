
'use client';

import Link from 'next/link';
import { Bot, LayoutDashboard, Menu } from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { ThemeToggle } from './ThemeToggle';
import { useUser } from '@/firebase';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetClose, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Skeleton } from './ui/skeleton';

const LANDING_PATHS = ['/'];

const NAV_LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#features', label: 'Features' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const isLandingPage = LANDING_PATHS.includes(pathname);

  const renderHeaderContent = () => {
    if (isLandingPage) {
        return (
            <div className="flex w-full items-center justify-between">
                 <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Bot className="h-6 w-6 text-primary" />
                        <span className="font-bold inline-block">Promptamist</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                        {NAV_LINKS.map(link => (
                            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                      <ThemeToggle />
                      { !isLoaded ? (
                          <Skeleton className="h-10 w-48" />
                      ) : user ? (
                          <Button asChild>
                              <Link href="/prompts">
                                  <LayoutDashboard className="mr-2 h-4 w-4" />
                                  Go to Dashboard
                              </Link>
                          </Button>
                      ) : (
                          <>
                              <Button asChild variant="ghost">
                                  <Link href="/auth">Sign In</Link>
                              </Button>
                              <Button asChild>
                                  <Link href="/auth">Get Started</Link>
                              </Button>
                          </>
                      )}
                    </div>
                    <div className="md:hidden">
                       <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Menu className="h-6 w-6" />
                              <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="left" className="pr-0">
                            <SheetHeader className="p-6 text-left border-b">
                                <SheetTitle>
                                    <Link href="/" className="flex items-center space-x-2">
                                        <Bot className="h-6 w-6 text-primary" />
                                        <span className="font-bold inline-block">Promptamist</span>
                                    </Link>
                                </SheetTitle>
                                <SheetDescription className="sr-only">Main navigation links for the landing page.</SheetDescription>
                            </SheetHeader>
                            <div className="flex h-full flex-col justify-between">
                                <div className="flex flex-col gap-6 p-6">
                                <nav className="flex flex-col gap-4">
                                    {NAV_LINKS.map(link => (
                                    <SheetClose asChild key={link.href}>
                                        <Link href={link.href} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                    ))}
                                </nav>
                                </div>
                                <div className="border-t p-6 flex flex-col gap-4">
                                { !isLoaded ? (
                                    <Skeleton className="h-10 w-full" />
                                ) : user ? (
                                    <SheetClose asChild>
                                    <Button asChild size="lg">
                                        <Link href="/prompts">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Go to Dashboard
                                        </Link>
                                    </Button>
                                    </SheetClose>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                        <Button asChild variant="outline" size="lg">
                                            <Link href="/auth">Sign In</Link>
                                        </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                        <Button asChild size="lg">
                                            <Link href="/auth">Get Started</Link>
                                        </Button>
                                        </SheetClose>
                                    </>
                                )}
                                <div className="space-y-2">
                                    <ThemeToggle variant="buttons" />
                                </div>
                                </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
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
  
  const mainContent = isLandingPage ? children : (
    <main className='container mx-auto flex-grow px-4 py-6 sm:py-8'>
        {children}
    </main>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b'>
        <div className="container mx-auto flex justify-between items-center p-3">
            {renderHeaderContent()}
        </div>
      </header>
      {mainContent}
    </div>
  );
}
