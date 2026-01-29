
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PromptsPageClient } from "@/components/PromptsPageClient";
import { PromptsList } from "@/components/PromptsList";
import { getPrompts } from "@/lib/api";
import { Suspense } from "react";
import { PromptsSkeleton } from "@/components/PromptsSkeleton";
import type { Prompt } from "@/lib/types";

export default async function PromptsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session-uid')?.value;

  if (!userId) {
      redirect("/auth");
  }

  return (
    <AppLayout>
        <PromptsPageClient userId={userId || ""}>
            <Suspense fallback={<PromptsSkeleton />}>
                <PromptsDataStreamer userId={userId || ""} />
            </Suspense>
        </PromptsPageClient>
    </AppLayout>
  );
}

async function PromptsDataStreamer({ userId }: { userId: string }) {
    // This component runs on the server. Because it is wrapped in Suspense,
    // the page shell above it will be sent to the browser immediately
    // without waiting for this fetch to finish.
    let initialPrompts: Prompt[] = [];
    let serverSideFetched = false;
    
    try {
        initialPrompts = await getPrompts(userId);
        serverSideFetched = true;
    } catch (e) {
        console.warn("[Server] Cache fetch failed:", e);
    }

    return (
        <PromptsList 
            userId={userId} 
            initialPrompts={initialPrompts} 
            serverSideFetched={serverSideFetched}
        />
    );
}
