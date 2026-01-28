
'use server';

import { updateTag } from 'next/cache';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/config';
import type { Prompt } from '@/lib/types';

export async function addPromptAction(userId: string, promptData: Omit<Prompt, 'id' | 'createdAt' | 'userId'>) {
  const { firestore } = initializeFirebase();
  const promptsRef = collection(firestore, 'prompts');
  const newPrompt = {
    ...promptData,
    userId: userId,
    createdAt: serverTimestamp(),
  };
  
  await addDoc(promptsRef, newPrompt);
  updateTag(`prompts-user-${userId}`);
}

export async function updatePromptAction(userId: string, promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) {
  const { firestore } = initializeFirebase();
  const promptRef = doc(firestore, 'prompts', promptId);
  
  await updateDoc(promptRef, updatedData);
  updateTag(`prompts-user-${userId}`);
  updateTag(`prompt-${promptId}`);
}

export async function deletePromptAction(userId: string, promptId: string) {
  const { firestore } = initializeFirebase();
  const promptRef = doc(firestore, 'prompts', promptId);
  
  await deleteDoc(promptRef);
  updateTag(`prompts-user-${userId}`);
  updateTag(`prompt-${promptId}`);
}
