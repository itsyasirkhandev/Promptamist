
import { AppLayout } from "@/components/AppLayout";
import { PromptsPageClient } from "@/components/PromptsPageClient";
import { PromptsListServer } from "@/components/PromptsListServer";
import { Suspense } from "react";
import { PromptsSkeleton } from "@/components/PromptsSkeleton";
import { PromptsPageClientWrapper } from "@/components/PromptsPageClientWrapper";

export default function PromptsPage() {
  return (
    <AppLayout>
        <PromptsPageClientWrapper>
            <PromptsContent />
        </PromptsPageClientWrapper>
    </AppLayout>
  );
}

function PromptsContent({ userId }: { userId?: string }) {
    if (!userId) return null;
    return (
        <PromptsPageClient userId={userId}>
            <Suspense fallback={<PromptsSkeleton />}>
                <PromptsListServer userId={userId} />
            </Suspense>
        </PromptsPageClient>
    );
}
