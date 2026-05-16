import { z } from 'zod';

export const businessSchema = z.object({
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(120),
  shortDescription: z.string().max(180).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp: z.string().max(40).optional().or(z.literal('')),
  instagram: z.string().max(80).optional().or(z.literal('')),
  facebook: z.string().max(120).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  district: z.string().max(80).optional().or(z.literal('')),
  lat: z.coerce.number().min(-90).max(90).optional().or(z.literal('').transform(() => undefined)),
  lng: z.coerce.number().min(-180).max(180).optional().or(z.literal('').transform(() => undefined)),
  priceRange: z.enum(['CHEAP', 'MID', 'HIGH', 'LUXURY']).optional().or(z.literal('').transform(() => undefined)),
  tagKeys: z.array(z.string()).optional().default([]),
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: z.string().regex(/^\d{2}:\d{2}$/),
        closeTime: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .optional()
    .default([]),
});

export type BusinessInput = z.infer<typeof businessSchema>;
