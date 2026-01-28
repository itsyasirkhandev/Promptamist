
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailSignInForm } from '@/components/auth/EmailSignInForm';
import { EmailSignUpForm } from '@/components/auth/EmailSignUpForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

export function AuthPageClient() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex flex-col items-center justify-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-bold">Promptamist</span>
            </Link>
          </div>
          <CardTitle className="font-headline text-2xl">
            {showSignUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {showSignUp ? 'Enter your details to get started.' : 'Sign in to access your Promptamist library.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <GoogleSignInButton />
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            {showSignUp ? <EmailSignUpForm /> : <EmailSignInForm />}
          </div>
          <div className="mt-6 text-center text-sm">
            {showSignUp ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setShowSignUp(false)} className="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => setShowSignUp(true)} className="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
