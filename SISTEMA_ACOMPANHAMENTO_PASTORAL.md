# 🏥 Sistema de Acompanhamento Pastoral - Especificação Completa

## 📋 Visão Geral

O Sistema de Acompanhamento Pastoral permite que pastores, líderes e equipes de cuidado registrem e acompanhem o cuidado espiritual e físico dos membros da igreja, mantendo um histórico completo e organizado.

---

## 🎯 Objetivos

1. **Organizar o cuidado pastoral** - Centralizar informações de acompanhamento
2. **Não perder membros** - Alertas para membros que precisam de atenção
3. **Histórico completo** - Registro de todas as interações pastorais
4. **Privacidade** - Informações sensíveis apenas para quem tem permissão
5. **Eficiência** - Reduzir trabalho manual e aumentar qualidade do cuidado

---

## 🔑 Funcionalidades Principais

### 1. **Registro de Visitas Pastorais**

#### O que é:
Registro detalhado de visitas pastorais (domiciliar, hospitalar, etc.)

#### Campos:
- **Data e hora** da visita
- **Tipo de visita:**
  - Domiciliar
  - Hospitalar
  - Escritório/Pastoral
  - Telefone/Videochamada
  - Outro
- **Localização** (endereço ou local)
- **Pastor/Líder** que realizou
- **Membros presentes** (pode ser família)
- **Motivo da visita:**
  - Acompanhamento regular
  - Doença/Enfermidade
  - Luto
  - Crise familiar
  - Conversão/Decisão
  - Outro
- **Anotações pastorais** (texto livre, privado)
- **Ações tomadas:**
  - Oração realizada
  - Estudo bíblico compartilhado
  - Encaminhamento para ministério
  - Ajuda financeira
  - Outro
- **Próximos passos** (follow-up)
- **Privacidade:**
  - Público (todos os pastores veem)
  - Privado (apenas quem registrou)
  - Confidencial (apenas pastores sênior)

#### Interface:
```
┌─────────────────────────────────────────┐
│ Nova Visita Pastoral                    │
├─────────────────────────────────────────┤
│ Membro: [Selecionar membro ▼]          │
│ Data: [__/__/____] Hora: [__:__]        │
│ Tipo: [Domiciliar ▼]                    │
│ Local: [Endereço do membro]             │
│ Pastor: [Nome do pastor]                │
│                                         │
│ Motivo: [ ] Acompanhamento regular      │
│         [ ] Doença/Enfermidade         │
│         [ ] Luto                        │
│         [ ] Crise familiar              │
│                                         │
│ Anotações:                              │
│ ┌─────────────────────────────────────┐ │
│ │ [Texto livre e privado]             │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Ações realizadas:                       │
│ [✓] Oração realizada                   │
│ [✓] Estudo bíblico compartilhado        │
│ [ ] Encaminhamento para ministério     │
│                                         │
│ Próximo passo:                          │
│ [Retornar em 7 dias]                   │
│                                         │
│ Privacidade: [Público ▼]               │
│                                         │
│ [Cancelar] [Salvar Visita]              │
└─────────────────────────────────────────┘
```

---

### 2. **Pedidos de Oração**

#### O que é:
Sistema onde membros podem solicitar oração e pastores podem acompanhar

#### Fluxo:
1. **Membro solicita oração** (via app mobile ou web)
2. **Sistema notifica pastores/líderes**
3. **Pastor registra oração realizada**
4. **Membro recebe confirmação**

#### Campos:
- **Solicitado por:** (membro ou terceiro)
- **Tipo:**
  - Pessoal
  - Familiar
  - Saúde
  - Financeiro
  - Trabalho
  - Outro
- **Urgência:** Baixa, Média, Alta
- **Descrição** (opcional, privada)
- **Status:**
  - Pendente
  - Em oração
  - Respondida
  - Arquivada
- **Data da solicitação**
- **Quem está orando** (pastores/líderes)
- **Resposta/Testemunho** (quando oração é respondida)

