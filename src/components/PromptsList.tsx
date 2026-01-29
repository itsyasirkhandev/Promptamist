
"use client";

import { useState, useEffect, useMemo } from "react";
import { getPrompts } from "@/lib/api";
import { PromptsGrid } from "./PromptsGrid";
import { usePrompts } from "@/hooks/use-prompts";
import { PromptsSkeleton } from "./PromptsSkeleton";
import type { Prompt } from "@/lib/types";

export function PromptsList({ 
    userId, 
    initialPrompts = [],
    serverSideFetched = false
}: { 
    userId: string;
    initialPrompts?: Prompt[];
    serverSideFetched?: boolean;
}) {
  const { prompts: realtimePrompts, isLoaded: isRealtimeLoaded } = usePrompts();
  
  // Directly use server data if available, avoiding state-driven flickers during hydration
  const [fallbackPrompts, setFallbackPrompts] = useState<Prompt[] | null>(null);
  const [isFallbackLoaded, setIsFallbackLoaded] = useState(false);

  useEffect(() => {
    // Only trigger a client-side fetch if the server completely failed to provide anything
    if (userId && !serverSideFetched && !isFallbackLoaded) {
        getPrompts(userId)
            .then((data) => {
                setFallbackPrompts(data);
                setIsFallbackLoaded(true);
            })
            .catch(() => setIsFallbackLoaded(true));
    }
  }, [userId, serverSideFetched, isFallbackLoaded]);

  // Determine exactly what to show with zero-delay logic
  const displayPrompts = useMemo(() => {
    // 1. If we have server-side data, use it immediately (it's the cached source of truth)
    if (serverSideFetched) return initialPrompts;

    // 2. If real-time fallback data is loaded and is valid, use it
    if (isRealtimeLoaded) return realtimePrompts;
    
    // 3. Use client-side manual fallback if server failed
    if (fallbackPrompts) return fallbackPrompts;
    
    return [];
  }, [realtimePrompts, isRealtimeLoaded, initialPrompts, serverSideFetched, fallbackPrompts]);

  const allTags = useMemo(() => {
    const tags = new Set(displayPrompts.flatMap((p) => p.tags || []));
    return Array.from(tags).sort();
  }, [displayPrompts]);

  // SKELETON LOGIC:
  // Only show skeleton if we have absolutely no data from any source yet
  const hasData = isRealtimeLoaded || serverSideFetched || isFallbackLoaded;
  
  if (!hasData) {
    return <PromptsSkeleton />;
  }

  // If we have data but it's empty, and real-time is still loading, 
  // stay on skeleton to prevent "Empty Library" flash
  if (displayPrompts.length === 0 && !isRealtimeLoaded) {
    return <PromptsSkeleton />;
  }
  
  return <PromptsGrid initialPrompts={displayPrompts} allTags={allTags} />;
}
