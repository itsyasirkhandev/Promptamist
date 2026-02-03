"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Prompt } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
} from 'firebase/firestore';
import { PromptSchema } from '@/lib/schemas';
import { promptConverter } from '@/firebase/converters';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
    revalidateUserPrompts, 
    revalidatePrompt, 
    createPromptAction, 
    updatePromptAction, 
    deletePromptAction 
} from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!firestore || !user) {
      setPrompts([]);
      setIsLoaded(!!user);
      return;
    }

    const promptsRef = collection(firestore, 'prompts').withConverter(promptConverter);
    const q = query(
        promptsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
        (snapshot) => {
            const newPrompts = snapshot.docs.map(doc => doc.data());
            setPrompts(newPrompts);
            setIsLoaded(true);
        },
        (err) => {
            console.error("Firestore snapshot failed", err);
            // Handle specific errors like permission denied
            if (err.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: 'prompts',
                    operation: 'list',
                }));
            }
            setIsLoaded(true);
        }
    );

    return () => unsubscribe();
  }, [firestore, user]);

  const addPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    try {
        await createPromptAction(promptData);
        router.refresh();
    } catch (err) {
        console.error("Failed to create prompt:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'prompts',
            operation: 'create',
        }));
    }
  }, [user, router]);

  const updatePrompt = useCallback(async (promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) => {
    if (!user) return;
    try {
        await updatePromptAction(promptId, updatedData);
        router.refresh();
    } catch (err) {
        console.error("Failed to update prompt:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `prompts/${promptId}`,
            operation: 'update',
        }));
    }
  }, [user, router]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!user) return;
    try {
        await deletePromptAction(promptId);
        router.refresh();
    } catch (err) {
        console.error("Failed to delete prompt:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `prompts/${promptId}`,
            operation: 'delete',
        }));
    }
  }, [user, router]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [prompts]);

  return { prompts, addPrompt, updatePrompt, deletePrompt, isLoaded, allTags };
}
