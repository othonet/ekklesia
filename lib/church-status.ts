import { prisma } from './prisma'

/**
 * Verifica se o sistema está habilitado para uma igreja
 * Se systemEnabled = false, bloqueia acesso total (web + app)
 */
export async function isSystemEnabled(churchId: string): Promise<boolean> {
  try {
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { systemEnabled: true },
    })

    // Se não encontrar a igreja ou systemEnabled for false, bloqueia
    return church?.systemEnabled ?? false
  } catch (error) {
    console.error('Erro ao verificar status do sistema:', error)
    // Em caso de erro, por segurança, bloqueia o acesso
    return false
  }
}

