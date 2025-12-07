import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { checkPaymentStatus, simulatePaymentConfirmation, PaymentStatus } from '@/lib/payment-gateway'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await Promise.resolve(params)

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        donations: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    const paymentData = {
      ...payment,
      amount: Number(payment.amount),
    }

    return NextResponse.json(paymentData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Webhook para confirmar pagamento (simulado)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await Promise.resolve(params)
    const body = await request.json()
    const { action } = body

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        churchId: user.churchId,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    if (action === 'confirm') {
      // Simula confirmação de pagamento
      const confirmed = await simulatePaymentConfirmation(payment.gatewayId || id)
      
      if (confirmed) {
        // Atualiza status do pagamento
        const updatedPayment = await prisma.payment.update({
          where: { id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
        })

        // Verifica se já existe doação associada
        const existingDonation = await prisma.donation.findFirst({
          where: { paymentId: payment.id },
        })

        if (!existingDonation) {
          // Cria doação associada ao pagamento
          const donation = await prisma.donation.create({
            data: {
              amount: payment.amount,
              date: new Date(),
              method: payment.method,
              type: payment.donationType,
              notes: payment.description || `Pagamento online via ${payment.method}`,
              memberId: payment.memberId,
              churchId: payment.churchId,
              paymentId: payment.id,
            },
          })

          // Criar registro em Finance como receita (unificação)
          const donationDescription = payment.description || 
            (payment.donationType === 'TITHE' ? 'Dízimo' : 
             payment.donationType === 'OFFERING' ? 'Oferta' : 
             'Contribuição')

          await prisma.finance.create({
            data: {
              description: `${donationDescription} - Pagamento online`,
              amount: payment.amount,
              type: 'INCOME',
              category: payment.donationType,
              date: new Date(),
              donationType: payment.donationType,
              method: payment.method,
              memberId: payment.memberId,
              paymentId: payment.id,
              churchId: payment.churchId,
            },
          })
        } else {
          // Atualiza doação existente
          await prisma.donation.update({
            where: { id: existingDonation.id },
            data: {
              amount: payment.amount,
              method: payment.method,
            },
          })
        }

        const paymentData = {
          ...updatedPayment,
          amount: Number(updatedPayment.amount),
        }

        return NextResponse.json(paymentData)
      }
    }

    if (action === 'check') {
      // Verifica status no gateway
      const gatewayStatus = await checkPaymentStatus(payment.gatewayId || id)
      
      if (gatewayStatus && gatewayStatus.status === PaymentStatus.COMPLETED) {
        const updatedPayment = await prisma.payment.update({
          where: { id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
        })

        return NextResponse.json({
          ...updatedPayment,
          amount: Number(updatedPayment.amount),
        })
      }
    }

    return NextResponse.json({
      ...payment,
      amount: Number(payment.amount),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

