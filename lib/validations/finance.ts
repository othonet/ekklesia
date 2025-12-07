import { z } from 'zod'

export const createFinanceSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição deve ter no máximo 255 caracteres'),
  amount: z.number().positive('Valor deve ser positivo').or(z.string().transform((val) => {
    const num = parseFloat(val)
    if (isNaN(num) || num <= 0) throw new Error('Valor inválido')
    return num
  })),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Tipo deve ser INCOME ou EXPENSE' }),
  }),
  category: z.string().optional().or(z.literal('')),
  date: z.string().min(1, 'Data é obrigatória'),
  donationType: z.enum(['TITHE', 'OFFERING', 'CONTRIBUTION']).optional().or(z.literal('')),
  method: z.string().optional().or(z.literal('')),
  memberId: z.string().optional().or(z.literal('')),
  paymentId: z.string().optional().or(z.literal('')),
})

export const updateFinanceSchema = createFinanceSchema.partial()

export type CreateFinanceInput = z.infer<typeof createFinanceSchema>
export type UpdateFinanceInput = z.infer<typeof updateFinanceSchema>

