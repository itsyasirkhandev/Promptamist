"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Prompt } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  FieldValue,
} from 'firebase/firestore';
import { promptConverter } from '@/firebase/converters';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { revalidateUserPrompts, revalidatePrompt } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const retryCountRef = useRef(0);

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
                retryCountRef.current = 0; // Reset on success
            },
            (err) => {
                if (!isMounted) return;
                console.warn("Firestore snapshot failed", err.code, err.message);
                
                // Handle transient permission errors during signup
                if (err.code === 'permission-denied' && retryAttempt < 3) {
                    const delay = 1000 * (retryAttempt + 1);
                    console.log(`Retrying prompts listener in ${delay}ms... (Attempt ${retryAttempt + 1})`);
                    setTimeout(() => startListener(retryAttempt + 1), delay);
                    return;
                }

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
  }, [firestore, user, prompts.length, isLoaded]);

  const addPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'userId'>) => {
    if (!firestore || !user) return;
    const promptsRef = collection(firestore, 'prompts').withConverter(promptConverter);
    const newPrompt = {
      ...promptData,
      userId: user.uid,
      createdAt: serverTimestamp() as unknown as FieldValue,
    } as unknown as Prompt;

    try {
        await addDoc(promptsRef, newPrompt);
        // Fire and forget revalidation in the background
        revalidateUserPrompts(user.uid).catch(console.error);
        router.refresh();
    } catch (_serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'prompts',
            operation: 'create',
            requestResourceData: newPrompt,
        }));
    }
  }, [firestore, user, router]);

  const updatePrompt = useCallback(async (promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) => {
    if (!firestore || !user) return;
    const promptRef = doc(firestore, 'prompts', promptId);
    try {
        await updateDoc(promptRef, updatedData);
        // Fire and forget revalidation in the background
        Promise.all([
            revalidateUserPrompts(user.uid),
            revalidatePrompt(promptId)
        ]).catch(console.error);
        router.refresh();
    } catch (_serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `prompts/${promptId}`,
            operation: 'update',
            requestResourceData: updatedData,
        }));
    }
  }, [firestore, user, router]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!firestore || !user) return;
    const promptRef = doc(firestore, 'prompts', promptId);
    try {
        await deleteDoc(promptRef);
        // Fire and forget revalidation in the background
        Promise.all([
            revalidateUserPrompts(user.uid),
            revalidatePrompt(promptId)
        ]).catch(console.error);
        router.refresh();
    } catch (_serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `prompts/${promptId}`,
            operation: 'delete',
        }));
    }
  }, [firestore, user, router]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [prompts]);

  return { prompts, addPrompt, updatePrompt, deletePrompt, isLoaded, allTags };
}
