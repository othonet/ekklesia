import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  churchId?: string
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
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
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
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyMemberToken(token: string): MemberJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MemberJWTPayload
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
    const member = await prisma.member.findUnique({
      where: { email },
      include: { church: true },
    })

    if (!member || member.deletedAt) {
      return null
    }

    if (!member.password) {
      return null
    }

    const isValid = await verifyPassword(password, member.password)

    if (!isValid) {
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

