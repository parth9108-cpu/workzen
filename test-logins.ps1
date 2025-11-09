# Test Login Credentials
Write-Host "Testing Login Credentials..." -ForegroundColor Cyan
Write-Host ""

$credentials = @(
    @{ Email = "admin@workzen.com"; Password = "password123"; Role = "Admin" }
    @{ Email = "hr@workzen.com"; Password = "hr123456"; Role = "HR Officer" }
    @{ Email = "payroll@workzen.com"; Password = "payroll123"; Role = "Payroll Officer" }
    @{ Email = "employee@workzen.com"; Password = "emp123456"; Role = "Employee" }
)

foreach ($cred in $credentials) {
    Write-Host "Testing: $($cred.Email)" -ForegroundColor Yellow
    
    $body = @{
        email = $cred.Email
        password = $cred.Password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "  [OK] Login successful" -ForegroundColor Green
            Write-Host "  User: $($response.user.name)" -ForegroundColor Gray
            Write-Host "  Role: $($response.user.role)" -ForegroundColor Gray
        } else {
            Write-Host "  [FAIL] $($response.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Working Credentials:" -ForegroundColor Yellow
Write-Host "  Admin:    admin@workzen.com / password123" -ForegroundColor Gray
Write-Host "  HR:       hr@workzen.com / hr123456" -ForegroundColor Gray
Write-Host "  Payroll:  payroll@workzen.com / payroll123" -ForegroundColor Gray
Write-Host "  Employee: employee@workzen.com / emp123456" -ForegroundColor Gray
