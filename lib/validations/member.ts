import { z } from 'zod'

// Helper para transformar strings vazias em null
const emptyStringToNull = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null
  if (typeof val === 'string' && val.trim() === '') return null
  return val
}, z.string().nullable().optional())

// Helper para validar CPF (aceita com ou sem formatação)
const cpfSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null
  if (typeof val === 'string') {
    // Remover formatação (pontos e traços)
    const cleaned = val.replace(/[.-]/g, '')
    return cleaned === '' ? null : cleaned
  }
  return val
}, z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').nullable().optional())

// Helper para validar CEP
const zipCodeSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null
  if (typeof val === 'string' && val.trim() === '') return null
  return val
}, z.union([
  z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  z.literal(null),
  z.literal(''),
]).nullable().optional())

// Helper para validar email (aceita vazio ou email válido)
const emailSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return null
  if (typeof val === 'string' && val.trim() === '') return null
  return val
}, z.string().email('Email inválido').nullable().optional())

export const createMemberSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: emailSchema,
  phone: emptyStringToNull,
  phone2: emptyStringToNull,
  birthDate: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    if (typeof val === 'string' && val.trim() === '') return null
    return val
  }, z.string().nullable().optional()),
  address: emptyStringToNull,
  city: emptyStringToNull,
  state: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return null
    if (typeof val === 'string' && val.trim() === '') return null
    return typeof val === 'string' ? val.toUpperCase() : val
  }, z.string().max(2, 'Estado deve ter 2 caracteres').nullable().optional()),
  zipCode: zipCodeSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'VISITOR']).optional().default('ACTIVE'),
  cpf: cpfSchema,
  rg: emptyStringToNull,
  maritalStatus: emptyStringToNull,
  profession: emptyStringToNull,
  education: emptyStringToNull,
  emergencyContact: emptyStringToNull,
  emergencyPhone: emptyStringToNull,
  notes: emptyStringToNull,
  dataConsent: z.boolean().refine((val) => val === true, {
    message: 'É necessário confirmar a adequação ao tratamento de dados pessoais (LGPD)',
  }),
})

export const updateMemberSchema = createMemberSchema.partial().extend({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  dataConsent: z.boolean().optional(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>

