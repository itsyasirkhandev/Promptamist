
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { AppLayoutClient } from './AppLayoutClient';
import { Skeleton } from './ui/skeleton';

const LANDING_PATHS = ['/'];

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || '';
  const isLandingPage = LANDING_PATHS.includes(pathname);

  const mainContent = isLandingPage ? children : (
    <main className='container mx-auto flex-grow px-4 py-6 sm:py-8'>
        {children}
    </main>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className='sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b'>
        <div className="container mx-auto flex justify-between items-center p-3 relative">
            <Suspense fallback={<HeaderSkeleton isLandingPage={isLandingPage} />}>
                <AppLayoutClient isLandingPage={isLandingPage} />
            </Suspense>
        </div>
      </header>
      {mainContent}
    </div>
  );
}

function HeaderSkeleton({ isLandingPage }: { isLandingPage: boolean }) {
    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    );
}
