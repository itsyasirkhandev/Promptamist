'use server';

import { updateTag } from 'next/cache';
import type { UserProfile, Prompt } from './types';

/**
 * Revalidates the cache for a specific user's prompts.
 * This can be called from the client after a mutation.
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
 * Server action to ensure a user profile exists in Firestore using the Admin SDK.
 * This bypasses client-side Security Rules propagation delays.
 */
export async function syncUserProfile(userData: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): Promise<UserProfile | null> {
    const admin = await import('firebase-admin');
    
    // Lazy init admin (matches api-cache.ts logic)
    if (!admin.apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (privateKey && clientEmail) {
            let formattedKey = privateKey.replace(/\\n/g, '\n');
            if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) formattedKey = formattedKey.slice(1, -1);
            if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) formattedKey = formattedKey.slice(1, -1);
            
            admin.initializeApp({
                credential: admin.credential.cert({ projectId, clientEmail, privateKey: formattedKey }),
            });
        } else {
            admin.initializeApp({ projectId });
        }
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userData.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
        const newProfile = {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            photoURL: userData.photoURL,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await userRef.set(newProfile);
        updateTag(`user-profile-${userData.uid}`);
        
        // Return a serializable version of the new profile
        return {
            ...newProfile,
            createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
            updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        } as unknown as UserProfile;
    }

    const data = doc.data();
    return {
        uid: userData.uid,
        email: data?.email || null,
        displayName: data?.displayName || null,
        photoURL: data?.photoURL || null,
        firstName: data?.firstName || null,
        lastName: data?.lastName || null,
        createdAt: data?.createdAt ? {
            seconds: data.createdAt._seconds !== undefined ? data.createdAt._seconds : data.createdAt.seconds,
            nanoseconds: data.createdAt._nanoseconds !== undefined ? data.createdAt._nanoseconds : data.createdAt.nanoseconds,
        } : null,
        updatedAt: data?.updatedAt ? {
            seconds: data.updatedAt._seconds !== undefined ? data.updatedAt._seconds : data.updatedAt.seconds,
            nanoseconds: data.updatedAt._nanoseconds !== undefined ? data.updatedAt._nanoseconds : data.updatedAt.nanoseconds,
        } : null,
    } as UserProfile;
}

/**
 * Server action to create a new prompt using the Admin SDK.
 */
export async function createPrompt(userId: string, promptData: Omit<Prompt, 'id' | 'createdAt' | 'userId'>): Promise<Prompt> {
    const admin = await import('firebase-admin');
    const db = admin.firestore();
    
    const newPromptData = {
        ...promptData,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('prompts').add(newPromptData);
    updateTag(`prompts-user-${userId}`);
    
    return {
        ...newPromptData,
        id: docRef.id,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    } as unknown as Prompt;
}

/**
 * Server action to update an existing prompt using the Admin SDK.
 */
export async function updatePromptAction(promptId: string, userId: string, updatedData: Partial<Omit<Prompt, 'id' | 'userId'>>) {
    const admin = await import('firebase-admin');
    const db = admin.firestore();
    
    // Safety check: Ensure the prompt belongs to the user
    const docRef = db.collection('prompts').doc(promptId);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Unauthorized: You do not own this prompt.");
    }

    await docRef.update(updatedData);
    
    updateTag(`prompts-user-${userId}`);
    updateTag(`prompt-${promptId}`);
    
    return true;
}

/**
 * Server action to delete a prompt using the Admin SDK.
 */
export async function deletePromptAction(promptId: string, userId: string) {
    const admin = await import('firebase-admin');
    const db = admin.firestore();
    
    // Safety check: Ensure the prompt belongs to the user
    const docRef = db.collection('prompts').doc(promptId);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data()?.userId !== userId) {
        throw new Error("Unauthorized: You do not own this prompt.");
    }

    await docRef.delete();
    
    updateTag(`prompts-user-${userId}`);
    updateTag(`prompt-${promptId}`);
    
    return true;
}