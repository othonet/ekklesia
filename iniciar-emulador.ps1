# Script para iniciar emulador Android e executar o app
# Uso: .\iniciar-emulador.ps1

Write-Host "🚀 Iniciando emulador Android e app Ekklesia..." -ForegroundColor Green
Write-Host ""

# Verificar se Flutter está instalado
$flutterInstalled = Get-Command flutter -ErrorAction SilentlyContinue
if (-not $flutterInstalled) {
    Write-Host "❌ Flutter não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale o Flutter primeiro: https://flutter.dev" -ForegroundColor Yellow
    exit
}

# Verificar se servidor está rodando
Write-Host "🔍 Verificando se o servidor está rodando..." -ForegroundColor Cyan
$serverRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $serverRunning) {
    Write-Host "⚠️  Servidor não está rodando na porta 3000!" -ForegroundColor Yellow
    Write-Host "💡 Execute 'npm run dev' em outro terminal antes de continuar" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        exit
    }
} else {
    Write-Host "✅ Servidor está rodando!" -ForegroundColor Green
}

# Verificar emuladores disponíveis
Write-Host ""
Write-Host "📱 Verificando emuladores disponíveis..." -ForegroundColor Cyan
$emulators = flutter emulators 2>&1

if ($emulators -match "No emulators found") {
    Write-Host "❌ Nenhum emulador encontrado!" -ForegroundColor Red
    Write-Host "💡 Crie um emulador no Android Studio: Tools → Device Manager → Create Device" -ForegroundColor Yellow
    exit
}

# Verificar se emulador já está rodando
Write-Host ""
Write-Host "🔍 Verificando se há emulador rodando..." -ForegroundColor Cyan
$devices = flutter devices 2>&1

if ($devices -match "emulator") {
    Write-Host "✅ Emulador já está rodando!" -ForegroundColor Green
    $launchEmulator = $false
} else {
    Write-Host "📱 Iniciando emulador 'Smartphone_Virtual'..." -ForegroundColor Cyan
    Write-Host "⏳ Isso pode demorar 1-2 minutos na primeira vez..." -ForegroundColor Yellow
    Write-Host ""
    
    Start-Process -NoNewWindow -FilePath "flutter" -ArgumentList "emulators", "--launch", "Smartphone_Virtual"
    
    Write-Host "⏳ Aguardando emulador iniciar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Verificar novamente
    $devices = flutter devices 2>&1
    $maxAttempts = 10
    $attempt = 0
    
    while (-not ($devices -match "emulator") -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 10
        $devices = flutter devices 2>&1
        $attempt++
        Write-Host "⏳ Aguardando... ($attempt/$maxAttempts)" -ForegroundColor Yellow
    }
    
    if ($devices -match "emulator") {
        Write-Host "✅ Emulador iniciado!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Emulador pode não ter iniciado completamente" -ForegroundColor Yellow
        Write-Host "💡 Tente iniciar manualmente no Android Studio" -ForegroundColor Yellow
    }
}

# Navegar para pasta mobile
if (Test-Path "mobile") {
    Set-Location mobile
} else {
    Write-Host "❌ Pasta 'mobile' não encontrada!" -ForegroundColor Red
    Write-Host "💡 Execute este script da pasta raiz do projeto" -ForegroundColor Yellow
    exit
}

# Verificar URL da API
Write-Host ""
Write-Host "🔧 Verificando configuração da API..." -ForegroundColor Cyan

$configFile = "lib/services/config_service.dart"
if (Test-Path $configFile) {
    $configContent = Get-Content $configFile -Raw
    if ($configContent -match "10\.0\.2\.2:3000") {
        Write-Host "✅ URL da API configurada para emulador (10.0.2.2:3000)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  URL da API pode não estar configurada para emulador" -ForegroundColor Yellow
        Write-Host "💡 Certifique-se de que está usando: http://10.0.2.2:3000" -ForegroundColor Yellow
    }
}

# Executar o app
Write-Host ""
Write-Host "🚀 Executando app no emulador..." -ForegroundColor Cyan
Write-Host "⏳ Primeira vez pode demorar alguns minutos (compilação)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Dicas:" -ForegroundColor Cyan
Write-Host "   - Pressione 'r' para hot reload" -ForegroundColor Gray
Write-Host "   - Pressione 'R' para hot restart" -ForegroundColor Gray
Write-Host "   - Pressione 'q' para sair" -ForegroundColor Gray
Write-Host ""

flutter run

# Voltar para pasta raiz
Set-Location ..

