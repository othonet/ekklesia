import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  churchId?: string
  isPlatformAdmin?: boolean
}

export interface MemberJWTPayload {
  memberId: string
  email: string
  churchId: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.')
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions)
}

export function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET não configurado')
    return null
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JWTPayload
    return decoded
  } catch (error: any) {
    console.error('Erro ao verificar token:', error.message)
    return null
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: any; token: string } | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { church: true },
    })

    if (!user || !user.active) {
      return null
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return null
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      churchId: user.churchId || undefined,
      isPlatformAdmin: user.isPlatformAdmin || false,
    })

    const { password: _, ...userWithoutPassword } = user

    return {
      user: {
        ...userWithoutPassword,
        isPlatformAdmin: user.isPlatformAdmin || false,
      },
      token,
    }
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error)
    throw error
  }
}

export function generateMemberToken(payload: MemberJWTPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente JWT_SECRET.')
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions)
}

export function verifyMemberToken(token: string): MemberJWTPayload | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET não configurado')
    return null
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as MemberJWTPayload
    return decoded
  } catch (error: any) {
    console.error('Erro ao verificar token de membro:', error.message)
    return null
  }
}

export async function authenticateMember(
  email: string,
  password: string
): Promise<{ member: any; token: string } | null> {
  try {
    // Normalizar email para lowercase (garantir busca case-insensitive)
    const normalizedEmail = email.trim().toLowerCase()
    
    // Tentar buscar com email normalizado primeiro
    let member = await prisma.member.findUnique({
      where: { email: normalizedEmail },
      include: { church: true },
    })

    // Se não encontrou, fazer busca case-insensitive usando SQL raw
    // Isso garante compatibilidade mesmo se o email estiver em maiúsculas no banco
    if (!member) {
      const members = await prisma.$queryRaw<Array<{
        id: string
        email: string | null
        password: string | null
        deletedAt: Date | null
        churchId: string
      }>>`
        SELECT id, email, password, deletedAt, churchId
        FROM members
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(${normalizedEmail}))
        AND deletedAt IS NULL
        LIMIT 1
      `
      
      if (members && members.length > 0) {
        const memberData = members[0]
        // Buscar membro completo com relacionamentos
        member = await prisma.member.findUnique({
          where: { id: memberData.id },
          include: { church: true },
        })
      }
    }

    if (!member || member.deletedAt) {
      console.log('Membro não encontrado ou deletado para email:', normalizedEmail)
      return null
    }

    if (!member.password) {
      console.log('Membro não tem senha definida:', normalizedEmail)
      return null
    }

    const isValid = await verifyPassword(password, member.password)

    if (!isValid) {
      console.log('Senha inválida para email:', normalizedEmail)
      return null
    }

    const token = generateMemberToken({
      memberId: member.id,
      email: member.email!,
      churchId: member.churchId,
    })

    const { password: _, ...memberWithoutPassword } = member

    return {
      member: memberWithoutPassword,
      token,
    }
  } catch (error) {
    console.error('Erro ao autenticar membro:', error)
    throw error
  }
}

