
"use client";

import { useState, useEffect, useMemo } from "react";
import { getPrompts } from "@/lib/api";
import { PromptsGrid } from "./PromptsGrid";
import { usePrompts } from "@/hooks/use-prompts";

import { PromptsSkeleton } from "./PromptsSkeleton";

export function PromptsList({ 
    userId, 
    initialPrompts = [],
    serverSideFetched = false
}: { 
    userId: string;
    initialPrompts?: any[];
    serverSideFetched?: boolean;
}) {
  console.log(`[PromptsList Client] Rendered with userId: ${userId}, initialPrompts: ${initialPrompts.length}, serverSideFetched: ${serverSideFetched}`);
  const { prompts: realtimePrompts, isLoaded: isRealtimeLoaded } = usePrompts();
  const [cachedPrompts, setCachedPrompts] = useState<any[] | null>(initialPrompts.length > 0 || serverSideFetched ? initialPrompts : null);
  const [isCacheLoaded, setIsCacheLoaded] = useState(serverSideFetched);

  useEffect(() => {
    if (isRealtimeLoaded) {
        console.log(`[PromptsList Client] Real-time data loaded: ${realtimePrompts.length} prompts`);
    }
  }, [isRealtimeLoaded, realtimePrompts.length]);

  useEffect(() => {
    // Only fetch if we didn't get initialPrompts from the server AND the server didn't already try
    if (userId && !serverSideFetched) {
        console.log(`[PromptsList Client] Triggering client-side fetch for ${userId}`);
        getPrompts(userId)
            .then((data) => {
                console.log(`[PromptsList Client] Client-side fetch returned ${data.length} prompts`);
                setCachedPrompts(data);
                setIsCacheLoaded(true);
            })
            .catch((err) => {
                console.warn("[PromptsList Client] Client-side fetch failed:", err);
                setIsCacheLoaded(true);
            });
    }
  }, [userId, serverSideFetched]);

  // Use cached prompts if available, otherwise fallback to real-time prompts
  const displayPrompts = useMemo(() => {
    // If the server gave us prompts (even an empty list), use them until real-time is ready
    if (isCacheLoaded && cachedPrompts !== null) {
      // If real-time has loaded and is different, real-time takes precedence
      if (isRealtimeLoaded && realtimePrompts.length !== cachedPrompts.length) {
          return realtimePrompts;
      }
      return cachedPrompts;
    }
    return realtimePrompts;
  }, [cachedPrompts, realtimePrompts, isCacheLoaded, isRealtimeLoaded]);

  const allTags = useMemo(() => {
    const tags = new Set(displayPrompts.flatMap((p) => p.tags || []));
    return Array.from(tags).sort();
  }, [displayPrompts]);

  // Show skeleton ONLY if:
  // We haven't fetched from server OR the server fetch failed AND real-time hasn't loaded either
  if (!isCacheLoaded && !isRealtimeLoaded) {
    console.log(`[PromptsList Client] Showing skeleton: Cache not loaded, Real-time not loaded`);
    return <PromptsSkeleton />;
  }
  
  // If the server fetch found nothing, but real-time is still loading, 
  // we might want to keep showing the skeleton to avoid "Library is Empty" flash
  if (isCacheLoaded && (!displayPrompts || displayPrompts.length === 0) && !isRealtimeLoaded) {
    console.log(`[PromptsList Client] Showing skeleton: Cache loaded but empty, waiting for Real-time`);
    return <PromptsSkeleton />;
  }
  
  console.log(`[PromptsList Client] Rendering ${displayPrompts.length} prompts`);
  // If we've finished loading and still have no prompts, PromptsGrid will show EmptyState
  return <PromptsGrid initialPrompts={displayPrompts} allTags={allTags} />;
}
