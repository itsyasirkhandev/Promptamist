
"use client";

import { use } from "react";
import { getPrompts } from "@/lib/api";
import { PromptsGrid } from "./PromptsGrid";

export function PromptsList({ userId }: { userId: string }) {
  // Use React.use to fetch from the server-side cached function
  const prompts = use(getPrompts(userId));
  
  const allTags = Array.from(
    new Set(prompts.flatMap((p) => p.tags || []))
  ).sort();

  return <PromptsGrid initialPrompts={prompts} allTags={allTags} />;
}
