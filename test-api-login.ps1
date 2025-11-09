$body = @{
    email = "admin@workzen.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $body

Write-Host "Login Response:"
$response | ConvertTo-Json -Depth 10
