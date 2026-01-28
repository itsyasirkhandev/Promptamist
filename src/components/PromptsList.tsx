"use client";

import { useState, useEffect, useMemo } from "react";
import { getPrompts } from "@/lib/api";
import { PromptsGrid } from "./PromptsGrid";
import { usePrompts } from "@/hooks/use-prompts";

import { PromptsSkeleton } from "./PromptsSkeleton";

export function PromptsList({ 
    userId, 
    initialPrompts = [] 
}: { 
    userId: string;
    initialPrompts?: any[];
}) {
  const { prompts: realtimePrompts, isLoaded: isRealtimeLoaded } = usePrompts();
  const [cachedPrompts, setCachedPrompts] = useState<any[] | null>(initialPrompts.length > 0 ? initialPrompts : null);
  const [isCacheLoaded, setIsCacheLoaded] = useState(initialPrompts.length > 0);

  useEffect(() => {
    // Only fetch if we didn't get initialPrompts from the server
    if (userId && !initialPrompts.length) {
        getPrompts(userId)
            .then((data) => {
                setCachedPrompts(data);
                setIsCacheLoaded(true);
            })
            .catch((err) => {
                console.warn("Server-side fetch failed, falling back to client-side:", err);
                setIsCacheLoaded(true);
            });
    } else if (userId) {
        setIsCacheLoaded(true);
    }
  }, [userId, initialPrompts]);

  // Use cached prompts if available, otherwise fallback to real-time prompts
  const displayPrompts = useMemo(() => {
    if (cachedPrompts && cachedPrompts.length > 0) {
      return cachedPrompts;
    }
    return realtimePrompts;
  }, [cachedPrompts, realtimePrompts]);

  const allTags = useMemo(() => {
    const tags = new Set(displayPrompts.flatMap((p) => p.tags || []));
    return Array.from(tags).sort();
  }, [displayPrompts]);

  // Show skeleton if:
  // 1. Both sources are still loading
  if (!isCacheLoaded && !isRealtimeLoaded) {
    return <PromptsSkeleton />;
  }

  // 2. Cache is "loaded" but empty, and real-time hasn't finished its first check yet
  // This prevents showing the empty state while waiting for real-time data to arrive.
  if (isCacheLoaded && (!cachedPrompts || cachedPrompts.length === 0) && !isRealtimeLoaded) {
    return <PromptsSkeleton />;
  }
  
  // If we've finished loading and still have no prompts, PromptsGrid will show EmptyState
  return <PromptsGrid initialPrompts={displayPrompts} allTags={allTags} />;
}