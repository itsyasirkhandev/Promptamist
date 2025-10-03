import type { Timestamp } from 'firebase/firestore';

export type PromptFieldType = 'text' | 'textarea' | 'number' | 'choices';

export type PromptField = {
  id: string;
  name: string;
  type: PromptFieldType;
  options?: string[];
};

export type Prompt = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Timestamp;
  userId: string;
  isTemplate?: boolean;
  fields?: PromptField[];
};
