'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserProfile } from '@/components/auth/UserProfile';
import { AuthStateGate } from '@/components/auth/AuthStateGate';
import { ThemeToggle } from './ThemeToggle';
import { Separator } from './ui/separator';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/auth') {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">PromptCraft</span>
          </Link>
        </header>
        <main className="flex-grow">
          <AuthStateGate>{children}</AuthStateGate>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center space-x-2 p-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">PromptCraft</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>{/* Navigation items can go here */}</SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <UserProfile />
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <SidebarTrigger />
            <h1 className="font-headline text-2xl font-bold tracking-tight hidden md:block">
              {/* Placeholder for page title */}
            </h1>
          </div>
          <main>
            <AuthStateGate>{children}</AuthStateGate>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
