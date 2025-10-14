# Seven Apparel - Quick Start Script
Write-Host "🛍️  Seven Apparel - Quick Start Setup" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js found: $nodeVersion`n" -ForegroundColor Green

# Check if MongoDB is installed
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
$mongoVersion = mongod --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  MongoDB not found. Please install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
} else {
    Write-Host "✅ MongoDB found`n" -ForegroundColor Green
}

# Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed`n" -ForegroundColor Green

# Setup Server
Write-Host "📦 Setting up backend server..." -ForegroundColor Yellow
Set-Location -Path "server"

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating server .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Server .env file created. Please update with your configuration." -ForegroundColor Green
} else {
    Write-Host "ℹ️  Server .env file already exists" -ForegroundColor Cyan
}

Set-Location -Path ".."
Write-Host "✅ Server setup complete`n" -ForegroundColor Green

# Setup Client
Write-Host "📦 Setting up frontend client..." -ForegroundColor Yellow
Set-Location -Path "client"

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating client .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Client .env file created. Please update with your configuration." -ForegroundColor Green
} else {
    Write-Host "ℹ️  Client .env file already exists" -ForegroundColor Cyan
}

Set-Location -Path ".."
Write-Host "✅ Client setup complete`n" -ForegroundColor Green

# Final Instructions
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================`n" -ForegroundColor Green

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update server/.env with your MongoDB URI and API keys" -ForegroundColor White
Write-Host "2. Update client/.env with your API keys" -ForegroundColor White
Write-Host "3. Make sure MongoDB is running" -ForegroundColor White
Write-Host "4. Run 'npm run dev' to start both server and client`n" -ForegroundColor White

Write-Host "🚀 Quick Commands:" -ForegroundColor Cyan
Write-Host "   npm run dev      - Start both server and client" -ForegroundColor White
Write-Host "   npm run server   - Start server only" -ForegroundColor White
Write-Host "   npm run client   - Start client only`n" -ForegroundColor White

Write-Host "📚 For detailed instructions, see SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "`nHappy coding! 🎨" -ForegroundColor Green
