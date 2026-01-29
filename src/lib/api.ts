'use server';

// Re-exporting cached functions for server-side use
import { getPromptsCached, getPromptByIdCached, getUserProfileCached } from './api-cache';
import type { Prompt, UserProfile } from './types';

export async function getPrompts(userId: string): Promise<Prompt[]> {
    return getPromptsCached(userId);
}

export async function getPromptById(id: string): Promise<Prompt | null> {
    return getPromptByIdCached(id);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    return getUserProfileCached(userId);
}
