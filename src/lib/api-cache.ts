
'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import type { Prompt } from './types';

async function getAdminDb() {
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
    return admin.firestore();
}

export async function getPromptsCached(userId: string): Promise<Prompt[]> {
  console.log(`[Server Cache] getPromptsCached called for: ${userId}`);
  cacheLife('minutes');
  cacheTag(`prompts-user-${userId}`);

  try {
    const db = await getAdminDb();
    const snapshot = await db
      .collection('prompts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    console.log(`[Server Cache] Admin SDK fetched ${snapshot.docs.length} prompts for ${userId}`);
    
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
    return [];
  }
}

export async function getPromptByIdCached(id: string): Promise<Prompt | null> {
    console.log(`[Server Cache] getPromptByIdCached called for: ${id}`);
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
