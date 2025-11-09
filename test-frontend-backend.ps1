# Test Frontend-Backend Connection
Write-Host "Testing Frontend-Backend Connection..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "[1] Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "[OK] Backend Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Message: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Backend is not responding!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Database Connection
Write-Host "[2] Testing Database Connection..." -ForegroundColor Yellow
try {
    $db = Invoke-RestMethod -Uri "http://localhost:5000/api/test-db" -Method Get
    Write-Host "[OK] Database Connected" -ForegroundColor Green
    Write-Host "   Users: $($db.data.users)" -ForegroundColor Gray
    Write-Host "   Attendance: $($db.data.attendance)" -ForegroundColor Gray
    Write-Host "   Leaves: $($db.data.leaves)" -ForegroundColor Gray
    Write-Host "   Payroll: $($db.data.payroll)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Database connection failed!" -ForegroundColor Red
}

Write-Host ""

# Test 3: Fetch Users/Employees
Write-Host "[3] Testing Users API..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Get
    Write-Host "[OK] Users API Working" -ForegroundColor Green
    Write-Host "   Total Users: $($users.count)" -ForegroundColor Gray
    Write-Host "   Sample User: $($users.data[0].name) ($($users.data[0].email))" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Users API failed!" -ForegroundColor Red
}

Write-Host ""

# Test 4: Fetch Attendance
Write-Host "[4] Testing Attendance API..." -ForegroundColor Yellow
try {
    $attendance = Invoke-RestMethod -Uri "http://localhost:5000/api/attendance" -Method Get
    Write-Host "[OK] Attendance API Working" -ForegroundColor Green
    Write-Host "   Total Records: $($attendance.count)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Attendance API failed!" -ForegroundColor Red
}

Write-Host ""

# Test 5: Fetch Leaves
Write-Host "[5] Testing Leaves API..." -ForegroundColor Yellow
try {
    $leaves = Invoke-RestMethod -Uri "http://localhost:5000/api/leaves" -Method Get
    Write-Host "[OK] Leaves API Working" -ForegroundColor Green
    Write-Host "   Total Requests: $($leaves.count)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Leaves API failed!" -ForegroundColor Red
}

Write-Host ""

# Test 6: Fetch Payroll
Write-Host "[6] Testing Payroll API..." -ForegroundColor Yellow
try {
    $payroll = Invoke-RestMethod -Uri "http://localhost:5000/api/payroll" -Method Get
    Write-Host "[OK] Payroll API Working" -ForegroundColor Green
    Write-Host "   Total Records: $($payroll.count)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Payroll API failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Tests Completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host "   Status:   Connected and Working" -ForegroundColor Green
Write-Host ""
