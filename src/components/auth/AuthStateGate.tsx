'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

  // Show a loading skeleton only if:
  // 1. We are on a protected route AND 
  // 2. We don't have a user yet AND 
  // 3. We are still checking (isLoaded is false)
  //
  // CRITICAL: We don't block the render if the server has already sent content.
  // We let the content hydrate and only redirect if the check fails later.
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = pathname === AUTH_ROUTE;

  if (!isLoaded && !isPublicRoute && !isAuthRoute) {
      // Instead of returning a full-page skeleton that wipes out the server HTML,
      // we return the children but keep them hidden or just let them stay.
      // For the best UX with PPR, we should just let the children render.
      return <>{children}</>;
  }

  return <>{children}</>;
}
