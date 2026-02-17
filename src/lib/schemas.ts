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
  firstName: z.string().nullable(),
  lastName: z.string().nullable().optional(),
  photoURL: z.string().nullable(),
  createdAt: z.union([
    z.object({ seconds: z.number(), nanoseconds: z.number() }),
    z.any() // Allow FieldValue for writes
  ]).optional(),
  updatedAt: z.union([
    z.object({ seconds: z.number(), nanoseconds: z.number() }),
    z.any()
  ]).optional(),
});

export type PromptFieldType = z.infer<typeof PromptFieldTypeSchema>;
export type PromptField = z.infer<typeof PromptFieldSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export type SignInValues = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().optional(),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export type SignUpValues = z.infer<typeof SignUpSchema>;
