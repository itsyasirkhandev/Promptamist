
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
import { AppLayout } from '@/components/AppLayout';
import { ThemeProvider } from '@/components/ThemeProvider';

const siteUrl = "https://promptamist.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Promptamist | Your Personal AI Prompt Library & Manager',
    template: '%s | Promptamist',
  },
  description: 'Craft, save, organize, and re-use your AI prompts with Promptamist. Build a powerful, personal library of prompt templates for faster and more effective AI interactions.',
  keywords: ['AI', 'Prompt Engineering', 'Prompt Library', 'Prompt Manager', 'ChatGPT Prompts', 'LLM Prompts', 'Prompt Templates', 'GenAI'],
  authors: [{ name: 'Yasir', url: 'https://yasir.qzz.io' }],
  creator: 'Yasir',
  publisher: 'Yasir',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Promptamist | Your Personal AI Prompt Library & Manager',
    description: 'Craft, save, organize, and re-use your AI prompts with Promptamist. Build a powerful, personal library for faster and more effective AI interactions.',
    url: siteUrl,
    siteName: 'Promptamist',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Promptamist | Your Personal AI Prompt Library & Manager',
    description: 'Craft, save, organize, and re-use your AI prompts with Promptamist. Build a powerful, personal library for faster and more effective AI interactions.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <FirebaseClientProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
