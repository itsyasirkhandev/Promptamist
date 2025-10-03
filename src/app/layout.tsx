import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthStateGate } from '@/components/auth/AuthStateGate';
import { UserProfile } from '@/components/auth/UserProfile';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';


export const metadata: Metadata = {
  title: {
    default: 'PromptCraft | Your Personal AI Prompt Library',
    template: '%s | PromptCraft',
  },
  description: 'Craft, save, and organize your AI prompts with ease. PromptCraft helps you build a powerful, personal library for faster and more effective AI interactions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Space+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <FirebaseClientProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                 <Link href="/" className="flex items-center space-x-2 p-2">
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="font-bold inline-block">PromptCraft</span>
                </Link>
              </SidebarHeader>
              <SidebarContent>
                {/* Navigation items can go here */}
              </SidebarContent>
              <SidebarFooter>
                <UserProfile />
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
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
