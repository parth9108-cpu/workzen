# Create Users via API
# Make sure the server is running before executing this script

$baseUrl = "http://localhost:5000/api/users"

Write-Host "Creating users in WorkZen HRMS..." -ForegroundColor Cyan
Write-Host ""

# 1. Admin User
Write-Host "1. Creating Admin..." -ForegroundColor Yellow
$admin = @{
    name = "Admin User"
    email = "admin@workzen.com"
    password = "admin123"
    role_id = 1
    department_id = 1
    designation_id = 1
    base_salary = 100000
    phone = "+1234567890"
    address = "123 Admin Street"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $admin -ContentType "application/json"
    Write-Host "✓ Admin created: $($result.data.name)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error creating Admin: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. HR Officer
Write-Host "2. Creating HR Officer..." -ForegroundColor Yellow
$hr = @{
    name = "Sarah Johnson"
    email = "sarah.hr@workzen.com"
    password = "hr123456"
    role_id = 2
    department_id = 2
    designation_id = 2
    base_salary = 60000
    phone = "+1234567891"
    address = "456 HR Avenue"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $hr -ContentType "application/json"
    Write-Host "✓ HR Officer created: $($result.data.name)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error creating HR Officer: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Payroll Officer
Write-Host "3. Creating Payroll Officer..." -ForegroundColor Yellow
$payroll = @{
    name = "Michael Chen"
    email = "michael.payroll@workzen.com"
    password = "payroll123"
    role_id = 3
    department_id = 3
    designation_id = 3
    base_salary = 55000
    phone = "+1234567892"
    address = "789 Finance Road"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $payroll -ContentType "application/json"
    Write-Host "✓ Payroll Officer created: $($result.data.name)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error creating Payroll Officer: $($_.Exception.Message)" -ForegroundColor Red
}

# 4-9. Six Employees
$employees = @(
    @{
        name = "John Smith"
        email = "john.smith@workzen.com"
        password = "emp123456"
        role_id = 4
        department_id = 4
        designation_id = 4
        base_salary = 45000
        phone = "+1234567893"
        address = "100 Employee Lane"
    },
    @{
        name = "Emily Davis"
        email = "emily.davis@workzen.com"
        password = "emp123456"
        role_id = 4
        department_id = 5
        designation_id = 5
        base_salary = 40000
        phone = "+1234567894"
        address = "101 Employee Lane"
    },
    @{
        name = "Robert Wilson"
        email = "robert.wilson@workzen.com"
        password = "emp123456"
        role_id = 4
        department_id = 4
        designation_id = 4
        base_salary = 42000
        phone = "+1234567895"
        address = "102 Employee Lane"
    },
    @{
        name = "Lisa Anderson"
        email = "lisa.anderson@workzen.com"
        password = "emp123456"
        role_id = 4
        department_id = 6
        designation_id = 6
        base_salary = 38000
        phone = "+1234567896"
        address = "103 Employee Lane"
    },
    @{
        name = "David Martinez"
        email = "david.martinez@workzen.com"
        password = "emp123456"
        role_id = 4
        department_id = 5
        designation_id = 5
        base_salary = 41000
        phone = "+1234567897"
        address = "104 Employee Lane"
    },
    @{
        name = "Jennifer Taylor"
        email = "jennifer.taylor@workzen.com"
        password = "emp123456"
        role_id = 4
        department_id = 4
        designation_id = 6
        base_salary = 39000
        phone = "+1234567898"
        address = "105 Employee Lane"
    }
)

$empCount = 4
foreach ($emp in $employees) {
    Write-Host "$empCount. Creating Employee: $($emp.name)..." -ForegroundColor Yellow
    $empJson = $emp | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri $baseUrl -Method POST -Body $empJson -ContentType "application/json"
        Write-Host "✓ Employee created: $($result.data.name)" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Error creating $($emp.name): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $empCount++
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
    $allUsers.data | ForEach-Object {
        Write-Host "  - $($_.name) ($($_.email)) - Role ID: $($_.role_id)" -ForegroundColor White
    }
}
catch {
    Write-Host "Error fetching users: $($_.Exception.Message)" -ForegroundColor Red
}
