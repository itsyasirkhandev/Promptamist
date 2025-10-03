"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Prompt } from '@/lib/types';

const PROMPTS_STORAGE_KEY = 'promptcraft-prompts';

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedPrompts = localStorage.getItem(PROMPTS_STORAGE_KEY);
      if (storedPrompts) {
        setPrompts(JSON.parse(storedPrompts));
      }
    } catch (error) {
      console.error("Failed to load prompts from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  const savePrompts = useCallback((newPrompts: Prompt[]) => {
    try {
      // Sort prompts by creation date, newest first
      const sortedPrompts = newPrompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPrompts(sortedPrompts);
      localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(sortedPrompts));
    } catch (error) {
      console.error("Failed to save prompts to localStorage", error);
    }
  }, []);

  const addPrompt = useCallback((prompt: Omit<Prompt, 'id' | 'createdAt'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    // Fetch current prompts from state to avoid stale closure issues
    setPrompts(currentPrompts => {
      const updatedPrompts = [newPrompt, ...currentPrompts];
      savePrompts(updatedPrompts);
      return updatedPrompts;
    });
  }, [savePrompts]);

  return { prompts, addPrompt, isLoaded };
}
