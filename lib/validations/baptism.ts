import { z } from 'zod'

export const createBaptismSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  location: z.string().optional().or(z.literal('')),
  minister: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export const updateBaptismSchema = createBaptismSchema.partial().extend({
  date: z.string().min(1, 'Data é obrigatória').optional(),
})

export type CreateBaptismInput = z.infer<typeof createBaptismSchema>
export type UpdateBaptismInput = z.infer<typeof updateBaptismSchema>

