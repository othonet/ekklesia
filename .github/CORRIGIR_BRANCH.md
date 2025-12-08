# 🔧 Corrigir Branch para CI/CD

O CI/CD está configurado para executar em `main` ou `master`. Você está na branch `master`.

## Opção 1: Fazer Push para Master (Mais Rápido)

```bash
git push origin master
```

Isso vai triggerar o CI/CD automaticamente, pois o workflow está configurado para `main` e `master`.

## Opção 2: Renomear Branch para Main (Recomendado)

Se quiser usar `main` como padrão:

```bash
# Renomear branch local
git branch -M main

# Fazer push
git push origin main

# Se já existir main no remoto, force:
git push -u origin main --force
```

## ✅ Verificar Qual Branch Está Configurada

```bash
# Ver branch atual
git branch

# Ver branches remotas
git branch -r

# Ver todas as branches
git branch -a
```

## 📋 Workflows Configurados

Os workflows estão configurados para executar em:
- `main` ✅
- `master` ✅
- `develop` (apenas CI)

Então você pode usar qualquer uma das duas!

---

**Solução rápida:** Execute `git push origin master` e o CI/CD vai funcionar! 🚀

