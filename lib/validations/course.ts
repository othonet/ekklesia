import { z } from 'zod'

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional().or(z.literal('')),
  duration: z.number().int().positive().optional().or(z.null()),
  active: z.boolean().optional(),
})

export const updateCourseSchema = createCourseSchema.partial()

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>

