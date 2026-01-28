'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTE = '/auth';
const DEFAULT_AUTHENTICATED_ROUTE = '/prompts';


export function AuthStateGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      const isAuthRoute = pathname === AUTH_ROUTE;

      // Sync session to server
      if (user) {
        fetch('/api/auth/session', {
          method: 'POST',
          body: JSON.stringify({ uid: user.uid }),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        fetch('/api/auth/session', { method: 'DELETE' });
      }

      if (!user && !isPublicRoute && !isAuthRoute) {
        // Not logged in and trying to access a protected page, redirect to auth
        router.push(AUTH_ROUTE);
      } else if (user && isAuthRoute) {
        // Logged in and on auth page, redirect to dashboard
        router.push(DEFAULT_AUTHENTICATED_ROUTE);
      }
    }
  }, [isLoaded, user, router, pathname]);

  // Show a loading skeleton while checking auth state, or if a redirect is imminent
  if (!isLoaded || (!user && !PUBLIC_ROUTES.includes(pathname) && pathname !== AUTH_ROUTE) || (user && pathname === AUTH_ROUTE)) {
    // If it's a public route that we are redirecting from (like auth page), show a skeleton
     if (pathname === AUTH_ROUTE) {
       return (
         <div className="w-full h-screen">
          <Skeleton className="h-full w-full" />
         </div>
       );
     }
     
     // For protected routes while loading
     if (!PUBLIC_ROUTES.includes(pathname)) {
        return (
            <div className="w-full h-full flex justify-center items-center p-8">
                <div className="w-full max-w-screen-xl space-y-8">
                    <Skeleton className="h-16 w-1/3" />
                    <Skeleton className="h-8 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
     }
  }


  return <>{children}</>;
}
