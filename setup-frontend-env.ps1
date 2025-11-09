# Setup Frontend Environment Variables
Write-Host "Setting up WorkZen Frontend Environment..." -ForegroundColor Green

$envContent = @"
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
"@

$envPath = "workzen-frontend\.env.local"

# Create .env.local file
Set-Content -Path $envPath -Value $envContent

Write-Host "`n✅ Environment file created at: $envPath" -ForegroundColor Green
Write-Host "`nConfiguration:" -ForegroundColor Cyan
Write-Host "  API URL: http://localhost:5000" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Start the backend: cd workzen-backend && npm start" -ForegroundColor White
Write-Host "  2. Start the frontend: cd workzen-frontend && npm run dev" -ForegroundColor White
Write-Host "  3. Open browser: http://localhost:3000" -ForegroundColor White

Write-Host "`n✨ Frontend is now connected to the backend!" -ForegroundColor Green