#### Interface no App Mobile:
```
┌─────────────────────────────────────────┐
│ Pedidos de Oração                       │
├─────────────────────────────────────────┤
│ [Nova Solicitação]                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🙏 Saúde - Urgente                  │ │
│ │ Solicitei oração pela minha mãe    │ │
│ │ [Ver detalhes]                      │ │
│ │ Status: Em oração                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🙏 Trabalho - Média                 │ │
│ │ Preciso de emprego                  │ │
│ │ [Ver detalhes]                      │ │
│ │ Status: Respondida ✅               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 3. **Necessidades e Ajudas**

#### O que é:
Registro de necessidades dos membros (financeira, material, emocional)

#### Campos:
- **Tipo de necessidade:**
  - Financeira
  - Alimentação
  - Roupas
  - Móveis/Eletrodomésticos
  - Transporte
  - Emocional/Psicológica
  - Médica
  - Outro
- **Urgência:** Baixa, Média, Alta, Crítica
- **Valor estimado** (se financeira)
- **Descrição**
- **Status:**
  - Solicitada
  - Em análise
  - Aprovada
  - Atendida
  - Recusada
- **Quem está ajudando** (ministério/pessoa)
- **Histórico de atendimentos**

#### Interface:
```
┌─────────────────────────────────────────┐
│ Necessidades                            │
├─────────────────────────────────────────┤
│ Filtros: [Todos] [Pendentes] [Urgentes]│
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🚨 CRÍTICA - Financeira             │ │
│ │ João Silva                          │ │
│ │ R$ 500,00 - Aluguel atrasado        │ │
│ │ [Ver detalhes] [Atender]            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ⚠️ ALTA - Alimentação               │ │
│ │ Maria Santos                        │ │
│ │ Cesta básica                        │ │
│ │ [Ver detalhes] [Atender]            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 4. **Acompanhamento de Decisões e Conversões**

#### O que é:
Registro de decisões de fé, conversões, batismos

#### Campos:
- **Tipo:**
  - Decisão de fé (primeira vez)
  - Reconsagração
  - Batismo
  - Restauração
- **Data da decisão**
- **Local** (culto, evento, visita)
- **Quem acompanhou** (pastor/líder)
- **Status do discipulado:**
  - Iniciado
  - Em andamento
  - Concluído
- **Discipulador responsável**
- **Próximos passos:**
  - Curso de novos convertidos
  - Batismo
  - Integração em ministério

---

### 5. **Alertas e Lembretes Inteligentes**

#### O que é:
Sistema que identifica membros que precisam de atenção

#### Alertas automáticos:
- **Membro não frequenta há X dias**
  - Configurável (ex: 30, 60, 90 dias)
  - Notificação para pastores
- **Aniversário sem visita**
  - Alerta antes do aniversário
- **Necessidade não atendida há muito tempo**
  - Alerta para urgências pendentes
- **Pedido de oração sem resposta**
  - Alerta após X dias
- **Visita pastoral há muito tempo**
  - Alerta se não houve visita em X meses

