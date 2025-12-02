/**
 * Script para deletar doações antigas do banco de dados
 * 
 * Este script remove todas as doações que não têm paymentId associado,
 * já que agora tudo está unificado na tabela Finance.
 * 
 * Execute com: node scripts/delete-old-donations.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteOldDonations() {
  try {
    console.log('Buscando doações antigas (sem paymentId)...')
    
    // Buscar todas as doações que não têm paymentId
    const oldDonations = await prisma.donation.findMany({
      where: {
        paymentId: null,
      },
      select: {
        id: true,
        amount: true,
        date: true,
        type: true,
        churchId: true,
      },
    })

    console.log(`Encontradas ${oldDonations.length} doações antigas`)

    if (oldDonations.length === 0) {
      console.log('Nenhuma doação antiga encontrada. Nada a fazer.')
      return
    }

    // Mostrar resumo
    const totalAmount = oldDonations.reduce((sum, d) => sum + Number(d.amount), 0)
    console.log(`\nResumo:`)
    console.log(`- Total de doações: ${oldDonations.length}`)
    console.log(`- Valor total: R$ ${totalAmount.toFixed(2)}`)
    console.log(`\nIgrejas afetadas:`)
    
    const byChurch = oldDonations.reduce((acc, d) => {
      acc[d.churchId] = (acc[d.churchId] || 0) + 1
      return acc
    }, {})
    
    Object.entries(byChurch).forEach(([churchId, count]) => {
      console.log(`  - Igreja ${churchId}: ${count} doações`)
    })

    // Confirmar antes de deletar
    console.log('\n⚠️  ATENÇÃO: Esta operação é irreversível!')
    console.log('As doações antigas serão permanentemente deletadas.')
    console.log('\nPara confirmar, execute novamente com o parâmetro --confirm')
    console.log('Exemplo: node scripts/delete-old-donations.js --confirm')

    // Verificar se foi passado o parâmetro --confirm
    const args = process.argv.slice(2)
    if (!args.includes('--confirm')) {
      console.log('\n❌ Operação cancelada. Use --confirm para executar.')
      return
    }

    console.log('\n🗑️  Deletando doações antigas...')

    // Deletar todas as doações antigas
    const result = await prisma.donation.deleteMany({
      where: {
        paymentId: null,
      },
    })

    console.log(`\n✅ ${result.count} doações deletadas com sucesso!`)
    console.log('\nAs doações que tinham paymentId (pagamentos online) foram preservadas.')

  } catch (error) {
    console.error('❌ Erro ao deletar doações:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
deleteOldDonations()
  .then(() => {
    console.log('\n✨ Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })

