'use server';

import { getPromptsCached, getPromptByIdCached } from './api-cache';
import type { Prompt } from './types';

export async function getPrompts(userId: string): Promise<Prompt[]> {
    return getPromptsCached(userId);
}

export async function getPromptById(id: string): Promise<Prompt | null> {
    return getPromptByIdCached(id);
}