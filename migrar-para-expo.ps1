# Script para migrar projeto React Native para Expo
# Execute na raiz do projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migrando para Expo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$mobilePath = "mobile"
$expoTempPath = "mobile-expo-temp"
$backupPath = "mobile-backup"

# 1. Fazer backup
Write-Host "1. Fazendo backup do código atual..." -ForegroundColor Yellow
if (Test-Path $backupPath) {
    Remove-Item -Recurse -Force $backupPath
}
New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
Copy-Item -Path "$mobilePath\src" -Destination "$backupPath\src" -Recurse -Force
Copy-Item -Path "$mobilePath\App.tsx" -Destination "$backupPath\App.tsx" -Force
Copy-Item -Path "$mobilePath\package.json" -Destination "$backupPath\package.json" -Force
Write-Host "   ✓ Backup criado em: $backupPath" -ForegroundColor Green
Write-Host ""

# 2. Copiar código para Expo
Write-Host "2. Copiando código para projeto Expo..." -ForegroundColor Yellow
Copy-Item -Path "$mobilePath\src" -Destination "$expoTempPath\src" -Recurse -Force
Copy-Item -Path "$mobilePath\App.tsx" -Destination "$expoTempPath\App.tsx" -Force
Write-Host "   ✓ Código copiado" -ForegroundColor Green
Write-Host ""

# 3. Atualizar package.json
Write-Host "3. Atualizando dependências..." -ForegroundColor Yellow
$expoPackageJson = Get-Content "$expoTempPath\package.json" | ConvertFrom-Json
$oldPackageJson = Get-Content "$mobilePath\package.json" | ConvertFrom-Json

# Adicionar dependências do projeto antigo
$expoPackageJson.dependencies["@react-navigation/native"] = $oldPackageJson.dependencies["@react-navigation/native"]
$expoPackageJson.dependencies["@react-navigation/stack"] = $oldPackageJson.dependencies["@react-navigation/stack"]
$expoPackageJson.dependencies["@react-navigation/bottom-tabs"] = $oldPackageJson.dependencies["@react-navigation/bottom-tabs"]
$expoPackageJson.dependencies["react-native-screens"] = $oldPackageJson.dependencies["react-native-screens"]
$expoPackageJson.dependencies["react-native-safe-area-context"] = $oldPackageJson.dependencies["react-native-safe-area-context"]
$expoPackageJson.dependencies["react-native-gesture-handler"] = $oldPackageJson.dependencies["react-native-gesture-handler"]
$expoPackageJson.dependencies["@react-native-async-storage/async-storage"] = $oldPackageJson.dependencies["@react-native-async-storage/async-storage"]
$expoPackageJson.dependencies["react-native-keychain"] = $oldPackageJson.dependencies["react-native-keychain"]
$expoPackageJson.dependencies["axios"] = $oldPackageJson.dependencies["axios"]
$expoPackageJson.dependencies["react-native-paper"] = $oldPackageJson.dependencies["react-native-paper"]
$expoPackageJson.dependencies["react-native-vector-icons"] = $oldPackageJson.dependencies["react-native-vector-icons"]
$expoPackageJson.dependencies["date-fns"] = $oldPackageJson.dependencies["date-fns"]

# Atualizar nome
$expoPackageJson.name = "ekklesia-mobile"

# Salvar
$expoPackageJson | ConvertTo-Json -Depth 10 | Set-Content "$expoTempPath\package.json"
Write-Host "   ✓ package.json atualizado" -ForegroundColor Green
Write-Host ""

# 4. Instalar dependências
Write-Host "4. Instalando dependências..." -ForegroundColor Yellow
Set-Location $expoTempPath
npm install
Set-Location ..
Write-Host "   ✓ Dependências instaladas" -ForegroundColor Green
Write-Host ""

# 5. Atualizar app.json
Write-Host "5. Configurando app.json..." -ForegroundColor Yellow
$appJson = Get-Content "$expoTempPath\app.json" | ConvertFrom-Json
$appJson.name = "Ekklesia"
$appJson.displayName = "Ekklesia"
$appJson | ConvertTo-Json -Depth 10 | Set-Content "$expoTempPath\app.json"
Write-Host "   ✓ app.json configurado" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migração concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Testar o projeto Expo:" -ForegroundColor Gray
Write-Host "   cd mobile-expo-temp" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. Se funcionar, substitua a pasta mobile:" -ForegroundColor Gray
Write-Host "   # Fazer backup da pasta mobile atual" -ForegroundColor DarkGray
Write-Host "   # Renomear mobile para mobile-old" -ForegroundColor DarkGray
Write-Host "   # Renomear mobile-expo-temp para mobile" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Backup está em: $backupPath" -ForegroundColor Gray
Write-Host ""

