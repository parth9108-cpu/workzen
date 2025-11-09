# Seed Dashboard Data Script
Write-Host "Seeding Dashboard Data for WorkZen HRMS..." -ForegroundColor Green
Write-Host ""

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Get database connection details from DATABASE_URL
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Host "ERROR: DATABASE_URL not found in .env file" -ForegroundColor Red
    exit 1
}

# Parse DATABASE_URL (format: postgresql://user:password@host:port/database)
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "ERROR: Could not parse DATABASE_URL" -ForegroundColor Red
    exit 1
}

Write-Host "Database Configuration:" -ForegroundColor Cyan
Write-Host "  Host: $dbHost" -ForegroundColor White
Write-Host "  Port: $dbPort" -ForegroundColor White
Write-Host "  Database: $dbName" -ForegroundColor White
Write-Host "  User: $dbUser" -ForegroundColor White
Write-Host ""

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $dbPassword

# Run the SQL script
Write-Host "Executing seed script..." -ForegroundColor Yellow
try {
    $result = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "seed-dashboard-data.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Dashboard data seeded successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Data Added:" -ForegroundColor Cyan
        Write-Host "  • Today's attendance records" -ForegroundColor White
        Write-Host "  • Pending leave requests" -ForegroundColor White
        Write-Host "  • Current month payroll" -ForegroundColor White
        Write-Host "  • Historical data for charts (6 months)" -ForegroundColor White
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "  1. Restart the backend: npm start" -ForegroundColor White
        Write-Host "  2. Refresh the frontend dashboard" -ForegroundColor White
        Write-Host "  3. You should now see data in all boxes!" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Error seeding data" -ForegroundColor Red
        Write-Host $result -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure PostgreSQL client (psql) is installed and in PATH" -ForegroundColor Yellow
}

# Clear password
$env:PGPASSWORD = $null
