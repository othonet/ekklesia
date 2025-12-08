#!/bin/bash

# Script para Verificar Status do MySQL

echo "🔍 Verificando Status do MySQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se MySQL está instalado
echo "1. Verificando instalação..."
if command -v mysql > /dev/null; then
    echo "   ✅ MySQL client encontrado: $(which mysql)"
    mysql --version
else
    echo "   ❌ MySQL client não encontrado"
fi

if command -v mysqld > /dev/null; then
    echo "   ✅ MySQL server encontrado: $(which mysqld)"
    mysqld --version
else
    echo "   ❌ MySQL server não encontrado"
fi

echo ""

# Verificar status do serviço
echo "2. Verificando status do serviço..."
if systemctl list-units | grep -q mysql; then
    echo "   Serviço MySQL encontrado"
    systemctl status mysql --no-pager -l || systemctl status mysqld --no-pager -l
else
    echo "   ⚠️  Serviço MySQL não encontrado no systemd"
fi

echo ""

# Verificar processos
echo "3. Verificando processos MySQL..."
if pgrep mysqld > /dev/null; then
    echo "   ✅ Processos MySQL rodando:"
    ps aux | grep mysqld | grep -v grep
else
    echo "   ❌ Nenhum processo MySQL rodando"
fi

echo ""

# Verificar socket
echo "4. Verificando socket MySQL..."
SOCKET_PATHS=(
    "/var/run/mysqld/mysqld.sock"
    "/tmp/mysql.sock"
    "/var/lib/mysql/mysql.sock"
)

SOCKET_FOUND=false
for socket in "${SOCKET_PATHS[@]}"; do
    if [ -S "$socket" ]; then
        echo "   ✅ Socket encontrado: $socket"
        SOCKET_FOUND=true
    fi
done

if [ "$SOCKET_FOUND" = false ]; then
    echo "   ❌ Nenhum socket MySQL encontrado"
fi

echo ""

# Tentar conectar
echo "5. Testando conexão..."
if mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Conexão bem-sucedida (sem senha)"
elif mysql -u root -p"" -e "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Conexão bem-sucedida (senha vazia)"
else
    echo "   ❌ Não foi possível conectar"
    echo "   Tentando com diferentes usuários..."
    
    for user in root ekklesia_user; do
        if mysql -u "$user" -e "SELECT 1;" > /dev/null 2>&1; then
            echo "   ✅ Conectado como: $user"
        fi
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

