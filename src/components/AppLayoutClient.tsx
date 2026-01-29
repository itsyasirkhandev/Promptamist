
'use client';

import Link from 'next/link';
import { LayoutDashboard, Menu } from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { ThemeToggle } from './ThemeToggle';
import { useUser } from '@/firebase';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetClose, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Logo } from './Logo';

const NAV_LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#solution', label: 'Solution' },
  { href: '#features', label: 'Features' },
];

export function AppLayoutClient({ isLandingPage }: { isLandingPage: boolean }) {
  const { user, profile, isLoaded } = useUser();

  // For landing page buttons, we check both profile (from server-side cache) and user (from client-side auth)
  // this allows the 'Go to Dashboard' button to show up instantly.
  const hasUser = !!(profile || user);

  if (isLandingPage) {
    return (
        <>
            <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-2">
                    <Logo className="h-6 w-6" />
                    <span className="font-bold inline-block">Promptamist</span>
                </Link>
            </div>

            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-medium">
                {NAV_LINKS.map(link => (
                    <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                    </Link>
                ))}
            </nav>
             
             <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2">
                  <ThemeToggle />
                  { !isLoaded && !hasUser ? (
                      <Skeleton className="h-10 w-40" />
                  ) : hasUser ? (
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
                      <SheetContent side="left" className="flex flex-col p-0">
                        <SheetHeader className="p-6 text-left border-b flex-shrink-0">
                            <SheetTitle>
                                <Link href="/" className="flex items-center space-x-2">
                                    <Logo className="h-6 w-6" />
                                    <span className="font-bold inline-block">Promptamist</span>
                                </Link>
                            </SheetTitle>
                            <SheetDescription className="sr-only">Main navigation menu.</SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="flex-1">
                            <div className="p-6">
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
                        </ScrollArea>
                        <div className="border-t p-6 flex flex-col gap-4 flex-shrink-0">
                        { !isLoaded && !hasUser ? (
                            <Skeleton className="h-10 w-full" />
                        ) : hasUser ? (
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
                      </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    );
  }

  return (
    <>
        <Link href={hasUser ? "/prompts" : "/"} className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold inline-block">Promptamist</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
            <UserProfile />
            <ThemeToggle />
        </div>
    </>
  );
}