#### Interface de Alertas:
```
┌─────────────────────────────────────────┐
│ Alertas de Acompanhamento               │
├─────────────────────────────────────────┤
│ 🔴 URGENTE                              │
│ ┌─────────────────────────────────────┐ │
│ │ João Silva não frequenta há 45 dias │ │
│ │ [Ver perfil] [Agendar visita]       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🟡 ATENÇÃO                               │
│ ┌─────────────────────────────────────┐ │
│ │ Maria tem aniversário em 3 dias     │ │
│ │ [Ver perfil] [Agendar visita]       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🟢 LEMBRETES                             │
│ ┌─────────────────────────────────────┐ │
│ │ 5 pedidos de oração pendentes       │ │
│ │ [Ver pedidos]                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 6. **Relatórios de Acompanhamento**

#### Relatórios disponíveis:
1. **Visitas Pastorais:**
   - Total de visitas no período
   - Visitas por pastor
   - Visitas por tipo
   - Membros mais visitados
   - Membros que precisam de visita

2. **Pedidos de Oração:**
   - Total de pedidos
   - Taxa de resposta
   - Tipos mais comuns
   - Tempo médio de resposta

3. **Necessidades:**
   - Total atendidas
   - Valor total investido
   - Tipos mais comuns
   - Pendências

4. **Decisões:**
   - Total de decisões
   - Conversões
   - Batismos
   - Taxa de discipulado

---

## 🗄️ Estrutura de Dados (Prisma Schema)

```prisma
// Visitas Pastorais
model PastoralVisit {
  id          String   @id @default(cuid())
  memberId   String
  member     Member   @relation(fields: [memberId], references: [id])
  
  visitDate  DateTime
  visitType  VisitType // DOMICILIARY, HOSPITAL, OFFICE, PHONE, OTHER
  location   String?
  
  pastorId   String
  pastor     User     @relation(fields: [pastorId], references: [id])
  
  reason     VisitReason // REGULAR, ILLNESS, GRIEF, FAMILY_CRISIS, CONVERSION, OTHER
  notes      String?  @db.Text // Anotações privadas
  actions    String?  @db.Text // JSON com ações realizadas
  
  privacy    PrivacyLevel @default(PUBLIC) // PUBLIC, PRIVATE, CONFIDENTIAL
  
  nextSteps  String?  @db.Text
  followUpDate DateTime?
  
  churchId   String
  church     Church   @relation(fields: [churchId], references: [id])
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([memberId])
  @@index([pastorId])
  @@index([visitDate])
  @@map("pastoral_visits")
}

enum VisitType {
  DOMICILIARY
  HOSPITAL
  OFFICE
  PHONE
  VIDEO_CALL
  OTHER
}

enum VisitReason {
  REGULAR
  ILLNESS
  GRIEF
  FAMILY_CRISIS
  CONVERSION
  OTHER
}

enum PrivacyLevel {
  PUBLIC      // Todos os pastores veem
  PRIVATE     // Apenas quem registrou
  CONFIDENTIAL // Apenas pastores sênior
}

// Pedidos de Oração
model PrayerRequest {
  id          String   @id @default(cuid())
  memberId   String?
  member     Member?  @relation(fields: [memberId], references: [id])
  
  requestedBy String  // Nome de quem solicitou (pode não ser membro)
  type        PrayerType
  urgency     UrgencyLevel
  description String?  @db.Text
  isPrivate   Boolean  @default(false) // Se membro quer manter privado
  
  status      PrayerStatus @default(PENDING)
  
  // Quem está orando
  prayingUsers String? // JSON array de user IDs
  
  answer      String?  @db.Text // Testemunho/resposta quando oração é respondida
  answeredAt  DateTime?
  
  churchId   String
  church     Church   @relation(fields: [churchId], references: [id])
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([memberId])
  @@index([status])
  @@index([urgency])
  @@map("prayer_requests")
}

enum PrayerType {
  PERSONAL
  FAMILY
  HEALTH
  FINANCIAL
  WORK
  OTHER
}

enum UrgencyLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum PrayerStatus {
  PENDING
  PRAYING
  ANSWERED
  ARCHIVED
}

// Necessidades
model MemberNeed {
  id          String   @id @default(cuid())
  memberId   String
  member     Member   @relation(fields: [memberId], references: [id])
  
  type        NeedType
  urgency     UrgencyLevel
  estimatedValue Decimal? @db.Decimal(10, 2)
  description String?  @db.Text
  
  status      NeedStatus @default(REQUESTED)
  
  // Quem está ajudando
  helpingMinistryId String?
  helpingMinistry   Ministry? @relation(fields: [helpingMinistryId], references: [id])
  helpingUserId     String?
  helpingUser       User?     @relation(fields: [helpingUserId], references: [id])
  
  // Histórico
  history     String?  @db.Text // JSON com histórico de atendimentos
  
  churchId   String
  church     Church   @relation(fields: [churchId], references: [id])
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  attendedAt DateTime?
  
  @@index([memberId])
  @@index([status])
  @@index([urgency])
  @@map("member_needs")
}

