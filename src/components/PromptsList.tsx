"use client";

import { useState, useEffect, useMemo } from "react";
import { getPrompts } from "@/lib/api";
import { PromptsGrid } from "./PromptsGrid";
import { usePrompts } from "@/hooks/use-prompts";

export function PromptsList({ userId }: { userId: string }) {
  const { prompts: realtimePrompts, isLoaded: isRealtimeLoaded } = usePrompts();
  const [cachedPrompts, setCachedPrompts] = useState<any[] | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Attempt to fetch from the server-side cache
    getPrompts(userId)
      .then((data) => {
        setCachedPrompts(data);
      })
      .catch((err) => {
        console.warn("Server-side fetch failed, falling back to client-side:", err);
        setError(true);
      });
  }, [userId]);

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

  return <PromptsGrid initialPrompts={displayPrompts} allTags={allTags} />;
}