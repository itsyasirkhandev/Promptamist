
"use client";

import { useUser } from "@/firebase";
import { AppLayout } from "@/components/AppLayout";
import { PromptsPageClient } from "@/components/PromptsPageClient";
import { PromptsList } from "@/components/PromptsList";
import { Suspense } from "react";
import { PromptsSkeleton } from "@/components/PromptsSkeleton";

export default function PromptsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
        <AppLayout>
            <PromptsSkeleton />
        </AppLayout>
    );
  }

  if (!user) {
    return null; // AuthStateGate handles redirects
  }

  return (
    <AppLayout>
        <PromptsPageClient userId={user.uid}>
            <Suspense fallback={<PromptsSkeleton />}>
                <PromptsList userId={user.uid} />
            </Suspense>
        </PromptsPageClient>
    </AppLayout>
  );
}
