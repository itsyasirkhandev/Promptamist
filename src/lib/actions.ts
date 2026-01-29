'use server';

import { revalidateTag, updateTag } from 'next/cache';

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