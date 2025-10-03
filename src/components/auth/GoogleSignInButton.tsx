'use client';

import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.223 0-9.651-3.358-11.303-8h-8.047v.003C6.438 36.337 14.601 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C42.022 35.023 44 30.017 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);


export function GoogleSignInButton() {
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Welcome!',
        description: "You've been successfully signed in with Google.",
      });
    } catch (error) {
      let title = 'An unknown error occurred.';
      let description = 'Please try again later.';

        if (error instanceof FirebaseError) {
             switch (error.code) {
                case 'auth/popup-closed-by-user':
                    title = 'Sign-in Cancelled';
                    description = 'You closed the sign-in window before completing the process.';
                    break;
                case 'auth/account-exists-with-different-credential':
                    title = 'Account Exists';
                    description = 'An account already exists with the same email address but different sign-in credentials.';
                    break;
                default:
                    title = 'Google Sign-In Error';
                    description = error.message;
                    break;
            }
        }
      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      <GoogleIcon />
      Continue with Google
    </Button>
  );
}
