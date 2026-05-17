import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional().or(z.literal('')),
  body: z.string().min(10, 'Mínimo 10 caracteres').max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const replySchema = z.object({
  reply: z.string().min(5, 'Mínimo 5 caracteres').max(1500),
});
