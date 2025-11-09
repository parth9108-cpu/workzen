# Test HR Login
Write-Host "Testing HR Login..." -ForegroundColor Cyan

$body = @{
    email = "hr@workzen.com"
    password = "hr123"
} | ConvertTo-Json

Write-Host "Request body: $body" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
    }
}
