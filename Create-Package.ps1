Write-Host "Creating Restaurant POS Distribution Package..." -ForegroundColor Cyan

$distFolder = "RestaurantPOS-Portable"
$zipName = "RestaurantPOS-v1.0.0.zip"

if (Test-Path $distFolder) {
    Remove-Item -Recurse -Force $distFolder
}

New-Item -ItemType Directory -Path $distFolder | Out-Null

Write-Host "Copying files..."

Copy-Item -Path ".next" -Destination "$distFolder\.next" -Recurse -Force
Copy-Item -Path "public" -Destination "$distFolder\public" -Recurse -Force
Copy-Item -Path "lib" -Destination "$distFolder\lib" -Recurse -Force  
Copy-Item -Path "node_modules" -Destination "$distFolder\node_modules" -Recurse -Force
Copy-Item -Path "package.json" -Destination "$distFolder\package.json" -Force
Copy-Item -Path "server.js" -Destination "$distFolder\server.js" -Force
Copy-Item -Path "pos_restaurant.db" -Destination "$distFolder\pos_restaurant.db" -Force
Copy-Item -Path "Start-POS.bat" -Destination "$distFolder\Start-POS.bat" -Force
Copy-Item -Path "INSTALLATION_GUIDE.md" -Destination "$distFolder\INSTALLATION_GUIDE.md" -Force

$readme = "Restaurant POS System - Quick Start: Double-click Start-POS.bat"
$readme | Out-File -FilePath "$distFolder\README.txt" -Encoding UTF8

Write-Host "Creating ZIP archive..."
if (Test-Path $zipName) {
    Remove-Item $zipName -Force
}

Compress-Archive -Path "$distFolder\*" -DestinationPath $zipName -Force

$size = [math]::Round((Get-Item $zipName).Length / 1MB, 2)
Write-Host "`nPackage created: $zipName ($size MB)" -ForegroundColor Green
Write-Host "Ready for distribution!" -ForegroundColor Green

Remove-Item -Recurse -Force $distFolder
