
import { getPrompts } from "@/lib/api";
import { PromptsGrid } from "./PromptsGrid";

export async function PromptsListServer({ userId }: { userId: string }) {
  const prompts = await getPrompts(userId);
  
  const allTags = Array.from(
    new Set(prompts.flatMap((p) => p.tags || []))
  ).sort();

  return <PromptsGrid initialPrompts={prompts} allTags={allTags} />;
}
