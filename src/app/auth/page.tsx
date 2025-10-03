'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSignInForm } from '@/components/auth/EmailSignInForm';
import { EmailSignUpForm } from '@/components/auth/EmailSignUpForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Separator } from '@/components/ui/separator';

export default function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">
            {showSignUp ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {showSignUp ? 'Enter your details to get started.' : 'Sign in to access your prompt library.'}
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
