'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import type { Prompt, UserProfile } from './types';
import { PromptSchema } from './schemas';

export async function getAdminDb() {
    const admin = await import('firebase-admin');
    
    if (!admin.apps.length) {
        if (process.env.FIRESTORE_EMULATOR_HOST) {
            console.log(`[Server Cache] Connecting to Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dev-project',
            });
            return admin.firestore();
        }

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

function mapToPrompt(doc: any): Prompt {
    const data = doc.data();
    if (!data) throw new Error(`Document ${doc.id} has no data`);
    
    // Explicitly construct a plain object with primitive values
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
        // Convert Admin Timestamp to serializable object
        createdAt: data.createdAt ? {
            seconds: Number(data.createdAt._seconds !== undefined ? data.createdAt._seconds : data.createdAt.seconds),
            nanoseconds: Number(data.createdAt._nanoseconds !== undefined ? data.createdAt._nanoseconds : data.createdAt.nanoseconds),
        } : null,
    };

    // JSON parse/stringify is the safest way to ensure NO non-serializable properties (like null prototypes) remain
    return JSON.parse(JSON.stringify(PromptSchema.parse(promptData)));
}

export async function getUserProfileCached(userId: string): Promise<UserProfile | null> {
    console.log(`[use cache] getUserProfileCached called for ${userId.slice(0, 5)}...`);
    cacheLife('days'); // Profiles change very rarely
    cacheTag(`user-profile-${userId}`);

    try {
        const db = await getAdminDb();
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) return null;
        
        const data = doc.data();
        if (!data) return null;

        const profileData = {
            uid: String(userId),
            email: data.email ? String(data.email) : null,
            displayName: data.displayName ? String(data.displayName) : null,
            photoURL: data.photoURL ? String(data.photoURL) : null,
            createdAt: data.createdAt ? {
                seconds: Number(data.createdAt._seconds !== undefined ? data.createdAt._seconds : data.createdAt.seconds),
                nanoseconds: Number(data.createdAt._nanoseconds !== undefined ? data.createdAt._nanoseconds : data.createdAt.nanoseconds),
            } : null,
            updatedAt: data.updatedAt ? {
                seconds: Number(data.updatedAt._seconds !== undefined ? data.updatedAt._seconds : data.updatedAt.seconds),
                nanoseconds: Number(data.updatedAt._nanoseconds !== undefined ? data.updatedAt._nanoseconds : data.updatedAt.nanoseconds),
            } : null,
        };

        return JSON.parse(JSON.stringify(profileData));
    } catch (error) {
        console.error("[Server Cache] Error fetching profile with Admin SDK:", error);
        return null;
    }
}

export async function getPromptsCached(userId: string): Promise<Prompt[]> {
  console.log(`[use cache] getPromptsCached called for ${userId.slice(0, 5)}...`);
  cacheLife('minutes');
  cacheTag(`prompts-user-${userId}`);

  try {
    const db = await getAdminDb();
    const snapshot = await db
      .collection('prompts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    console.log(`[use cache] Admin SDK fetch successful. Count: ${snapshot.docs.length}`);
    return snapshot.docs.map(mapToPrompt);
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
        
        return mapToPrompt(doc);
    } catch (error) {
        console.error("[Server Cache] Error fetching prompt by id with Admin SDK:", error);
        return null;
    }
}