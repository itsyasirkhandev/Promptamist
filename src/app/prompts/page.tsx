
import { AppLayout } from "@/components/AppLayout";
import { PromptsPageClient } from "@/components/PromptsPageClient";
import { PromptsListServer } from "@/components/PromptsListServer";

export default function PromptsPage() {
  return (
    <AppLayout>
        <PromptsPageClient>
            {(userId) => <PromptsListServer userId={userId} />}
        </PromptsPageClient>
    </AppLayout>
  );
}
