
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilePlus, Search, X, Sparkles, SlidersHorizontal } from "lucide-react";
import { usePrompts } from "@/hooks/use-prompts";
import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";


function EmptyState({ onClear, isFiltered }: { onClear: () => void; isFiltered: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 py-24 text-center animate-in fade-in duration-700">
      <div className="mb-6 rounded-full bg-muted/50 p-4 ring-1 ring-border/50">
        <Sparkles className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h2 className="font-headline text-2xl font-semibold tracking-tight">
        {isFiltered ? "No Prompts Found" : "Your Library is Empty"}
      </h2>
      <p className="mt-2 mb-8 text-muted-foreground max-w-sm">
        {isFiltered
          ? "No prompts matched your search. Try adjusting your filters or search terms."
          : "You haven't created any prompts yet. Start building your collection today!"}
      </p>
      {isFiltered ? (
        <div className="flex gap-4">
            <Button variant="outline" onClick={onClear}>
                Clear Search & Filters
            </Button>
            <Button asChild>
              <Link href="/create">
                <FilePlus className="mr-2 h-4 w-4" />
                Create New
              </Link>
            </Button>
        </div>
      ) : (
        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
          <Link href="/create">
            <FilePlus className="mr-2 h-5 w-5" />
            Create Your First Prompt
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function PromptsPage() {
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
        <div key={i} className="flex flex-col space-y-3 rounded-xl border border-border/50 bg-card/30 p-4 shadow-sm">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="pt-2">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
  
  const hasActiveFilter = searchTerm !== "" || selectedTag !== null;

  return (
    <AppLayout>
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] mix-blend-multiply" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] mix-blend-multiply" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
                <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                    Prompt Library
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Your personal command center for AI interactions. <br className="hidden md:inline" /> 
                    Craft, organize, and deploy your prompts with precision.
                </p>
            </div>
            <Button asChild size="lg" className="shrink-0 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 rounded-full px-6">
              <Link href="/create">
                <FilePlus className="mr-2 h-5 w-5" />
                New Prompt
              </Link>
            </Button>
        </div>

        <div className="relative z-10 space-y-6">
            {/* Search and Filter Bar */}
            <div className="sticky top-4 z-20 backdrop-blur-md bg-background/80 rounded-2xl border border-border/50 p-4 shadow-sm transition-all duration-200 focus-within:shadow-md focus-within:border-primary/20">
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by title, content, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full bg-secondary/30 border-transparent focus:bg-background transition-colors h-11"
                        />
                    </div>
                    {(isLoaded && (prompts.length > 0 || hasActiveFilter)) && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient-r">
                             <div className="flex items-center text-xs font-medium text-muted-foreground shrink-0 mr-2">
                                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                                Filters:
                             </div>
                            {allTags.map((tag) => (
                            <Button
                                key={tag}
                                variant={selectedTag === tag ? "secondary" : "ghost"}
                                onClick={() => handleTagClick(tag)}
                                size="sm"
                                className={cn(
                                    "rounded-full h-7 text-xs border border-transparent transition-all",
                                    selectedTag === tag ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" : "hover:bg-muted"
                                )}
                            >
                                {tag}
                                {selectedTag === tag && <X className="ml-1.5 h-3 w-3" />}
                            </Button>
                            ))}
                            {allTags.length === 0 && <span className="text-xs text-muted-foreground italic">No tags found.</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            {!isLoaded ? (
                renderSkeletons()
            ) : filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
                    {filteredPrompts.map((prompt, index) => (
                    <div 
                        key={prompt.id} 
                        className="animate-in fade-in-up fill-mode-forwards opacity-0"
                        style={{ animationDelay: `${index * 50}ms`, animationDuration: '500ms' }}
                    >
                        <PromptCard prompt={prompt} />
                    </div>
                    ))}
                </div>
            ) : (
                <EmptyState onClear={clearFilters} isFiltered={hasActiveFilter} />
            )}
        </div>
        
        {/* Mobile FAB */}
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button asChild size="icon" className="h-14 w-14 rounded-full shadow-xl shadow-primary/30">
              <Link href="/create" aria-label="Create new prompt">
                <FilePlus className="h-6 w-6" />
              </Link>
          </Button>
        </div>
    </AppLayout>
  );
}
