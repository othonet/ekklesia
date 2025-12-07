// Gateway de pagamento simulado para testes
// Em produção, substitua por uma integração real (Stripe, Mercado Pago, etc.)

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_SLIP = 'BANK_SLIP',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface PaymentRequest {
  amount: number
  method: PaymentMethod
  payerName?: string
  payerEmail?: string
  payerPhone?: string
  payerDocument?: string
  description?: string
}

export interface PaymentResponse {
  id: string
  status: PaymentStatus
  pixCode?: string
  pixExpiresAt?: Date
  bankSlipUrl?: string
  bankSlipBarcode?: string
  bankSlipExpiresAt?: Date
  gatewayResponse?: any
}

// Simula criação de pagamento
export async function createPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500))

  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  if (request.method === PaymentMethod.PIX) {
    // Gera código PIX simulado
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${paymentId}520400005303986540${request.amount.toFixed(2)}5802BR5925IGREJA TESTE LTDA6009SAO PAULO62070503***6304`
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Expira em 1 hora

    return {
      id: paymentId,
      status: PaymentStatus.PENDING,
      pixCode,
      pixExpiresAt: expiresAt,
      gatewayResponse: {
        method: 'PIX',
        qrCode: pixCode,
        expiresAt: expiresAt.toISOString(),
      },
    }
  }

  if (request.method === PaymentMethod.BANK_SLIP) {
    // Gera boleto simulado
    const barcode = `34191.${Math.floor(Math.random() * 10000).toString().padStart(5, '0')} ${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}.${Math.floor(Math.random() * 100000).toString().padStart(5, '0')} ${Math.floor(Math.random() * 100000).toString().padStart(5, '0')} ${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 3) // Expira em 3 dias

    return {
      id: paymentId,
      status: PaymentStatus.PENDING,
      bankSlipUrl: `https://example.com/boleto/${paymentId}`,
      bankSlipBarcode: barcode.replace(/\s/g, ''),
      bankSlipExpiresAt: expiresAt,
      gatewayResponse: {
        method: 'BANK_SLIP',
        barcode,
        expiresAt: expiresAt.toISOString(),
      },
    }
  }

  if (request.method === PaymentMethod.CREDIT_CARD || request.method === PaymentMethod.DEBIT_CARD) {
    // Simula processamento de cartão (em produção, aqui seria a chamada real ao gateway)
    // Para testes, vamos simular sucesso após alguns segundos
    return {
      id: paymentId,
      status: PaymentStatus.PROCESSING,
      gatewayResponse: {
        method: request.method,
        processing: true,
      },
    }
  }

  throw new Error('Método de pagamento não suportado')
}

// Simula verificação de status do pagamento
export async function checkPaymentStatus(paymentId: string): Promise<PaymentResponse | null> {
  // Em produção, isso consultaria o gateway real
  // Para testes, retorna null (pagamento não encontrado) ou simula status
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Simulação: se o ID contém "completed", retorna como completo
  if (paymentId.includes('completed')) {
    return {
      id: paymentId,
      status: PaymentStatus.COMPLETED,
    }
  }
  
  return null
}

// Simula webhook de confirmação de pagamento
export async function simulatePaymentConfirmation(paymentId: string): Promise<boolean> {
  // Em produção, isso seria chamado pelo gateway via webhook
  // Para testes, simula confirmação após delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  return true
}

