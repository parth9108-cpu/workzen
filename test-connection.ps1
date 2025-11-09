# Test Frontend-Backend Connection
Write-Host "Testing WorkZen Frontend-Backend Connection..." -ForegroundColor Green
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction Stop
    Write-Host "  ✅ Backend is running" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host "  Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "  ❌ Backend is not running" -ForegroundColor Red
    Write-Host "  Please start the backend: cd workzen-backend && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Check database connection
Write-Host "Test 2: Checking database connection..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/test-db" -Method Get -ErrorAction Stop
    Write-Host "  ✅ Database is connected" -ForegroundColor Green
    Write-Host "  Database: $($response.database)" -ForegroundColor White
    Write-Host "  Users: $($response.stats.users)" -ForegroundColor White
    Write-Host "  Roles: $($response.stats.roles)" -ForegroundColor White
} catch {
    Write-Host "  ❌ Database connection failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 3: Check if frontend env is configured
Write-Host "Test 3: Checking frontend configuration..." -ForegroundColor Cyan
if (Test-Path "workzen-frontend\.env.local") {
    Write-Host "  ✅ Environment file exists" -ForegroundColor Green
    $envContent = Get-Content "workzen-frontend\.env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_API_URL") {
        Write-Host "  ✅ API URL is configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  API URL not found in .env.local" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  .env.local file not found" -ForegroundColor Yellow
    Write-Host "  Run: .\setup-frontend-env.ps1" -ForegroundColor White
}

Write-Host ""

# Test 4: Test API endpoints
Write-Host "Test 4: Testing API endpoints..." -ForegroundColor Cyan

# Test users endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/users?limit=5" -Method Get -ErrorAction Stop
    Write-Host "  ✅ Users API working - Found $($response.count) users" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Users API failed" -ForegroundColor Red
}

# Test attendance endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/attendance?limit=5" -Method Get -ErrorAction Stop
    Write-Host "  ✅ Attendance API working - Found $($response.count) records" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Attendance API failed" -ForegroundColor Red
}

# Test leaves endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/leaves?limit=5" -Method Get -ErrorAction Stop
    Write-Host "  ✅ Leaves API working - Found $($response.count) requests" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Leaves API failed" -ForegroundColor Red
}

# Test payroll endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/payroll?limit=5" -Method Get -ErrorAction Stop
    Write-Host "  ✅ Payroll API working - Found $($response.count) records" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Payroll API failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Connection Test Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start frontend: cd workzen-frontend && npm run dev" -ForegroundColor White
Write-Host "  2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  3. All pages will now fetch data from the database!" -ForegroundColor White
Write-Host ""
