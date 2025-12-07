# Script para testar o app mobile sem celular físico
# Uso: .\testar-app.ps1 [web|android|windows]

param(
    [string]$Device = "web"
)

Write-Host "🚀 Iniciando app mobile Ekklesia..." -ForegroundColor Green
Write-Host ""

# Navegar para pasta mobile
if (Test-Path "mobile") {
    Set-Location mobile
} else {
    Write-Host "❌ Pasta 'mobile' não encontrada!" -ForegroundColor Red
    Write-Host "💡 Execute este script da pasta raiz do projeto" -ForegroundColor Yellow
    exit
}

# Verificar se servidor está rodando
$serverRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $serverRunning) {
    Write-Host "⚠️  Servidor não está rodando na porta 3000!" -ForegroundColor Yellow
    Write-Host "💡 Execute 'npm run dev' em outro terminal antes de continuar" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

# Escolher dispositivo baseado no parâmetro
switch ($Device.ToLower()) {
    "web" {
        Write-Host "🌐 Iniciando no navegador Chrome..." -ForegroundColor Cyan
        Write-Host "📝 URL da API será: http://localhost:3000" -ForegroundColor Gray
        flutter run -d chrome
    }
    "android" {
        Write-Host "📱 Iniciando no emulador Android..." -ForegroundColor Cyan
        Write-Host "📝 URL da API será: http://10.0.2.2:3000" -ForegroundColor Gray
        Write-Host "⚠️  Certifique-se de que o emulador está rodando!" -ForegroundColor Yellow
        flutter run -d android
    }
    "windows" {
        Write-Host "🪟 Iniciando no Windows..." -ForegroundColor Cyan
        Write-Host "📝 URL da API será: http://localhost:3000" -ForegroundColor Gray
        flutter run -d windows
    }
    default {
        Write-Host "❌ Dispositivo inválido!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Uso: .\testar-app.ps1 [web|android|windows]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Exemplos:" -ForegroundColor Cyan
        Write-Host "  .\testar-app.ps1 web      # Executa no navegador (mais rápido)"
        Write-Host "  .\testar-app.ps1 android  # Executa no emulador Android"
        Write-Host "  .\testar-app.ps1 windows  # Executa como app Windows"
        exit
    }
}

# Voltar para pasta raiz
Set-Location ..

