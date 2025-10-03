import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthStateGate } from '@/components/auth/AuthStateGate';
import { UserProfile } from '@/components/auth/UserProfile';


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
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="font-bold inline-block">PromptCraft</span>
                </Link>
                <div className="ml-auto">
                  <UserProfile />
                </div>
              </div>
            </header>
            <main className="flex-1">
              <AuthStateGate>{children}</AuthStateGate>
            </main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
