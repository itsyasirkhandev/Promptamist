
"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { usePrompts } from '@/hooks/use-prompts';
import { CreatePromptForm } from '@/components/CreatePromptForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Prompt } from '@/lib/types';

export function EditPromptClient({ initialPrompt }: { initialPrompt: Prompt | null }) {
  const params = useParams();
  const { prompts, isLoaded } = usePrompts();
  const id = typeof params.id === 'string' ? params.id : '';

  // Use the server-fetched prompt initially, then the real-time one if available
  const prompt = useMemo(() => {
    if (!isLoaded) return initialPrompt;
    return prompts.find((p) => p.id === id) || initialPrompt;
  }, [prompts, id, isLoaded, initialPrompt]);

  if (!isLoaded && !initialPrompt) {
    return (
      <>
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-full max-w-md mb-8" />
        <Skeleton className="h-[500px] w-full" />
      </>
    );
  }

  if (isLoaded && !prompt) {
    return (
      <div className="text-center">
        <h1 className="font-headline text-2xl font-bold">Prompt not found</h1>
        <p className="mt-2 mb-4 text-muted-foreground">The prompt you are looking for does not exist or has been deleted.</p>
        <Button asChild>
          <Link href="/prompts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 pl-0">
          <Link href="/prompts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Edit Prompt</h1>
          <p className="text-muted-foreground">
            Make your changes below and save them to update your prompt.
          </p>
        </div>
      </div>
      {prompt ? (
        <CreatePromptForm prompt={prompt} isEditing={true} />
      ) : (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </>
  );
}
