# Guia de Segurança para Certificados Impressos

## Como Garantir a Autenticidade de Certificados Impressos

### 1. Elementos de Segurança no Certificado

O sistema gera certificados com os seguintes elementos de segurança:

#### ✅ QR Code de Validação
- **Localização**: Canto inferior direito do certificado
- **Função**: Permite validação rápida escaneando com qualquer leitor de QR Code
- **Conteúdo**: URL completa com número do certificado e hash de validação
- **Nível de correção de erro**: Alto (H) - permite leitura mesmo com danos parciais

#### ✅ Número do Certificado
- **Formato**: `CERT-timestamp-random` (ex: `CERT-1703123456789-ABCDEF`)
- **Localização**: Rodapé do certificado
- **Função**: Identificador único no sistema

#### ✅ Hash de Validação
- **Formato**: String hexadecimal de 64 caracteres (SHA-256)
- **Localização**: Rodapé do certificado (primeiros 32 caracteres visíveis)
- **Função**: Chave criptográfica que valida a autenticidade
- **Segurança**: Impossível falsificar sem conhecer a chave secreta do servidor

#### ✅ Marca d'água de Segurança
- **Tipo**: Padrão diagonal com nome da igreja
- **Visibilidade**: Apenas na impressão (não aparece na tela)
- **Função**: Dificulta cópias e falsificações

#### ✅ Aviso de Segurança
- **Mensagem**: "Qualquer alteração neste documento invalida sua autenticidade"
- **Função**: Alerta sobre a importância de manter o documento intacto

### 2. Processo de Validação

#### Método 1: Validação por QR Code (Recomendado)
1. Escanear o QR Code com qualquer leitor de QR Code
2. Será redirecionado para a página de validação
3. O sistema verifica automaticamente a autenticidade
4. Mostra os dados reais do banco de dados

#### Método 2: Validação Manual
1. Acessar: `https://seudominio.com/validate-certificate`
2. Inserir o número do certificado
3. Inserir o hash de validação (completo)
4. Clicar em "Validar Certificado"

### 3. Como Detectar Falsificações

#### ❌ Certificado Falso - Número Inventado
- **Sintoma**: "Certificado não encontrado no sistema"
- **Ação**: Certificado é falsificado

#### ❌ Certificado Falso - Hash Inválido
- **Sintoma**: "Hash de validação inválido"
- **Ação**: Tentativa de falsificação detectada

#### ❌ Certificado Alterado
- **Sintoma**: Se alguém alterar o nome no documento físico
- **Resultado**: O hash não corresponderá, mas o sistema mostrará o nome REAL do banco
- **Ação**: A falsificação será exposta ao comparar o documento com a validação online

#### ⚠️ Certificado Válido, mas Dados Inconsistentes
- **Sintoma**: Avisos como "O membro não possui registro de conclusão deste curso"
- **Ação**: Certificado é válido, mas há inconsistência nos dados históricos

### 4. Boas Práticas para Impressão

#### ✅ Recomendações
- Use papel de qualidade (A4 ou papel timbrado)
- Imprima em alta resolução (mínimo 300 DPI)
- Verifique se o QR Code está nítido e escaneável
- Mantenha o número e hash visíveis e legíveis
- Não altere nenhuma informação após impressão
- Guarde uma cópia digital para referência

#### ❌ Evite
- Imprimir em baixa resolução (QR Code pode não funcionar)
- Alterar informações após impressão
- Usar papel de baixa qualidade
- Recortar ou ocultar o QR Code ou hash

### 5. Proteções Implementadas

#### 🔒 Segurança Criptográfica
- Hash SHA-256 com informações críticas (nome, título, tipo, data)
- Chave secreta armazenada apenas no servidor
- Impossível gerar hash válido sem a chave secreta

#### 🔒 Validação no Banco de Dados
- Sempre consulta o banco de dados para verificar autenticidade
- Mostra dados REAIS, não os do documento físico
- Detecta alterações comparando hash fornecido com hash calculado

#### 🔒 Auditoria Completa
- Todas as validações são registradas (IP, data/hora, resultado)
- Tentativas de fraude são logadas
- Histórico completo de validações disponível

#### 🔒 Validações Cruzadas
- Verifica se o membro realmente completou o curso
- Verifica se o membro realmente participou do evento
- Verifica se o batismo realmente existe e pertence ao membro

### 6. Resposta a Tentativas de Fraude

Quando uma falsificação é detectada:
1. ✅ Sistema registra a tentativa (IP, data/hora, hash usado)
2. ✅ Retorna mensagem clara de "Certificado falsificado"
3. ✅ Mostra dados reais do banco (se o número existir)
4. ✅ Alerta de fraude é gerado nos logs

### 7. Conclusão

**O sistema garante autenticidade através de:**
- ✅ Hash criptográfico impossível de falsificar
- ✅ Validação sempre consulta o banco de dados
- ✅ QR Code para validação rápida
- ✅ Elementos visuais de segurança
- ✅ Auditoria completa de todas as validações

**Um certificado impresso é autêntico se:**
- ✅ O QR Code escaneia e valida corretamente
- ✅ O número e hash correspondem à validação online
- ✅ Os dados exibidos na validação correspondem ao documento
- ✅ Não há avisos de inconsistência

**Um certificado é falsificado se:**
- ❌ O número não existe no sistema
- ❌ O hash não corresponde
- ❌ Os dados na validação diferem do documento físico

