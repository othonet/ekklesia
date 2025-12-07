import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { createPayment, PaymentMethod, PaymentStatus } from '@/lib/payment-gateway'

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const memberId = searchParams.get('memberId')

    const where: any = { churchId: user.churchId }
    if (status) where.status = status
    if (memberId) where.memberId = memberId

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

    const paymentsData = payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
    }))

    return NextResponse.json(paymentsData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request)
    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, method, donationType, payerName, payerEmail, payerPhone, payerDocument, description, memberId } = body

    if (!amount || !method) {
      return NextResponse.json(
        { error: 'Valor e método de pagamento são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar pagamento no gateway
    const gatewayResponse = await createPayment({
      amount: parseFloat(amount),
      method: method as PaymentMethod,
      payerName,
      payerEmail,
      payerPhone,
      payerDocument,
      description,
    })

    // Calcular data de expiração
    let expiresAt: Date | null = null
    if (gatewayResponse.pixExpiresAt) {
      expiresAt = gatewayResponse.pixExpiresAt
    } else if (gatewayResponse.bankSlipExpiresAt) {
      expiresAt = gatewayResponse.bankSlipExpiresAt
    } else {
      // Padrão: 24 horas
      expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)
    }

    // Salvar no banco
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        method: method as PaymentMethod,
        status: gatewayResponse.status as PaymentStatus,
        donationType: donationType || 'OFFERING',
        gatewayId: gatewayResponse.id,
        gatewayResponse: JSON.stringify(gatewayResponse.gatewayResponse || {}),
        pixCode: gatewayResponse.pixCode || null,
        pixExpiresAt: gatewayResponse.pixExpiresAt || null,
        bankSlipUrl: gatewayResponse.bankSlipUrl || null,
        bankSlipBarcode: gatewayResponse.bankSlipBarcode || null,
        bankSlipExpiresAt: gatewayResponse.bankSlipExpiresAt || null,
        payerName: payerName || null,
        payerEmail: payerEmail || null,
        payerPhone: payerPhone || null,
        payerDocument: payerDocument || null,
        description: description || null,
        expiresAt,
        memberId: memberId && memberId !== '' ? memberId : null,
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
      },
    })

    const paymentData = {
      ...payment,
      amount: Number(payment.amount),
    }

    return NextResponse.json(paymentData, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

