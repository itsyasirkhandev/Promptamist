import { cookies } from "next/headers";
import { AppLayout } from "@/components/AppLayout";
import { PromptsPageClient } from "@/components/PromptsPageClient";
import { PromptsList } from "@/components/PromptsList";
import { Suspense } from "react";
import { PromptsSkeleton } from "@/components/PromptsSkeleton";
import { getPrompts } from "@/lib/api";

export default async function PromptsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session-uid')?.value;

  // If we have a userId from the cookie, we can fetch cached prompts immediately on the server
  let initialPrompts = [];
  let serverSideFetched = false;
  
  if (userId) {
      try {
          initialPrompts = await getPrompts(userId);
          serverSideFetched = true;
      } catch (e) {
          console.warn("Failed to fetch initial prompts on server:", e);
      }
  }

  return (
    <AppLayout>
        <PromptsPageClient userId={userId || ""}>
            <Suspense fallback={<PromptsSkeleton />}>
                <PromptsList 
                    userId={userId || ""} 
                    initialPrompts={initialPrompts} 
                    serverSideFetched={serverSideFetched}
                />
            </Suspense>
        </PromptsPageClient>
    </AppLayout>
  );
}