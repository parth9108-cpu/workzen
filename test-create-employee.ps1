# Test creating a new employee via API

Write-Host "Testing Employee Creation API..." -ForegroundColor Cyan

$newEmployee = @{
    name = "Test Employee"
    email = "test.employee@workzen.com"
    password = "test123456"
    phone = "1234567890"
    role_id = 4
} | ConvertTo-Json

Write-Host "`nSending request to create employee..." -ForegroundColor Yellow
Write-Host "Data: $newEmployee" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/users" `
        -Method Post `
        -ContentType "application/json" `
        -Body $newEmployee

    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
