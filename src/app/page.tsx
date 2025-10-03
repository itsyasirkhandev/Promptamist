"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilePlus, Search, X } from "lucide-react";
import { usePrompts } from "@/hooks/use-prompts";
import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { prompts, isLoaded, allTags } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? prompt.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [prompts, searchTerm, selectedTag]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Deselect if clicking the same tag
    } else {
      setSelectedTag(tag);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  
  const renderNoResults = () => (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center">
      <h2 className="font-headline text-2xl font-semibold tracking-tight">No Prompts Found</h2>
      <p className="mt-2 mb-6 text-muted-foreground">
        No prompts matched your search. Try a different search term or filter.
      </p>
      <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedTag(null); }}>
        Clear Search & Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search prompts by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="py-1 text-sm font-medium text-muted-foreground">Filter by tag:</span>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                onClick={() => handleTagClick(tag)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                {tag}
                {selectedTag === tag && (
                   <X className="ml-1.5 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {!isLoaded ? (
        renderSkeletons()
      ) : prompts.length === 0 ? (
        renderEmptyState()
      ) : filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        renderNoResults()
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
