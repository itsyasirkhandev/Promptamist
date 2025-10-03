import type { Metadata } from 'next';
import { CreatePromptForm } from '@/components/CreatePromptForm';

export const metadata: Metadata = {
  title: 'Create New Prompt',
  description: 'Add a new, reusable AI prompt to your personal library. Write a title, content, and tags to easily find it later.',
};

export default function CreatePromptPage() {
  return (
    <div className="container mx-auto max-w-2xl">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Create a New Prompt</h1>
        <p className="text-muted-foreground">
          Craft your next masterpiece. Fill in the details below to add a new prompt to your personal library.
        </p>
      </div>
      <CreatePromptForm />
    </div>
  );
}
