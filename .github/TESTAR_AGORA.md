# 🚀 Testar CI/CD Agora

Como os secrets já estão configurados, siga estes passos para testar o CI/CD:

## 📋 Passo a Passo

### 1. No seu Mac/Local, navegue até o projeto

```bash
cd /caminho/para/seu/projeto/ekklesia
```

### 2. Verifique se é um repositório Git

```bash
git status
```

Se não for um repositório Git, inicialize:

```bash
git init
git remote add origin https://github.com/seu-usuario/ekklesia.git
```

### 3. Adicione os arquivos novos

```bash
git add .
```

### 4. Faça commit

```bash
git commit -m "feat: implementar CI/CD completo com GitHub Actions

- Adicionar workflows de CI, Deploy e Cleanup
- Criar scripts de provisionamento e deploy VPS
- Adicionar documentação completa de CI/CD
- Configurar deploy automático para VPS"
```

### 5. Faça push para triggerar o CI/CD

```bash
# Se estiver na branch main
git push origin main

# Ou se estiver na branch master
git push origin master
```

### 6. Acompanhe a execução

1. Acesse: `https://github.com/seu-usuario/ekklesia/actions`
2. Você verá o workflow "CI" executando
3. Aguarde alguns minutos
4. Se fizer push para `main`/`master`, o "Deploy para VPS" também executará

## ✅ O que deve acontecer

### CI (Automático)

1. **Lint** - Verifica código
2. **Build** - Compila aplicação
3. **Testes LGPD** - Executa testes
4. **Type Check** - Verifica tipos TypeScript

**Tempo estimado:** 3-5 minutos

### Deploy (Automático - apenas em main/master)

1. **Backup** - Faz backup do banco
2. **Sync** - Sincroniza código para VPS
3. **Build** - Compila na VPS
4. **Deploy** - Reinicia com PM2

**Tempo estimado:** 5-10 minutos

## 🔍 Verificar Resultado

### No GitHub

1. Acesse: `https://github.com/seu-usuario/ekklesia/actions`
2. Clique no workflow que está executando
3. Veja os logs de cada step
4. Verifique se passou ✅ ou falhou ❌

### Na VPS

```bash
# Conectar na VPS
ssh root@72.61.42.147

# Verificar se aplicação está rodando
pm2 status

# Ver logs
pm2 logs ekklesia

# Verificar se código foi atualizado
cd /root/ekklesia
git log -1
```

## 🐛 Se algo falhar

### CI falha

- Veja os logs em Actions
- Execute localmente: `npm run lint` e `npm run build`
- Corrija os erros e faça push novamente

### Deploy falha

- Verifique se todos os secrets estão configurados
- Verifique logs em Actions
- Verifique conexão SSH: `ssh -i ~/.ssh/github-actions-deploy root@72.61.42.147`
- Verifique se PM2 está instalado na VPS

## 📊 Checklist Rápido

- [ ] Repositório Git inicializado
- [ ] Remote configurado
- [ ] Arquivos commitados
- [ ] Push feito para main/master
- [ ] Workflow executando no GitHub
- [ ] CI passou ✅
- [ ] Deploy executou (se em main/master)
- [ ] Aplicação atualizada na VPS

---

**Pronto para testar!** Execute os comandos acima e acompanhe em `https://github.com/seu-usuario/ekklesia/actions`

