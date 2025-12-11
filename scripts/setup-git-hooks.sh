#!/bin/bash
# Script para configurar git hooks

echo "🔧 Configurando git hooks..."

# Criar diretório de hooks se não existir
mkdir -p .git/hooks

# Criar pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Git hook para executar validação antes do commit

echo "🔍 Executando validação pré-commit..."

# Executar script de validação pré-commit
npm run pre-commit

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Validação pré-commit falhou!"
  echo "💡 Corrija os erros antes de fazer commit"
  echo "💡 Ou use 'git commit --no-verify' para pular a validação (não recomendado)"
  exit 1
fi

echo "✅ Validação pré-commit passou!"
exit 0
EOF

# Tornar executável
chmod +x .git/hooks/pre-commit

echo "✅ Git hook pré-commit configurado!"
echo ""
echo "💡 Agora a validação será executada automaticamente antes de cada commit"
echo "💡 Para pular (não recomendado): git commit --no-verify"
