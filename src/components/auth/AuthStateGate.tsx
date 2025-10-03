'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

export function AuthStateGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, claims } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded) {
      if (!user && pathname !== '/auth') {
        router.push('/auth');
      } else if (user && pathname === '/auth') {
        router.push('/');
      }
    }
  }, [isLoaded, user, router, pathname]);

  if (!isLoaded || (isLoaded && !user && pathname !== '/auth') || (isLoaded && user && pathname === '/auth')) {
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
    )
  }

  return <>{children}</>;
}
