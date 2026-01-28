
import { cacheLife, cacheTag } from 'next/cache';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/config';
import type { Prompt } from './types';

export async function getPrompts(userId: string): Promise<Prompt[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(`prompts-user-${userId}`);

  const { firestore } = initializeFirebase();
  const promptsRef = collection(firestore, 'prompts');
  const q = query(
    promptsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Ensure dates are serializable if they aren't already
            createdAt: data.createdAt,
        } as Prompt;
    });
  } catch (error) {
    console.error("Error fetching prompts on server:", error);
    return [];
  }
}

export async function getPromptById(id: string): Promise<Prompt | null> {
    'use cache';
    cacheLife('minutes');
    cacheTag(`prompt-${id}`);

    const { firestore } = initializeFirebase();
    const { doc, getDoc } = await import('firebase/firestore');
    const promptRef = doc(firestore, 'prompts', id);

    try {
        const snapshot = await getDoc(promptRef);
        if (!snapshot.exists()) return null;
        const data = snapshot.data();
        return {
            id: snapshot.id,
            ...data,
        } as Prompt;
    } catch (error) {
        console.error("Error fetching prompt by id on server:", error);
        return null;
    }
}
