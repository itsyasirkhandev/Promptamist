"use client";

import Link from "next/link";
import { FilePlus } from "lucide-react";
import { usePrompts } from "@/hooks/use-prompts";
import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Home() {
  const { prompts, isLoaded } = usePrompts();

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center">
      <h2 className="font-headline text-2xl font-semibold tracking-tight">Your Library is Empty</h2>
      <p className="mt-2 mb-6 text-muted-foreground">
        You haven't created any prompts yet. Let's change that!
      </p>
      <Button asChild>
        <Link href="/create">
          <FilePlus className="mr-2 h-4 w-4" />
          Create Your First Prompt
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Prompt Library
          </h1>
          <p className="text-muted-foreground">Your collection of curated AI prompts.</p>
        </div>
        <Button asChild className="hidden sm:flex">
          <Link href="/create">
            <FilePlus className="mr-2 h-4 w-4" />
            New Prompt
          </Link>
        </Button>
      </div>

      {!isLoaded ? (
        renderSkeletons()
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
      
      <div className="fixed bottom-4 right-4 sm:hidden">
         <Button asChild size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Link href="/create" aria-label="Create new prompt">
              <FilePlus className="h-6 w-6" />
            </Link>
         </Button>
      </div>
    </div>
  );
}
