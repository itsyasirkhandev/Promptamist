
"use client";

import { useUser } from "@/firebase";
import { Suspense } from "react";
import { PromptsSkeleton } from "./PromptsSkeleton";
import { PromptsListServer } from "./PromptsListServer";
import { FilePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function PromptsPageClient({ 
    children 
}: { 
    children: (userId: string) => React.ReactNode 
}) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <PromptsSkeleton />;
  }

  if (!user) {
    return null; // AuthStateGate will redirect
  }

  return (
    <>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Prompt Library
                </h1>
                <p className="text-muted-foreground mt-1">Your central hub for crafting and managing AI prompts.</p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/create">
                <FilePlus className="mr-2 h-4 w-4" />
                New Prompt
              </Link>
            </Button>
        </div>

        <Suspense fallback={<PromptsSkeleton />}>
            {children(user.uid)}
        </Suspense>
        
        <div className="fixed bottom-4 right-4 sm:hidden">
          <Button asChild size="icon" className="h-14 w-14 rounded-full shadow-lg">
              <Link href="/create" aria-label="Create new prompt">
                <FilePlus className="h-6 w-6" />
              </Link>
          </Button>
        </div>
    </>
  );
}
