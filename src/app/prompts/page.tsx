
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { PromptsPageClient } from "@/components/PromptsPageClient";
import { PromptsList } from "@/components/PromptsList";
import { getPrompts } from "@/lib/api";

export default async function PromptsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session-uid')?.value;

  if (!userId) {
      redirect("/auth");
  }

  // If we have a userId from the cookie, we can fetch cached prompts immediately on the server
  let initialPrompts = [];
  let serverSideFetched = false;
  
  if (userId) {
      try {
          initialPrompts = await getPrompts(userId);
          serverSideFetched = true;
      } catch (e) {
          console.warn("[Server] Cache fetch failed:", e);
      }
  }

  return (
    <AppLayout>
        <PromptsPageClient userId={userId || ""}>
            <PromptsList 
                userId={userId || ""} 
                initialPrompts={initialPrompts} 
                serverSideFetched={serverSideFetched}
            />
        </PromptsPageClient>
    </AppLayout>
  );
}
