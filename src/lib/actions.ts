'use server';

import { updateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { getAdminDb } from './api-cache';
import { PromptSchema, UserProfileSchema } from './schemas';
import type { Prompt, UserProfile } from './types';

/**
 * Helper to get the current user ID from the session cookie.
 */
async function getSessionUserId() {
  const cookieStore = await cookies();
  return cookieStore.get('session-uid')?.value;
}

/**
 * Revalidates the cache for a specific user's prompts.
 */
export async function revalidateUserPrompts(userId: string) {
  updateTag(`prompts-user-${userId}`);
}

/**
 * Revalidates the cache for a specific prompt.
 */
export async function revalidatePrompt(promptId: string) {
  updateTag(`prompt-${promptId}`);
}

/**
 * Revalidates the user profile cache.
 */
export async function revalidateUserProfile(userId: string) {
  updateTag(`user-profile-${userId}`);
}

/**
 * Creates a new prompt using the Admin SDK.
 */
export async function createPromptAction(promptData: Omit<Prompt, 'id' | 'createdAt' | 'userId'>) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('Unauthorized');

  const db = await getAdminDb();
  const admin = await import('firebase-admin');

  const newPrompt = {
    ...promptData,
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection('prompts').add(newPrompt);
  
  await revalidateUserPrompts(userId);
  return docRef.id;
}

/**
 * Updates an existing prompt using the Admin SDK.
 */
export async function updatePromptAction(promptId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('Unauthorized');

  const db = await getAdminDb();
  const promptRef = db.collection('prompts').doc(promptId);
  const doc = await promptRef.get();

  if (!doc.exists) throw new Error('Prompt not found');
  if (doc.data()?.userId !== userId) throw new Error('Unauthorized');

  await promptRef.update(updatedData);
  
  await Promise.all([
    revalidateUserPrompts(userId),
    revalidatePrompt(promptId)
  ]);
}

/**
 * Deletes a prompt using the Admin SDK.
 */
export async function deletePromptAction(promptId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error('Unauthorized');

  const db = await getAdminDb();
  const promptRef = db.collection('prompts').doc(promptId);
  const doc = await promptRef.get();

  if (!doc.exists) throw new Error('Prompt not found');
  if (doc.data()?.userId !== userId) throw new Error('Unauthorized');

  await promptRef.delete();
  
  await Promise.all([
    revalidateUserPrompts(userId),
    revalidatePrompt(promptId)
  ]);
}

/**
 * Syncs the user profile using the Admin SDK.
 * Creates a new profile if it doesn't exist.
 */
export async function syncUserProfileAction(profileData: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  const userId = await getSessionUserId();
  if (!userId || userId !== profileData.uid) throw new Error('Unauthorized');

  const db = await getAdminDb();
  const admin = await import('firebase-admin');
  const userRef = db.collection('users').doc(userId);
  const doc = await userRef.get();

  if (!doc.exists) {
    const newProfile = {
      ...profileData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await userRef.set(newProfile);
  } else {
    await userRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Optionally update other fields like photoURL or displayName if they changed
      email: profileData.email,
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
    });
  }

  await revalidateUserProfile(userId);
}