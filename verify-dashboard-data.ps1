# Verify Dashboard Data
Write-Host "Verifying Dashboard Data..." -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "1. Checking Backend Status..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction Stop
    Write-Host "   ✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is not running. Please start it first." -ForegroundColor Red
    Write-Host "   Run: cd workzen-backend && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check employees
Write-Host "2. Checking Employees Data..." -ForegroundColor Cyan
try {
    $employees = Invoke-RestMethod -Uri "http://localhost:5000/api/users?limit=100" -Method Get -ErrorAction Stop
    $empCount = $employees.count
    Write-Host "   ✅ Total Employees: $empCount" -ForegroundColor Green
    
    if ($empCount -eq 0) {
        Write-Host "   ⚠️  No employees found. Run seed script." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error fetching employees" -ForegroundColor Red
}

Write-Host ""

# Check today's attendance
Write-Host "3. Checking Today's Attendance..." -ForegroundColor Cyan
try {
    $attendance = Invoke-RestMethod -Uri "http://localhost:5000/api/attendance?limit=100" -Method Get -ErrorAction Stop
    $attCount = $attendance.count
    
    # Filter for today's date
    $today = Get-Date -Format "yyyy-MM-dd"
    $todayAtt = $attendance.data | Where-Object { $_.date -like "$today*" }
    $todayCount = ($todayAtt | Measure-Object).Count
    
    Write-Host "   ✅ Total Attendance Records: $attCount" -ForegroundColor Green
    Write-Host "   ✅ Today's Attendance: $todayCount" -ForegroundColor Green
    
    if ($todayCount -gt 0) {
        $presentCount = ($todayAtt | Where-Object { $_.status -eq 'Present' } | Measure-Object).Count
        Write-Host "   ✅ Present Today: $presentCount" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No attendance for today. Run: node seed-dashboard.js" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error fetching attendance" -ForegroundColor Red
}

Write-Host ""

# Check pending leaves
Write-Host "4. Checking Pending Leaves..." -ForegroundColor Cyan
try {
    $leaves = Invoke-RestMethod -Uri "http://localhost:5000/api/leaves?limit=100" -Method Get -ErrorAction Stop
    $leaveCount = $leaves.count
    
    $pendingLeaves = $leaves.data | Where-Object { $_.status -eq 'Pending' }
    $pendingCount = ($pendingLeaves | Measure-Object).Count
    
    Write-Host "   ✅ Total Leave Requests: $leaveCount" -ForegroundColor Green
    Write-Host "   ✅ Pending Leaves: $pendingCount" -ForegroundColor Green
    
    if ($pendingCount -eq 0) {
        Write-Host "   ⚠️  No pending leaves. Run: node seed-dashboard.js" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error fetching leaves" -ForegroundColor Red
}

Write-Host ""

# Check payroll
Write-Host "5. Checking Payroll Data..." -ForegroundColor Cyan
try {
    $payroll = Invoke-RestMethod -Uri "http://localhost:5000/api/payroll?limit=100" -Method Get -ErrorAction Stop
    $payrollCount = $payroll.count
    
    # Filter for current month
    $currentMonth = Get-Date -Format "yyyy-MM"
    $currentPayroll = $payroll.data | Where-Object { $_.month -eq $currentMonth }
    $currentCount = ($currentPayroll | Measure-Object).Count
    
    Write-Host "   ✅ Total Payroll Records: $payrollCount" -ForegroundColor Green
    Write-Host "   ✅ Current Month Payroll: $currentCount" -ForegroundColor Green
    
    if ($currentCount -eq 0) {
        Write-Host "   ⚠️  No payroll for current month. Run: node seed-dashboard.js" -ForegroundColor Yellow
    } else {
        # Calculate total
        $totalPayroll = 0
        foreach ($p in $currentPayroll) {
            $netSalary = [decimal]$p.net_salary
            $totalPayroll += $netSalary
        }
        $totalInLakhs = [math]::Round($totalPayroll / 100000, 2)
        Write-Host "   ✅ Monthly Payroll Total: ₹$totalInLakhs Lakhs" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Error fetching payroll" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Verification Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "Dashboard Summary:" -ForegroundColor Yellow
Write-Host "  • Total Employees: $empCount" -ForegroundColor White
if ($todayCount) {
    Write-Host "  • Present Today: $presentCount" -ForegroundColor White
}
if ($pendingCount) {
    Write-Host "  • Pending Leaves: $pendingCount" -ForegroundColor White
}
if ($currentCount) {
    Write-Host "  • Current Month Payroll: $currentCount records" -ForegroundColor White
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  2. Refresh the dashboard page" -ForegroundColor White
Write-Host "  3. All boxes should now show data!" -ForegroundColor White
Write-Host ""