enum NeedType {
  FINANCIAL
  FOOD
  CLOTHING
  FURNITURE
  TRANSPORT
  EMOTIONAL
  MEDICAL
  OTHER
}

enum NeedStatus {
  REQUESTED
  UNDER_REVIEW
  APPROVED
  ATTENDED
  REFUSED
}

// Decisões de Fé
model FaithDecision {
  id          String   @id @default(cuid())
  memberId   String
  member     Member   @relation(fields: [memberId], references: [id])
  
  type        DecisionType
  decisionDate DateTime
  location     String?
  
  pastorId    String
  pastor      User     @relation(fields: [pastorId], references: [id])
  
  discipleshipStatus DiscipleshipStatus @default(NOT_STARTED)
  disciplerId String?
  discipler   User?    @relation("Discipler", fields: [disciplerId], references: [id])
  
  nextSteps   String?  @db.Text // JSON com próximos passos
  notes       String?  @db.Text
  
  churchId   String
  church     Church   @relation(fields: [churchId], references: [id])
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([memberId])
  @@index([decisionDate])
  @@index([type])
  @@map("faith_decisions")
}

enum DecisionType {
  FIRST_FAITH
  RECONSECRATION
  BAPTISM
  RESTORATION
}

enum DiscipleshipStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

// Adicionar relações no modelo Member
model Member {
  // ... campos existentes ...
  
  pastoralVisits  PastoralVisit[]
  prayerRequests  PrayerRequest[]
  needs           MemberNeed[]
  faithDecisions  FaithDecision[]
  discipledMembers FaithDecision[] @relation("Discipler")
}

// Adicionar relações no modelo User
model User {
  // ... campos existentes ...
  
  pastoralVisits  PastoralVisit[]
  prayerRequests  PrayerRequest[] // Quem está orando
  helpedNeeds     MemberNeed[]
  faithDecisions  FaithDecision[]
  discipledDecisions FaithDecision[] @relation("Discipler")
}
```

---

## 🎨 Interface do Usuário

### Dashboard de Acompanhamento Pastoral

```
┌─────────────────────────────────────────────────────────┐
│ Acompanhamento Pastoral                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📊 Resumo do Mês                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ 12       │ │ 8        │ │ 5        │ │ 3        │   │
│ │ Visitas  │ │ Pedidos  │ │ Necessid. │ │ Decisões │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│ 🔴 Alertas Urgentes (3)                                  │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ⚠️ João não frequenta há 45 dias                   │ │
│ │ ⚠️ Maria tem necessidade crítica pendente          │ │
│ │ ⚠️ 2 pedidos de oração urgentes sem resposta      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ 📅 Próximas Ações                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Hoje: Visita domiciliar - Maria Silva              │ │
│ │ Amanhã: Acompanhamento - João Santos               │ │
│ │ 15/01: Aniversário - Ana Costa                     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [Nova Visita] [Novo Pedido] [Nova Necessidade]          │
└─────────────────────────────────────────────────────────┘
```

### Página de Perfil do Membro (com aba de Acompanhamento)

```
┌─────────────────────────────────────────────────────────┐
│ João Silva - Perfil                                     │
├─────────────────────────────────────────────────────────┤
│ [Dados] [Frequência] [Finanças] [Acompanhamento] ←     │
│                                                          │
│ 🏥 Histórico de Acompanhamento                          │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📅 15/01/2024 - Visita Domiciliar                  │ │
│ │ Pastor: Carlos Mendes                              │ │
│ │ Motivo: Acompanhamento regular                    │ │
│ │ [Ver detalhes]                                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🙏 10/01/2024 - Pedido de Oração                   │ │
│ │ Tipo: Saúde - Urgente                              │ │
│ │ Status: Respondida ✅                              │ │
│ │ [Ver detalhes]                                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 💰 05/01/2024 - Necessidade Financeira             │ │
│ │ Status: Atendida ✅                                │ │
│ │ [Ver detalhes]                                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [Nova Visita] [Registrar Necessidade]                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 Integração com App Mobile

