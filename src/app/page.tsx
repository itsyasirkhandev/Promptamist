
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

function EmptyState({ onClear, isFiltered }: { onClear: () => void; isFiltered: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center">
      <h2 className="font-headline text-2xl font-semibold tracking-tight">
        {isFiltered ? "No Prompts Found" : "Your Library is Empty"}
      </h2>
      <p className="mt-2 mb-6 text-muted-foreground">
        {isFiltered
          ? "No prompts matched your search. Why not create a new one?"
          : "You haven't created any prompts yet. Let's change that!"}
      </p>
      {isFiltered ? (
        <div className="flex gap-4">
            <Button variant="outline" onClick={onClear}>
                Clear Search & Filters
            </Button>
            <Button asChild>
              <Link href="/create">
                <FilePlus className="mr-2 h-4 w-4" />
                Create a New Prompt
              </Link>
            </Button>
        </div>
      ) : (
        <Button asChild>
          <Link href="/create">
            <FilePlus className="mr-2 h-4 w-4" />
            Create Your First Prompt
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function Home() {
  const { prompts, isLoaded, allTags } = usePrompts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    if (!isLoaded) return [];
    return prompts.filter((prompt) => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? prompt.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [prompts, searchTerm, selectedTag, isLoaded]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Deselect if clicking the same tag
    } else {
      setSelectedTag(tag);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="flex-grow">
            <Skeleton className="h-6 w-3/4 mb-2" />
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
  
  const hasActiveFilter = searchTerm !== "" || selectedTag !== null;

  return (
    <div className="container mx-auto">
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

       {(isLoaded && prompts.length > 0) || hasActiveFilter ? (
        <div className="mb-8 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search prompts by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    onClick={() => handleTagClick(tag)}
                    size="sm"
                    className="rounded-full"
                >
                    {tag}
                    {selectedTag === tag && <X className="ml-1.5 h-3 w-3" />}
                </Button>
                ))}
            </div>
            )}
        </div>
       ) : null}

      {!isLoaded ? (
        renderSkeletons()
      ) : filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <EmptyState onClear={clearFilters} isFiltered={hasActiveFilter} />
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
