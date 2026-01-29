"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Prompt } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
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
    if (!firestore || !user) return;
    const promptsRef = collection(firestore, 'prompts').withConverter(promptConverter);
    const newPrompt = {
      ...promptData,
      userId: user.uid,
      createdAt: serverTimestamp() as any, // Cast as any because serverTimestamp() is a FieldValue, but Prompt expects {seconds, nanoseconds} after fetch
    } as Prompt;

    try {
        await addDoc(promptsRef, newPrompt);
        // Server cache invalidation is still good for SEO/initial load
        await revalidateUserPrompts(user.uid);
        // 2. Refresh the current route to pull new cached data
        router.refresh();
    } catch (serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'prompts',
            operation: 'create',
            requestResourceData: newPrompt,
        }));
    }
  }, [firestore, user]);

  const updatePrompt = useCallback(async (promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) => {
    if (!firestore || !user) return;
    const promptRef = doc(firestore, 'prompts', promptId);
    try {
        await updateDoc(promptRef, updatedData);
        // 1. Invalidate Server Cache in parallel
        await Promise.all([
            revalidateUserPrompts(user.uid),
            revalidatePrompt(promptId)
        ]);
        // 2. Refresh the current route to pull new cached data
        router.refresh();
    } catch (serverError) {
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
        // 1. Invalidate Server Cache in parallel
        await Promise.all([
            revalidateUserPrompts(user.uid),
            revalidatePrompt(promptId)
        ]);
        // 2. Refresh the current route to pull new cached data
        router.refresh();
    } catch (serverError) {
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
