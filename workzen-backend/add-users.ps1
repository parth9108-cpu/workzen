# Create Users via API
$baseUrl = "http://localhost:5000/api/users"

Write-Host "Creating users in WorkZen HRMS..." -ForegroundColor Cyan
Write-Host ""

# 1. Admin User
Write-Host "1. Creating Admin..." -ForegroundColor Yellow
$admin = '{"name":"Admin User","email":"admin@workzen.com","password":"admin123","role_id":1,"department_id":1,"designation_id":1,"base_salary":100000,"phone":"+1234567890","address":"123 Admin Street"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $admin -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. HR Officer
Write-Host "2. Creating HR Officer..." -ForegroundColor Yellow
$hr = '{"name":"Sarah Johnson","email":"sarah.hr@workzen.com","password":"hr123456","role_id":2,"department_id":2,"designation_id":2,"base_salary":60000,"phone":"+1234567891","address":"456 HR Avenue"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $hr -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Payroll Officer
Write-Host "3. Creating Payroll Officer..." -ForegroundColor Yellow
$payroll = '{"name":"Michael Chen","email":"michael.payroll@workzen.com","password":"payroll123","role_id":3,"department_id":3,"designation_id":3,"base_salary":55000,"phone":"+1234567892","address":"789 Finance Road"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $payroll -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Employee 1
Write-Host "4. Creating Employee: John Smith..." -ForegroundColor Yellow
$emp1 = '{"name":"John Smith","email":"john.smith@workzen.com","password":"emp123456","role_id":4,"department_id":4,"designation_id":4,"base_salary":45000,"phone":"+1234567893","address":"100 Employee Lane"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $emp1 -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Employee 2
Write-Host "5. Creating Employee: Emily Davis..." -ForegroundColor Yellow
$emp2 = '{"name":"Emily Davis","email":"emily.davis@workzen.com","password":"emp123456","role_id":4,"department_id":5,"designation_id":5,"base_salary":40000,"phone":"+1234567894","address":"101 Employee Lane"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $emp2 -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Employee 3
Write-Host "6. Creating Employee: Robert Wilson..." -ForegroundColor Yellow
$emp3 = '{"name":"Robert Wilson","email":"robert.wilson@workzen.com","password":"emp123456","role_id":4,"department_id":4,"designation_id":4,"base_salary":42000,"phone":"+1234567895","address":"102 Employee Lane"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $emp3 -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Employee 4
Write-Host "7. Creating Employee: Lisa Anderson..." -ForegroundColor Yellow
$emp4 = '{"name":"Lisa Anderson","email":"lisa.anderson@workzen.com","password":"emp123456","role_id":4,"department_id":6,"designation_id":6,"base_salary":38000,"phone":"+1234567896","address":"103 Employee Lane"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $emp4 -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Employee 5
Write-Host "8. Creating Employee: David Martinez..." -ForegroundColor Yellow
$emp5 = '{"name":"David Martinez","email":"david.martinez@workzen.com","password":"emp123456","role_id":4,"department_id":5,"designation_id":5,"base_salary":41000,"phone":"+1234567897","address":"104 Employee Lane"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $emp5 -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Employee 6
Write-Host "9. Creating Employee: Jennifer Taylor..." -ForegroundColor Yellow
$emp6 = '{"name":"Jennifer Taylor","email":"jennifer.taylor@workzen.com","password":"emp123456","role_id":4,"department_id":4,"designation_id":6,"base_salary":39000,"phone":"+1234567898","address":"105 Employee Lane"}'
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $emp6 -ContentType "application/json"
    Write-Host "Success: $($result.data.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "User creation complete!" -ForegroundColor Cyan
Write-Host ""

# Display all users
Write-Host "Fetching all users..." -ForegroundColor Cyan
try {
    $allUsers = Invoke-RestMethod -Uri $baseUrl -Method GET
    Write-Host "Total users created: $($allUsers.count)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Users List:" -ForegroundColor Cyan
    foreach ($user in $allUsers.data) {
        Write-Host "  - $($user.name) ($($user.email)) - Role ID: $($user.role_id)" -ForegroundColor White
    }
} catch {
    Write-Host "Error fetching users: $($_.Exception.Message)" -ForegroundColor Red
}
