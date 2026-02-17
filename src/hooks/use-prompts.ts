"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Prompt } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore';
import { promptConverter } from '@/firebase/converters';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createPrompt, updatePromptAction, deletePromptAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!firestore || !user) {
        if (prompts.length > 0) setPrompts([]);
        if (isLoaded !== !!user) setIsLoaded(!!user);
        return;
    }

    let unsubscribe: () => void = () => {};
    let isMounted = true;

    const startListener = (retryAttempt = 0) => {
        if (!isMounted) return;

        const promptsRef = collection(firestore, 'prompts').withConverter(promptConverter);
        const q = query(
            promptsRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(100)
        );

        unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const newPrompts = snapshot.docs.map(doc => doc.data());
                setPrompts(newPrompts);
                setIsLoaded(true);
            },
            (err) => {
                if (!isMounted) return;
                
                // Handle transient permission errors during signup
                if (err.code === 'permission-denied' && retryAttempt < 5) {
                    const delay = 1500 * (retryAttempt + 1);
                    console.warn(`Retrying prompts listener in ${delay}ms... (Attempt ${retryAttempt + 1}/5)`);
                    setTimeout(() => startListener(retryAttempt + 1), delay);
                    return;
                }

                console.error("Firestore snapshot failed", err.code, err.message);
                if (err.code === 'permission-denied') {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: 'prompts',
                        operation: 'list',
                    }));
                }
                setIsLoaded(true);
            }
        );
    };

    startListener();

    return () => {
        isMounted = false;
        unsubscribe();
    };
  }, [firestore, user]);

  const addPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    try {
        await createPrompt(user.uid, promptData);
        router.refresh();
    } catch (error) {
        console.error("Error creating prompt via Server Action:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'prompts',
            operation: 'create',
        }));
    }
  }, [user, router]);

  const updatePrompt = useCallback(async (promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) => {
    if (!user) return;
    try {
        await updatePromptAction(promptId, user.uid, updatedData);
        router.refresh();
    } catch (error) {
        console.error("Error updating prompt via Server Action:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `prompts/${promptId}`,
            operation: 'update',
        }));
    }
  }, [user, router]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!user) return;
    try {
        await deletePromptAction(promptId, user.uid);
        router.refresh();
    } catch (error) {
        console.error("Error deleting prompt via Server Action:", error);
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
