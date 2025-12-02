import { z } from 'zod'

// Helper para transformar strings vazias em null
const emptyStringToNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null
  if (typeof val === 'string' && val.trim() === '') return null
  return val
}, z.string().nullable().optional())

// Helper para transformar strings vazias em null para números
const emptyStringToNullNumber = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null
  if (typeof val === 'string' && val.trim() === '') return null
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? null : parsed
  }
  return typeof val === 'number' ? val : null
}, z.number().nonnegative('Valor deve ser positivo').nullable().optional())

// Schema base sem refine para update
const baseAssetSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome deve ter no máximo 200 caracteres'),
  description: emptyStringToNull,
  category: z.enum(['EQUIPMENT', 'INSTRUMENT', 'PROPERTY', 'FURNITURE', 'VEHICLE', 'TECHNOLOGY', 'OTHER'], {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }),
  type: z.enum([
    'SOUND_SYSTEM', 'VIDEO_SYSTEM', 'LIGHTING', 'PIANO', 'GUITAR', 'DRUMS', 'KEYBOARD',
    'BUILDING', 'LAND', 'CHAIR', 'TABLE', 'PEW', 'CAR', 'VAN', 'BUS',
    'COMPUTER', 'PROJECTOR', 'OTHER'
  ], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
  brand: emptyStringToNull,
  model: emptyStringToNull,
  serialNumber: emptyStringToNull,
  purchaseDate: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    if (typeof val === 'string' && val.trim() === '') return null
    return val
  }, z.string().nullable().optional()),
  purchaseValue: emptyStringToNullNumber,
  currentValue: emptyStringToNullNumber,
  location: emptyStringToNull,
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISPOSED', 'LOST']).optional().default('ACTIVE'),
  condition: z.enum(['EXCELLENT', 'GOOD', 'REGULAR', 'POOR', 'CRITICAL']).optional().default('GOOD'),
  notes: emptyStringToNull,
  address: emptyStringToNull,
  city: emptyStringToNull,
  state: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    if (typeof val === 'string' && val.trim() === '') return null
    return typeof val === 'string' ? val.toUpperCase() : val
  }, z.string().max(2, 'Estado deve ter 2 caracteres').nullable().optional()),
  zipCode: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    if (typeof val === 'string' && val.trim() === '') return null
    return val
  }, z.union([
    z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    z.literal(null),
    z.literal(''),
  ]).nullable().optional()),
  area: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    if (typeof val === 'string' && val.trim() === '') return null
    if (typeof val === 'string') {
      const parsed = parseFloat(val)
      return isNaN(parsed) ? null : parsed
    }
    return typeof val === 'number' ? val : null
  }, z.number().positive('Área deve ser positiva').nullable().optional()),
  responsibleId: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined || val === 'NONE') return null
    return val
  }, z.string().nullable().optional()),
})

export const createAssetSchema = baseAssetSchema.refine((data) => {
  // Validação condicional para imóveis
  if (data.category === 'PROPERTY') {
    if (!data.address || (typeof data.address === 'string' && data.address.trim() === '')) {
      return false
    }
    if (!data.city || (typeof data.city === 'string' && data.city.trim() === '')) {
      return false
    }
  }
  return true
}, {
  message: 'Endereço e cidade são obrigatórios para imóveis',
  path: ['address'],
})

export const updateAssetSchema = baseAssetSchema.partial().extend({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome deve ter no máximo 200 caracteres').optional(),
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>

