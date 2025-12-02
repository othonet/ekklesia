// Funções utilitárias compartilhadas para relatórios financeiros

export interface FinancialData {
  finances: Array<{ type: string; amount: any; date: Date; category: string | null }>
  donations: Array<{ amount: any; date: Date; type: string | null; memberId: string | null; member?: { name: string } | null }>
  payments: Array<{ amount: any; paidAt: Date | null; method: string; memberId: string | null; member?: { name: string } | null }>
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  totalDonations: number
  totalPayments: number
  balance: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage?: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  donations: number
}

export function calculateFinancialSummary(data: FinancialData): FinancialSummary {
  const totalIncome = data.finances
    .filter((f) => f.type === 'INCOME')
    .reduce((sum, f) => sum + Number(f.amount), 0)

  const totalExpenses = data.finances
    .filter((f) => f.type === 'EXPENSE')
    .reduce((sum, f) => sum + Number(f.amount), 0)

  const totalDonations = data.donations.reduce((sum, d) => sum + Number(d.amount), 0)
  const totalPayments = data.payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const balance = totalIncome + totalDonations + totalPayments - totalExpenses

  return {
    totalIncome,
    totalExpenses,
    totalDonations,
    totalPayments,
    balance,
  }
}

export function calculateExpensesByCategory(
  finances: FinancialData['finances'],
  includePercentage = false
): CategoryData[] {
  const expensesByCategory: Record<string, number> = {}
  const totalExpenses = finances
    .filter((f) => f.type === 'EXPENSE')
    .reduce((sum, f) => sum + Number(f.amount), 0)

  finances
    .filter((f) => f.type === 'EXPENSE')
    .forEach((f) => {
      const category = f.category || (includePercentage ? 'Outras' : 'Sem categoria')
      expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(f.amount)
    })

  return Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      ...(includePercentage && {
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }),
    }))
}

export function calculateDonationsByType(
  donations: FinancialData['donations']
): Array<{ type: string; amount: number }> {
  const donationsByType: Record<string, number> = {}
  donations.forEach((d) => {
    const type = d.type || 'OFFERING'
    donationsByType[type] = (donationsByType[type] || 0) + Number(d.amount)
  })

  return Object.entries(donationsByType).map(([type, amount]) => ({
    type,
    amount,
  }))
}

export function calculatePaymentsByMethod(
  payments: FinancialData['payments']
): Array<{ method: string; amount: number }> {
  const paymentsByMethod: Record<string, number> = {}
  payments.forEach((p) => {
    paymentsByMethod[p.method] = (paymentsByMethod[p.method] || 0) + Number(p.amount)
  })

  return Object.entries(paymentsByMethod).map(([method, amount]) => ({
    method,
    amount,
  }))
}

export function calculateMonthlyData(
  data: FinancialData,
  monthsToShow = 12
): MonthlyData[] {
  const now = new Date()
  const monthlyData: Record<string, { income: number; expenses: number; donations: number }> = {}

  // Inicializar meses
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
    monthlyData[month] = { income: 0, expenses: 0, donations: 0 }
  }

  // Processar finanças
  data.finances.forEach((f) => {
    const month = new Date(f.date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
    if (monthlyData[month]) {
      if (f.type === 'INCOME') {
        monthlyData[month].income += Number(f.amount)
      } else {
        monthlyData[month].expenses += Number(f.amount)
      }
    }
  })

  // Processar doações
  data.donations.forEach((d) => {
    const month = new Date(d.date).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
    if (monthlyData[month]) {
      monthlyData[month].donations += Number(d.amount)
    }
  })

  // Processar pagamentos
  data.payments.forEach((p) => {
    if (p.paidAt) {
      const month = new Date(p.paidAt).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit' })
      if (monthlyData[month]) {
        monthlyData[month].donations += Number(p.amount)
      }
    }
  })

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
    }))
}

export function calculateTopDonors(
  donations: FinancialData['donations'],
  payments: FinancialData['payments'],
  limit = 10
): Array<{ memberId: string; memberName: string; total: number }> {
  const donorTotals: Record<string, { name: string; total: number }> = {}

  donations.forEach((d) => {
    if (d.memberId && d.member) {
      if (!donorTotals[d.memberId]) {
        donorTotals[d.memberId] = { name: d.member.name, total: 0 }
      }
      donorTotals[d.memberId].total += Number(d.amount)
    }
  })

  payments.forEach((p) => {
    if (p.memberId && p.member) {
      if (!donorTotals[p.memberId]) {
        donorTotals[p.memberId] = { name: p.member.name, total: 0 }
      }
      donorTotals[p.memberId].total += Number(p.amount)
    }
  })

  return Object.entries(donorTotals)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, limit)
    .map(([memberId, data]) => ({
      memberId,
      memberName: data.name,
      total: data.total,
    }))
}

