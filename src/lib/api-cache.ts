'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import type { Prompt, UserProfile } from './types';
import { PromptSchema } from './schemas';
import { getAdminDb } from './firebase-admin';

/**
 * Ensures an object is a clean, serializable plain object.
 */
function toPlainObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

function mapToPrompt(doc: any): Prompt {
    const data = doc.data();
    if (!data) throw new Error(`Document ${doc.id} has no data`);
    
    const promptData = {
        id: String(doc.id),
        title: String(data.title || ''),
        content: String(data.content || ''),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        userId: String(data.userId || ''),
        isTemplate: Boolean(data.isTemplate),
        fields: Array.isArray(data.fields) ? data.fields.map((f: any) => ({
            id: String(f.id),
            name: String(f.name),
            type: String(f.type) as any,
            options: Array.isArray(f.options) ? f.options.map(String) : undefined,
        })) : [],
        createdAt: data.createdAt ? {
            seconds: Number(data.createdAt._seconds ?? data.createdAt.seconds),
            nanoseconds: Number(data.createdAt._nanoseconds ?? data.createdAt.nanoseconds),
        } : null,
    };

    return PromptSchema.parse(promptData);
}

export async function getUserProfileCached(userId: string): Promise<UserProfile | null> {
    cacheLife('days');
    cacheTag(`user-profile-${userId}`);

    try {
        const db = await getAdminDb();
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) return null;
        
        const data = doc.data();
        if (!data) return null;

        const profile = {
            uid: String(userId),
            email: data.email ? String(data.email) : null,
            displayName: data.displayName ? String(data.displayName) : null,
            photoURL: data.photoURL ? String(data.photoURL) : null,
            createdAt: data.createdAt ? {
                seconds: Number(data.createdAt._seconds ?? data.createdAt.seconds),
                nanoseconds: Number(data.createdAt._nanoseconds ?? data.createdAt.nanoseconds),
            } : null,
            updatedAt: data.updatedAt ? {
                seconds: Number(data.updatedAt._seconds ?? data.updatedAt.seconds),
                nanoseconds: Number(data.updatedAt._nanoseconds ?? data.updatedAt.nanoseconds),
            } : null,
        };

        return toPlainObject(profile as UserProfile);
    } catch (error) {
        console.error("[Server Cache] Error fetching profile:", error);
        return null;
    }
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

    const prompts = snapshot.docs.map(mapToPrompt);
    return toPlainObject(prompts);
  } catch (error) {
    console.error("[Server Cache] Error fetching prompts:", error);
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
        
        return toPlainObject(mapToPrompt(doc));
    } catch (error) {
        console.error("[Server Cache] Error fetching prompt by id:", error);
        return null;
    }
}
