import { z } from 'zod';

export const PromptFieldTypeSchema = z.enum(['text', 'textarea', 'number', 'choices', 'list']);

export const PromptFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Field name is required."),
  type: PromptFieldTypeSchema,
  options: z.array(z.string()).optional(),
});

export const PromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()),
  createdAt: z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  }).nullable(),
  userId: z.string(),
  isTemplate: z.boolean().optional(),
  fields: z.array(PromptFieldSchema).optional(),
});

export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
  createdAt: z.any().optional(), // serverTimestamp
  updatedAt: z.any().optional(),
});

export type PromptFieldType = z.infer<typeof PromptFieldTypeSchema>;
export type PromptField = z.infer<typeof PromptFieldSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
