'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import type { Prompt } from './types';

async function getAdminDb() {
    const admin = await import('firebase-admin');
    
    if (!admin.apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (privateKey && clientEmail) {
            // Robust private key parsing
            let formattedKey = privateKey;
            
            // Remove surrounding quotes if they exist
            if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
                formattedKey = formattedKey.slice(1, -1);
            }
            if (formattedKey.startsWith("'") && formattedKey.endsWith("'")) {
                formattedKey = formattedKey.slice(1, -1);
            }
            
            // Replace escaped newlines with actual newlines
            formattedKey = formattedKey.replace(/\\n/g, '\n');

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: formattedKey,
                }),
            });
        } else {
            console.warn("[Server Cache] Missing Admin credentials, falling back to default (may fail)");
            admin.initializeApp({
                projectId: projectId,
            });
        }
    }
    return admin.firestore();
}

export async function getPromptsCached(userId: string): Promise<Prompt[]> {
  cacheLife('minutes');
  cacheTag(`prompts-user-${userId}`);

  try {
    const db = await getAdminDb();
    const snapshot = await db
      .collection('prompts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Convert Admin Timestamp to serializable object
            createdAt: data.createdAt ? {
                seconds: data.createdAt._seconds !== undefined ? data.createdAt._seconds : data.createdAt.seconds,
                nanoseconds: data.createdAt._nanoseconds !== undefined ? data.createdAt._nanoseconds : data.createdAt.nanoseconds,
            } : null,
        } as any;
    });
  } catch (error) {
    console.error("[Server Cache] Error fetching prompts with Admin SDK:", error);
    // Return empty array so the client-side fallback can take over
    return [];
  }
}

export async function getPromptByIdCached(id: string): Promise<Prompt | null> {
    cacheLife('minutes');
    cacheTag(`prompt-${id}`);

    try {
        const db = await getAdminDb();
        const doc = await db.collection('prompts').doc(id).get();
        if (!doc.exists) return null;
        
        const data = doc.data();
        if (!data) return null;

        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? {
                seconds: data.createdAt._seconds !== undefined ? data.createdAt._seconds : data.createdAt.seconds,
                nanoseconds: data.createdAt._nanoseconds !== undefined ? data.createdAt._nanoseconds : data.createdAt.nanoseconds,
            } : null,
        } as any;
    } catch (error) {
        console.error("[Server Cache] Error fetching prompt by id with Admin SDK:", error);
        return null;
    }
}