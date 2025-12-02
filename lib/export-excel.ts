import * as XLSX from 'xlsx'

export interface ExportData {
  sheetName: string
  data: any[]
  headers?: string[]
}

/**
 * Exporta dados para Excel
 */
export function exportToExcel(
  exports: ExportData[],
  filename: string = 'relatorio'
) {
  const workbook = XLSX.utils.book_new()

  exports.forEach(({ sheetName, data, headers }) => {
    // Se headers fornecidos, usar; senão, usar as chaves do primeiro objeto
    const worksheetData = headers
      ? [headers, ...data.map(row => headers.map(h => row[h] || ''))]
      : data

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  // Gerar arquivo
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

/**
 * Exporta relatório completo de analytics
 */
export function exportAnalyticsReport(analytics: any) {
  const exports: ExportData[] = []

  // 1. Resumo Geral
  exports.push({
    sheetName: 'Resumo',
    data: [
      { Indicador: 'Total de Membros', Valor: analytics.members.total },
      { Indicador: 'Membros Ativos', Valor: analytics.members.active },
      { Indicador: 'Taxa de Crescimento', Valor: `${analytics.members.growthRate}%` },
      { Indicador: 'Total de Receitas', Valor: analytics.finances.totalIncome },
      { Indicador: 'Total de Despesas', Valor: analytics.finances.totalExpenses },
      { Indicador: 'Saldo', Valor: analytics.finances.balance },
      { Indicador: 'Total de Doações', Valor: analytics.finances.totalDonations },
      { Indicador: 'Total de Presenças', Valor: analytics.attendance.total },
      { Indicador: 'Média de Presenças', Valor: analytics.attendance.average },
    ],
  })

  // 2. Crescimento de Membros
  exports.push({
    sheetName: 'Crescimento Membros',
    headers: ['Mês', 'Novos Membros'],
    data: analytics.members.growthByMonth.map((m: any) => ({
      'Mês': m.month,
      'Novos Membros': m.count,
    })),
  })

  // 3. Membros por Status
  exports.push({
    sheetName: 'Membros por Status',
    headers: ['Status', 'Quantidade'],
    data: analytics.members.byStatus.map((s: any) => ({
      'Status': s.status,
      'Quantidade': s.count,
    })),
  })

  // 4. Presenças por Mês
  exports.push({
    sheetName: 'Presenças',
    headers: ['Mês', 'Total de Presenças'],
    data: analytics.attendance.byMonth.map((a: any) => ({
      'Mês': a.month,
      'Total de Presenças': a.count,
    })),
  })

  // 5. Membros Mais Frequentes
  exports.push({
    sheetName: 'Membros Mais Frequentes',
    headers: ['Membro', 'Presenças'],
    data: analytics.attendance.mostFrequent.map((m: any) => ({
      'Membro': m.memberName,
      'Presenças': m.count,
    })),
  })

  // 6. Finanças por Mês
  exports.push({
    sheetName: 'Finanças Mensais',
    headers: ['Mês', 'Receitas', 'Despesas', 'Doações', 'Saldo'],
    data: analytics.finances.byMonth.map((f: any) => ({
      'Mês': f.month,
      'Receitas': f.income,
      'Despesas': f.expenses,
      'Doações': f.donations,
      'Saldo': f.income - f.expenses,
    })),
  })

  // 7. Top Doadores
  exports.push({
    sheetName: 'Top Doadores',
    headers: ['Membro', 'Total Doado'],
    data: analytics.finances.topDonors.map((d: any) => ({
      'Membro': d.memberName,
      'Total Doado': d.total,
    })),
  })

  exportToExcel(exports, 'relatorio_analytics')
}

