/**
 * Sistema de notificações para LGPD
 * Envia notificações sobre tratamento de dados pessoais
 */

interface NotificationData {
  to: string
  subject: string
  body: string
  type: 'CONSENT_REQUIRED' | 'DATA_EXPORTED' | 'DELETION_SCHEDULED' | 'CONSENT_REMINDER'
}

/**
 * Envia notificação por email
 * Suporta múltiplos serviços: SendGrid, AWS SES, Resend, SMTP
 */
export async function sendNotification(data: NotificationData): Promise<boolean> {
  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const emailFrom = process.env.EMAIL_FROM || 'noreply@ekklesia.local'

    // Substituir placeholders no body
    const body = data.body.replace(/\[URL_DO_SISTEMA\]/g, appUrl)

    // Tentar SendGrid primeiro
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        
        await sgMail.send({
          to: data.to,
          from: emailFrom,
          subject: data.subject,
          text: body,
          html: body.replace(/\n/g, '<br>'),
        })
        
        console.log(`✅ Email enviado via SendGrid para: ${data.to}`)
        return true
      } catch (error: any) {
        console.error('Erro ao enviar via SendGrid:', error.message)
        // Continuar para próximo método
      }
    }

    // Tentar Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        await resend.emails.send({
          from: emailFrom,
          to: data.to,
          subject: data.subject,
          text: body,
        })
        
        console.log(`✅ Email enviado via Resend para: ${data.to}`)
        return true
      } catch (error: any) {
        console.error('Erro ao enviar via Resend:', error.message)
      }
    }

    // Tentar AWS SES
    if (process.env.AWS_SES_REGION && process.env.AWS_ACCESS_KEY_ID) {
      try {
        const AWS = require('aws-sdk')
        const ses = new AWS.SES({
          region: process.env.AWS_SES_REGION,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })
        
        await ses.sendEmail({
          Source: emailFrom,
          Destination: { ToAddresses: [data.to] },
          Message: {
            Subject: { Data: data.subject },
            Body: { Text: { Data: body } },
          },
        }).promise()
        
        console.log(`✅ Email enviado via AWS SES para: ${data.to}`)
        return true
      } catch (error: any) {
        console.error('Erro ao enviar via AWS SES:', error.message)
      }
    }

    // Tentar SMTP (Nodemailer)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const nodemailer = require('nodemailer')
        
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
        
        await transporter.sendMail({
          from: emailFrom,
          to: data.to,
          subject: data.subject,
          text: body,
          html: body.replace(/\n/g, '<br>'),
        })
        
        console.log(`✅ Email enviado via SMTP para: ${data.to}`)
        return true
      } catch (error: any) {
        console.error('Erro ao enviar via SMTP:', error.message)
      }
    }

    // Se nenhum serviço configurado, apenas log (modo desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Notificação (modo desenvolvimento - email não enviado):', {
        to: data.to,
        subject: data.subject,
        type: data.type,
        body: body.substring(0, 100) + '...',
      })
      return true
    }

    // Em produção sem serviço configurado, logar erro
    console.error('❌ Nenhum serviço de email configurado! Configure SENDGRID_API_KEY, RESEND_API_KEY, AWS_SES_REGION ou SMTP_HOST')
    return false
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return false
  }
}

/**
 * Notifica membro sobre necessidade de confirmar consentimento
 */
export async function notifyConsentRequired(memberEmail: string, memberName: string) {
  return sendNotification({
    to: memberEmail,
    subject: 'Confirmação de Consentimento - Tratamento de Dados Pessoais',
    body: `
Olá ${memberName},

Você foi cadastrado no sistema da igreja. Para continuarmos tratando seus dados pessoais, 
é necessário que você confirme seu consentimento.

Por favor, acesse o sistema e confirme seu consentimento na página de Privacidade.

Link: [URL_DO_SISTEMA]/dashboard/privacy

Se você não deseja que seus dados sejam tratados, pode revogar o consentimento a qualquer momento.

Atenciosamente,
Equipe de Gestão
    `.trim(),
    type: 'CONSENT_REQUIRED',
  })
}

/**
 * Notifica sobre exportação de dados
 */
export async function notifyDataExported(memberEmail: string, memberName: string) {
  return sendNotification({
    to: memberEmail,
    subject: 'Exportação de Dados Pessoais Realizada',
    body: `
Olá ${memberName},

Sua solicitação de exportação de dados pessoais foi processada com sucesso.

O arquivo contém todos os seus dados pessoais armazenados no sistema.

IMPORTANTE: Este arquivo contém informações sensíveis. Mantenha-o seguro e não compartilhe.

Atenciosamente,
Equipe de Gestão
    `.trim(),
    type: 'DATA_EXPORTED',
  })
}

/**
 * Notifica sobre exclusão agendada
 */
export async function notifyDeletionScheduled(
  memberEmail: string, 
  memberName: string, 
  deletionDate: Date
) {
  return sendNotification({
    to: memberEmail,
    subject: 'Exclusão de Dados Agendada',
    body: `
Olá ${memberName},

Sua solicitação de exclusão de dados foi recebida.

Seus dados serão permanentemente excluídos em: ${deletionDate.toLocaleDateString('pt-BR')}

Se você mudou de ideia, pode cancelar esta solicitação acessando o sistema antes da data acima.

Atenciosamente,
Equipe de Gestão
    `.trim(),
    type: 'DELETION_SCHEDULED',
  })
}

/**
 * Lembrete anual sobre consentimento
 */
export async function notifyConsentReminder(memberEmail: string, memberName: string) {
  return sendNotification({
    to: memberEmail,
    subject: 'Lembrete Anual - Consentimento de Dados',
    body: `
Olá ${memberName},

Este é um lembrete anual sobre o tratamento de seus dados pessoais.

Você pode revisar e atualizar seu consentimento a qualquer momento acessando:
[URL_DO_SISTEMA]/dashboard/privacy

Atenciosamente,
Equipe de Gestão
    `.trim(),
    type: 'CONSENT_REMINDER',
  })
}

