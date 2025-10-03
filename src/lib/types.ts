import type { Timestamp } from 'firebase/firestore';

export type Prompt = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Timestamp;
  userId: string;
};
