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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    if (!firestore || !user) {
      setPrompts([]);
      setIsLoaded(!!user);
      return;
    }

    setIsLoaded(false);
    const promptsRef = collection(firestore, 'prompts');
    const q = query(
      promptsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newPrompts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Prompt));
        setPrompts(newPrompts);
        setIsLoaded(true);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: promptsRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [firestore, user]);

  const addPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'userId'>) => {
    if (!firestore || !user) return;
    const promptsRef = collection(firestore, 'prompts');
    const newPrompt = {
      ...promptData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };
    addDoc(promptsRef, newPrompt)
        .catch((serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: promptsRef.path,
                operation: 'create',
                requestResourceData: newPrompt,
            }));
        });
  }, [firestore, user]);

  const updatePrompt = useCallback(async (promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) => {
    if (!firestore) return;
    const promptRef = doc(firestore, 'prompts', promptId);
    updateDoc(promptRef, updatedData)
        .catch((serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: promptRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            }));
        });
  }, [firestore]);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!firestore) return;
    const promptRef = doc(firestore, 'prompts', promptId);
    deleteDoc(promptRef)
        .catch((serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: promptRef.path,
                operation: 'delete',
            }));
        });
  }, [firestore]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [prompts]);

  return { prompts, addPrompt, updatePrompt, deletePrompt, isLoaded, allTags };
}
