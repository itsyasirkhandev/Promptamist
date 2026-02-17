
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { EditPromptClient } from '@/components/EditPromptClient';
import { getPromptById } from '@/lib/api';

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session-uid')?.value;

  if (!userId) {
    redirect('/auth');
  }

  const { id } = await params;
  const initialPrompt = await getPromptById(id);

  // Security check: Only allow the owner to edit the prompt
  if (initialPrompt && initialPrompt.userId !== userId) {
      redirect("/prompts");
  }

  return (
    <AppLayout>
      <EditPromptClient initialPrompt={initialPrompt} />
    </AppLayout>
  );
}
