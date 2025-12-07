# Script para configurar DATABASE_URL no .env

Write-Host "🔧 Configurando DATABASE_URL para MySQL..." -ForegroundColor Cyan

# Ler o arquivo .env atual
$envContent = Get-Content .env -ErrorAction SilentlyContinue

if (-not $envContent) {
    Write-Host "❌ Arquivo .env não encontrado. Criando novo..." -ForegroundColor Yellow
    $envContent = @()
}

# Solicitar informações do MySQL
Write-Host "`n📝 Informe os dados do MySQL:" -ForegroundColor Cyan
$mysqlUser = Read-Host "Usuário (padrão: root)"
if ([string]::IsNullOrWhiteSpace($mysqlUser)) {
    $mysqlUser = "root"
}

$mysqlPassword = Read-Host "Senha" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
)

$mysqlPort = Read-Host "Porta (padrão: 3306)"
if ([string]::IsNullOrWhiteSpace($mysqlPort)) {
    $mysqlPort = "3306"
}

$mysqlDatabase = Read-Host "Nome do banco (padrão: ekklesia)"
if ([string]::IsNullOrWhiteSpace($mysqlDatabase)) {
    $mysqlDatabase = "ekklesia"
}

# Construir DATABASE_URL
$databaseUrl = "mysql://${mysqlUser}:${mysqlPasswordPlain}@localhost:${mysqlPort}/${mysqlDatabase}"

# Atualizar ou adicionar DATABASE_URL
$newEnvContent = @()
$found = $false

foreach ($line in $envContent) {
    if ($line -match "^DATABASE_URL=") {
        $newEnvContent += "DATABASE_URL=`"$databaseUrl`""
        $found = $true
    } else {
        $newEnvContent += $line
    }
}

if (-not $found) {
    $newEnvContent += "DATABASE_URL=`"$databaseUrl`""
}

# Salvar arquivo .env
$newEnvContent | Set-Content .env

Write-Host "`n✅ DATABASE_URL configurado com sucesso!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Certifique-se de que o banco de dados '$mysqlDatabase' existe"
Write-Host "2. Execute: npm run db:generate"
Write-Host "3. Execute: npm run db:push"
Write-Host "4. Execute: npm run db:seed"
Write-Host "5. Execute: npm run dev"