### Funcionalidades no App:
1. **Solicitar Oração**
   - Formulário simples
   - Notificação para pastores
2. **Ver Pedidos de Oração**
   - Status dos pedidos
   - Respostas/testemunhos
3. **Solicitar Ajuda** (opcional, configurável)
   - Formulário de necessidade
   - Acompanhamento do status

---

## 🔔 Notificações Automáticas

### Para Pastores/Líderes:
- Novo pedido de oração
- Necessidade crítica
- Alerta de membro não frequenta
- Lembrete de visita agendada
- Aniversário de membro

### Para Membros:
- Oração sendo feita
- Oração respondida
- Necessidade sendo analisada
- Visita agendada

---

## 🔐 Permissões e Privacidade

### Níveis de Acesso:
1. **Pastor Presidente:**
   - Acesso total
   - Ver todas as anotações (incluindo confidenciais)

2. **Pastor:**
   - Ver visitas públicas e próprias
   - Ver anotações privadas próprias
   - Ver anotações confidenciais (se configurado)

3. **Líder:**
   - Ver apenas visitas próprias
   - Ver pedidos de oração
   - Não ver anotações confidenciais

4. **Membro:**
   - Ver apenas próprios pedidos de oração
   - Ver status de necessidades próprias
   - Não ver anotações pastorais

---

## 📊 Relatórios e Analytics

### Relatórios Disponíveis:
1. **Visitas Pastorais:**
   - Total no período
   - Por pastor
   - Por tipo
   - Membros mais visitados
   - Membros que precisam de visita

2. **Eficácia do Cuidado:**
   - Taxa de resposta a pedidos
   - Tempo médio de resposta
   - Taxa de atendimento de necessidades
   - Membros restaurados

3. **Decisões:**
   - Total de conversões
   - Taxa de discipulado
   - Membros batizados

---

## 🚀 Implementação Sugerida

### Fase 1 (MVP - 2 semanas):
- ✅ Registro de visitas pastorais básico
- ✅ Pedidos de oração
- ✅ Alertas básicos (não frequenta)

### Fase 2 (1 mês):
- ✅ Necessidades e ajudas
- ✅ Decisões de fé
- ✅ Relatórios básicos

### Fase 3 (1 mês):
- ✅ Alertas inteligentes completos
- ✅ Integração com app mobile
- ✅ Notificações automáticas

---

## 💡 Casos de Uso Práticos

### Caso 1: Membro não frequenta
1. Sistema detecta: "João não frequenta há 45 dias"
2. Alerta enviado para pastores
3. Pastor agenda visita
4. Visita registrada no sistema
5. Follow-up agendado

### Caso 2: Pedido de oração
1. Membro solicita oração via app
2. Pastores recebem notificação
3. Pastor marca "em oração"
4. Quando oração é respondida, membro recebe notificação

### Caso 3: Necessidade financeira
1. Membro solicita ajuda
2. Sistema classifica urgência
3. Pastores analisam
4. Ministério de ajuda é acionado
5. Necessidade é atendida e registrada

---

## 🎯 Diferenciais Competitivos

1. **Privacidade Inteligente**
   - Anotações confidenciais
   - Controle granular de acesso

2. **Alertas Proativos**
   - Sistema identifica necessidades
   - Não depende de memória humana

3. **Histórico Completo**
   - Tudo em um lugar
   - Fácil consulta

4. **Integração com App**
   - Membros podem solicitar ajuda
   - Comunicação bidirecional

---

Este sistema transformaria o Ekklesia no **único sistema com acompanhamento pastoral completo e integrado** no mercado brasileiro! 🎯

