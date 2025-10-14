#!/usr/bin/env pwsh
# GitHub Pages Deployment Script for Seven Apparel
# This script builds the project and deploys it to GitHub Pages

Write-Host "🚀 Starting GitHub Pages deployment for Seven Apparel..." -ForegroundColor Green

# Navigate to client directory
Set-Location "client"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the project
Write-Host "🔨 Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Navigate back to root
    Set-Location ".."
    
    # Remove old built files from root (but keep important files)
    Write-Host "🧹 Cleaning old files..." -ForegroundColor Yellow
    if (Test-Path "assets") { Remove-Item "assets" -Recurse -Force }
    if (Test-Path "index.html") { Remove-Item "index.html" -Force }
    
    # Copy new built files to root
    Write-Host "📁 Copying new files to root..." -ForegroundColor Yellow
    Copy-Item -Path "client\dist\*" -Destination "." -Recurse -Force
    
    # Add and commit changes
    Write-Host "📝 Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "🚀 Deploy: Update GitHub Pages with latest build $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    
    # Push to GitHub
    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Deployment successful!" -ForegroundColor Green
        Write-Host "🌐 Your site will be available at: https://www.seven-appareal.com" -ForegroundColor Cyan
        Write-Host "⏱️  It may take a few minutes for changes to appear." -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Set-Location ".."
}