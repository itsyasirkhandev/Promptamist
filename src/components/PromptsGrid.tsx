
"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Prompt } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptsGridProps {
  initialPrompts: Prompt[];
  allTags: string[];
}

function EmptyState({ onClear, isFiltered }: { onClear: () => void; isFiltered: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center">
      <h2 className="font-headline text-2xl font-semibold tracking-tight">
        {isFiltered ? "No Prompts Found" : "Your Library is Empty"}
      </h2>
      <p className="mt-2 mb-6 text-muted-foreground">
        {isFiltered
          ? "Try adjusting your search or filters. You can also create a new one."
          : "You haven't created any prompts yet. Let's change that!"}
      </p>
      {isFiltered ? (
        <div className="flex gap-4">
            <Button variant="outline" onClick={onClear}>
                Clear Filters
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

export function PromptsGrid({ initialPrompts, allTags }: PromptsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return initialPrompts.filter((prompt) => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? prompt.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [initialPrompts, searchTerm, selectedTag]);

  const handleTagChange = (tag: string) => {
    if (tag === "all-tags") {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
  };

  const hasActiveFilter = searchTerm !== "" || selectedTag !== null;

  return (
    <>
        {(initialPrompts.length > 0) || hasActiveFilter ? (
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
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
                <Select value={selectedTag || "all-tags"} onValueChange={handleTagChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by tag..." />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all-tags">All Tags</SelectItem>
                    {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                        {tag}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              )}
          </div>
        ) : null}

        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <EmptyState onClear={clearFilters} isFiltered={hasActiveFilter} />
        )}
    </>
  );
}
