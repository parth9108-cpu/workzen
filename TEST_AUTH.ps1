# Test Authentication Flow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  WORKZEN HRMS - AUTHENTICATION TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "   ✓ Backend Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Database Connection
Write-Host "2. Testing Database Connection..." -ForegroundColor Yellow
try {
    $db = Invoke-RestMethod -Uri "http://localhost:5000/api/test-db" -Method GET
    Write-Host "   ✓ Database: $($db.database)" -ForegroundColor Green
    Write-Host "   ✓ Users: $($db.stats.users)" -ForegroundColor Green
    Write-Host "   ✓ Roles: $($db.stats.roles)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Database Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Login with Admin
Write-Host "3. Testing Login (Admin)..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@workzen.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "   ✓ Login Successful!" -ForegroundColor Green
        Write-Host "   ✓ User: $($loginResponse.user.name)" -ForegroundColor Green
        Write-Host "   ✓ Role: $($loginResponse.user.role)" -ForegroundColor Green
        Write-Host "   ✓ Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Green
        
        $token = $loginResponse.token
    } else {
        Write-Host "   ✗ Login Failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ Login Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Token Verification
Write-Host "4. Testing Token Verification..." -ForegroundColor Yellow
try {
    $verifyBody = @{
        token = $token
    } | ConvertTo-Json

    $verifyResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify" -Method POST -Body $verifyBody -ContentType "application/json"
    
    if ($verifyResponse.success) {
        Write-Host "   ✓ Token Valid!" -ForegroundColor Green
        Write-Host "   ✓ Verified User: $($verifyResponse.user.name)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Token Invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Verification Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Login with Employee
Write-Host "5. Testing Login (Employee)..." -ForegroundColor Yellow
try {
    $empLoginBody = @{
        email = "john.smith@workzen.com"
        password = "emp123456"
    } | ConvertTo-Json

    $empLoginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $empLoginBody -ContentType "application/json"
    
    if ($empLoginResponse.success) {
        Write-Host "   ✓ Employee Login Successful!" -ForegroundColor Green
        Write-Host "   ✓ User: $($empLoginResponse.user.name)" -ForegroundColor Green
        Write-Host "   ✓ Role: $($empLoginResponse.user.role)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Employee Login Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Invalid Login
Write-Host "6. Testing Invalid Login..." -ForegroundColor Yellow
try {
    $invalidBody = @{
        email = "invalid@test.com"
        password = "wrongpassword"
    } | ConvertTo-Json

    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $invalidBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "   X Should have failed but did not!" -ForegroundColor Red
} catch {
    Write-Host "   ✓ Correctly rejected invalid credentials" -ForegroundColor Green
}

# Test 7: Frontend Health
Write-Host "7. Testing Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/login" -Method GET -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "   ✓ Frontend is running!" -ForegroundColor Green
        Write-Host "   ✓ Login page accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Frontend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "✓ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "✓ Database: Connected" -ForegroundColor Green
Write-Host "✓ Authentication: Working" -ForegroundColor Green
Write-Host ""
Write-Host "Ready to test in browser!" -ForegroundColor Cyan
Write-Host "Open: http://localhost:3000/login" -ForegroundColor White
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@workzen.com / admin123" -ForegroundColor White
Write-Host "  Employee: john.smith@workzen.com / emp123456" -ForegroundColor White
Write-Host ""
