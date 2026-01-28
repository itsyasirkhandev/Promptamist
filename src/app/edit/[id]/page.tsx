
import { AppLayout } from '@/components/AppLayout';
import { EditPromptClient } from '@/components/EditPromptClient';
import { getPromptById } from '@/lib/api';

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialPrompt = await getPromptById(id);

  return (
    <AppLayout>
      <EditPromptClient initialPrompt={initialPrompt} />
    </AppLayout>
  );
}
