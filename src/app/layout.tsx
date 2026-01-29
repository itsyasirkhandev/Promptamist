
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthStateGate } from '@/components/auth/AuthStateGate';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getUserProfile } from '@/lib/api';

const siteUrl = "https://promptamist.vercel.app/";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const uid = cookieStore.get('session-uid')?.value;
  const initialProfilePromise = uid ? getUserProfile(uid) : Promise.resolve(null);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="c1VKq-JyWZuq4XwG28KMXYU0GrmNJC628POSo4BnZh8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true} className={cn("min-h-screen bg-background font-body antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Suspense fallback={null}>
            <FirebaseClientProvider initialProfilePromise={initialProfilePromise}>
                <AuthStateGate>{children}</AuthStateGate>
              <Toaster />
            </FirebaseClientProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
