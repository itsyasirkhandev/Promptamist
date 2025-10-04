
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CreatePromptForm } from '@/components/CreatePromptForm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Create New Prompt',
  description: 'Add a new, reusable AI prompt to your personal library. Write a title, content, and tags to easily find it later.',
};

export default function CreatePromptPage() {
  return (
    <AppLayout>
    <div className="container mx-auto max-w-6xl">
       <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 pl-0">
            <Link href="/prompts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
            </Link>
        </Button>
        <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Create a New Prompt</h1>
            <p className="text-muted-foreground">
            Craft your next masterpiece. Fill in the details below to add a new prompt to your personal library.
            </p>
        </div>
      </div>
      <CreatePromptForm />
    </div>
    </AppLayout>
  );
}
