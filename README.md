# Ekklesia - Sistema de Gestão para Igrejas

Sistema completo de gestão desenvolvido para igrejas, com funcionalidades para gerenciamento de membros, ministérios, eventos, finanças e doações.

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma ORM** - ORM para banco de dados
- **MySQL** - Banco de dados
- **Shadcn UI** - Componentes UI com dark mode
- **JWT** - Autenticação
- **Tailwind CSS** - Estilização

## Funcionalidades

- ✅ Autenticação com JWT
- ✅ Gestão de Usuários
- ✅ Gestão de Igrejas
- ✅ Gestão de Membros
- ✅ Gestão de Ministérios
- ✅ Gestão de Eventos
- ✅ Gestão de Finanças
- ✅ Gestão de Doações
- ✅ Dark Mode

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="mysql://user:password@localhost:3306/ekklesia"
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

4. Configure o banco de dados:

```bash
# Gerar o cliente Prisma
npm run db:generate

# Criar as tabelas no banco
npm run db:push

# Ou criar uma migração
npm run db:migrate

# Popular o banco com dados iniciais (usuário admin)
npm run db:seed
```

5. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Credenciais de Acesso

Após executar o seed do banco de dados (`npm run db:seed`), você pode usar as seguintes credenciais:

### Administrador
- **Email:** `admin@ekklesia.com`
- **Senha:** `admin123`
- **Permissões:** Acesso total ao sistema

### Pastor
- **Email:** `pastor@ekklesia.com`
- **Senha:** `pastor123`
- **Permissões:** Acesso como pastor

> ⚠️ **Importante:** Altere essas senhas após o primeiro acesso em produção!

## Estrutura do Projeto

```
ekklesia/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── dashboard/         # Página do dashboard
│   ├── login/             # Página de login
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes Shadcn UI
│   └── theme-provider.tsx # Provider de tema
├── lib/                   # Utilitários
│   ├── auth.ts           # Funções de autenticação
│   ├── prisma.ts         # Cliente Prisma
│   └── utils.ts          # Funções utilitárias
├── prisma/                # Prisma
│   └── schema.prisma     # Schema do banco de dados
└── public/                # Arquivos estáticos
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Sincroniza o schema com o banco
- `npm run db:migrate` - Cria uma nova migração
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:studio` - Abre o Prisma Studio
- `npm run generate:encryption-key` - Gera chave de criptografia para LGPD

## Próximos Passos

- [ ] Implementar CRUD completo de membros
- [ ] Implementar CRUD completo de ministérios
- [ ] Implementar CRUD completo de eventos
- [ ] Implementar CRUD completo de finanças
- [ ] Implementar relatórios
- [ ] Implementar dashboard com gráficos
- [ ] Adicionar testes
- [ ] Implementar upload de imagens

## Licença

Este projeto é privado e de uso interno.

