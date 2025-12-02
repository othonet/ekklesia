'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, FileText, Trash2, Download } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">Política de Privacidade</h1>
          <p className="text-muted-foreground text-lg">
            Conformidade com a Lei Geral de Proteção de Dados (LGPD)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              1. Coleta de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              O sistema Ekklesia coleta e processa os seguintes dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Dados de identificação:</strong> Nome, email, telefone, CPF (criptografado), RG (criptografado)</li>
              <li><strong>Dados de localização:</strong> Endereço, cidade, estado, CEP</li>
              <li><strong>Dados de nascimento:</strong> Data de nascimento (quando fornecido)</li>
              <li><strong>Dados de participação:</strong> Ministérios, eventos, frequência, cursos, certificados</li>
              <li><strong>Dados financeiros:</strong> Doações, dízimos, ofertas (quando aplicável)</li>
              <li><strong>Dados de acesso:</strong> Logs de autenticação, ações no sistema, IP, dispositivo</li>
              <li><strong>Dados de consentimento:</strong> Status e histórico de consentimentos LGPD</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              2. Finalidade do Tratamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Utilizamos seus dados pessoais para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Gestão de membros e participantes da igreja</li>
              <li>Organização de eventos e ministérios</li>
              <li>Controle financeiro e de doações</li>
              <li>Comunicação sobre atividades da igreja</li>
              <li>Melhoria dos serviços oferecidos</li>
              <li>Cumprimento de obrigações legais</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              3. Base Legal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              O tratamento de dados pessoais é realizado com base em:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li><strong>Consentimento:</strong> Quando você autoriza expressamente o uso de seus dados</li>
              <li><strong>Execução de contrato:</strong> Para cumprimento de obrigações contratuais</li>
              <li><strong>Legítimo interesse:</strong> Para gestão e organização da igreja (art. 7º, inciso IX da LGPD). 
                Esta base legal é utilizada quando você é cadastrado por um administrador da igreja, 
                permitindo a gestão adequada dos membros e participantes. Você pode confirmar ou revogar 
                seu consentimento a qualquer momento através do sistema.</li>
              <li><strong>Obrigação legal:</strong> Para cumprimento de obrigações legais e regulatórias</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Nota importante:</strong> Se você foi cadastrado por um administrador da igreja, 
                seus dados foram coletados com base no legítimo interesse para gestão da igreja. 
                Você pode acessar o sistema e confirmar ou revogar seu consentimento a qualquer momento.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              4. Seus Direitos (LGPD)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Portabilidade:</strong> Solicitar uma cópia dos seus dados em formato estruturado
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Acesso:</strong> Solicitar informações sobre quais dados temos sobre você
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Retificação:</strong> Corrigir dados incompletos, inexatos ou desatualizados
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais (direito ao esquecimento)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <strong>Revogação de consentimento:</strong> Retirar seu consentimento a qualquer momento
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Acesso não autorizado</li>
              <li>Alteração, destruição ou perda acidental</li>
              <li>Tratamento ilícito</li>
            </ul>
            <div className="mt-4 space-y-3">
              <p>
                <strong>Medidas técnicas implementadas:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Criptografia AES-256-GCM:</strong> Dados sensíveis (CPF, RG) são criptografados antes do armazenamento</li>
                <li><strong>Hash bcrypt:</strong> Senhas são armazenadas com hash irreversível</li>
                <li><strong>Autenticação JWT:</strong> Tokens seguros com expiração configurável</li>
                <li><strong>Controle de acesso:</strong> Permissões baseadas em função (Admin, Pastor, Líder, Membro)</li>
                <li><strong>Isolamento de dados:</strong> Dados isolados por igreja (churchId)</li>
                <li><strong>HTTPS:</strong> Todas as comunicações são criptografadas</li>
              </ul>
              <p className="mt-3">
                <strong>Medidas organizacionais:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Logs de auditoria:</strong> Todas as operações são registradas (quem, quando, o quê, IP, dispositivo)</li>
                <li><strong>Soft delete:</strong> Exclusões com período de graça de 30 dias</li>
                <li><strong>Acesso limitado:</strong> Apenas pessoal autorizado tem acesso aos dados</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Seus dados pessoais não são compartilhados com terceiros, exceto:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Quando necessário para cumprimento de obrigações legais</li>
              <li>Com seu consentimento expresso</li>
              <li>Para prestadores de serviços que atuam como processadores de dados (com contratos adequados)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, 
              ou pelo prazo exigido por lei.
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Prazos específicos de retenção:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Membros ativos:</strong> Dados mantidos enquanto você for membro ativo</li>
                <li><strong>Membros inativos:</strong> Dados mantidos por até 5 anos após inatividade</li>
                <li><strong>Logs de auditoria:</strong> Mantidos por 2 anos para segurança e conformidade</li>
                <li><strong>Dados financeiros:</strong> Mantidos conforme exigências fiscais (geralmente 5 anos)</li>
              </ul>
              <p className="mt-3">
                Após o período de retenção, ou quando você solicitar exclusão, os dados são anonimizados ou excluídos permanentemente, 
                respeitando o período de graça de 30 dias para cancelamento da solicitação.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais:
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <p><strong>No aplicativo mobile:</strong></p>
                <p className="text-sm text-muted-foreground ml-4">
                  Acesse a tela "Privacidade" no menu "Mais" para gerenciar consentimento, exportar dados e solicitar exclusão.
                </p>
              </div>
              <div>
                <p><strong>Via administração:</strong></p>
                <p className="text-sm text-muted-foreground ml-4">
                  Entre em contato com a administração da sua igreja.
                </p>
              </div>
              <div>
                <p><strong>Encarregado de Dados (DPO):</strong></p>
                <p className="text-sm text-muted-foreground ml-4">
                  Para questões específicas sobre proteção de dados, entre em contato com o Encarregado de Dados da sua igreja.
                  <br />
                  <em>(Informações de contato devem ser fornecidas pela administração da igreja)</em>
                </p>
              </div>
            </div>
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong>
                <br />
                Em caso de dúvidas ou reclamações sobre o tratamento de seus dados, você também pode entrar em contato com a ANPD:
                <br />
                Website: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.gov.br/anpd</a>
              </p>
            </div>
            <p className="mt-4">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <a href="/login" className="text-primary hover:underline">
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  )
}

