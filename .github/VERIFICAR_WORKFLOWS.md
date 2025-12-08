# 🔍 Verificar se Workflows Foram Commitados

Se os workflows não estão executando, verifique:

## 1. Verificar se Arquivos Foram Commitados

No seu Mac/Local, execute:

```bash
# Ver se arquivos estão no Git
git ls-files .github/workflows/

# Deve mostrar:
# .github/workflows/ci.yml
# .github/workflows/deploy.yml
# .github/workflows/cleanup-data.yml
```

## 2. Verificar se Estão no Repositório Remoto

```bash
# Ver arquivos no remoto
git ls-tree -r HEAD --name-only | grep ".github/workflows"

# Ou verificar no GitHub diretamente:
# https://github.com/othonet/ekklesia/tree/master/.github/workflows
```

## 3. Se Não Estão Commitados

```bash
# Adicionar arquivos
git add .github/workflows/

# Verificar o que será commitado
git status

# Fazer commit
git commit -m "feat: adicionar workflows CI/CD"

# Fazer push
git push origin master
```

## 4. Verificar no GitHub

Acesse diretamente:
- `https://github.com/othonet/ekklesia/tree/master/.github/workflows`

Você deve ver 3 arquivos:
- `ci.yml`
- `deploy.yml`
- `cleanup-data.yml`

## 5. Verificar se GitHub Actions Está Habilitado

1. Acesse: `https://github.com/othonet/ekklesia/settings/actions`
2. Verifique se "Allow all actions and reusable workflows" está selecionado
3. Se não estiver, habilite e salve

## 6. Testar Manualmente

Se os arquivos estão no GitHub mas não executam:

1. Acesse: `https://github.com/othonet/ekklesia/actions`
2. Clique em "Deploy para VPS" ou "CI"
3. Clique em "Run workflow"
4. Selecione branch `master`
5. Clique em "Run workflow"

## 🐛 Problemas Comuns

### Arquivos não foram commitados
**Solução:** Adicione e faça commit novamente

### GitHub Actions desabilitado
**Solução:** Habilite em Settings → Actions

### Sintaxe YAML incorreta
**Solução:** Verifique se há erros de sintaxe nos arquivos

### Workflows não aparecem na lista
**Solução:** Aguarde alguns minutos ou force um novo commit

---

**Verifique primeiro se os arquivos estão no GitHub!**

