<#
Smoke test script for Group_27_Project backend
Run from repo root (PowerShell):
  cd D:/Group_27_Project
  ./scripts/run_smoke_tests.ps1

This script will perform (in order):
  1. Signup (create test user)
  2. Login - Wrong password repeated to trigger rate limit
  3. Login - Correct (save tokens)
  4. Refresh token
  5. Upload avatar (requires access token)
  6. Forgot password (captures token if returned in dev)
  7. Reset password (uses returned token)
  8. Admin Get Logs (optional - requires ADMIN_ACCESS_TOKEN env var)

Configure variables below before running if you want to change defaults.
#>

# Config
$baseUrl = $env:BASE_URL -or 'http://localhost:3000'
$testEmail = $env:TEST_USER_EMAIL -or 'test.user@example.com'
$testPassword = $env:TEST_USER_PASSWORD -or 'TestPass123!'
$newPassword = $env:TEST_NEW_PASSWORD -or 'NewPass123!'
$avatarPath = $env:AVATAR_FILE_PATH -or "$PSScriptRoot\..\backend\tests\test-avatar.jpg"
$wrongAttempts = 6
$adminToken = $env:ADMIN_ACCESS_TOKEN

Write-Host "Base URL: $baseUrl"
Write-Host "Test user: $testEmail"

function SafeInvoke([scriptblock]$block) {
  try {
    & $block
n  } catch {
    return $_
  }
}

# Helper to pretty print response body
function PrintResponse($resp) {
  if ($null -eq $resp) { Write-Host "<no response>"; return }
  if ($resp -is [string]) { Write-Host $resp; return }
  $json = $resp | ConvertTo-Json -Depth 5
  Write-Host $json
}

# 1) Signup
Write-Host "`n=== STEP 1: Signup ==="
$body = @{ name = 'Test User'; email = $testEmail; password = $testPassword } | ConvertTo-Json
try {
  $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 30
  Write-Host "Signup response:"; PrintResponse $r
} catch {
  # if user exists, show the response
  $resp = $_.Exception.Response
  if ($resp) {
    $raw = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    Write-Host "Signup error response:"; Write-Host $raw
  } else {
    Write-Host "Signup error: $_"
  }
}

# 2) Login wrong password attempts to trigger rate-limit
Write-Host "`n=== STEP 2: Login wrong password x $wrongAttempts ==="
for ($i=1; $i -le $wrongAttempts; $i++) {
  try {
    $body = @{ email = $testEmail; password = 'wrongpassword' } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 10
    Write-Host "Attempt $i: Success (unexpected)":; PrintResponse $r
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $status = $resp.StatusCode.value__
      Write-Host "Attempt $i: HTTP $status"
      $raw = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
      Write-Host $raw
      $retry = $resp.Headers['Retry-After']
      if ($retry) { Write-Host "Retry-After: $retry seconds" }
    } else {
      Write-Host "Attempt $i: Error - $_"
    }
  }
}

# 3) Login correct
Write-Host "`n=== STEP 3: Login correct ==="
try {
  $body = @{ email = $testEmail; password = $testPassword } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 15
  Write-Host "Login success:"; PrintResponse $r
  $accessToken = $r.accessToken
  $refreshToken = $r.refreshToken
  Write-Host "Saved access token and refresh token."
} catch {
  Write-Host "Login correct failed:"; Write-Host $_
}

# 4) Refresh
if ($null -ne $refreshToken) {
  Write-Host "`n=== STEP 4: Refresh token ==="
  try {
    $body = @{ refreshToken = $refreshToken } | ConvertTo-Json
    $r2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 15
    Write-Host "Refresh response:"; PrintResponse $r2
    if ($r2.accessToken) { $accessToken = $r2.accessToken }
    if ($r2.refreshToken) { $refreshToken = $r2.refreshToken }
  } catch {
    Write-Host "Refresh failed:"; Write-Host $_
  }
} else { Write-Host "No refresh token available, skipping refresh." }

# 5) Upload avatar
if ($null -ne $accessToken) {
  Write-Host "`n=== STEP 5: Upload avatar ==="
  if (Test-Path $avatarPath) {
    try {
      $headers = @{ Authorization = "Bearer $accessToken" }
      $form = @{ avatar = Get-Item $avatarPath }
      $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/upload-avatar" -Method Post -Headers $headers -Form $form -TimeoutSec 60
      Write-Host "Upload response:"; PrintResponse $r
    } catch {
      Write-Host "Upload failed:"; Write-Host $_
    }
  } else { Write-Host "Avatar file not found at $avatarPath - skipping upload." }
} else { Write-Host "No access token - cannot upload avatar." }

# 6) Forgot password
Write-Host "`n=== STEP 6: Forgot password ==="
try {
  $body = @{ email = $testEmail } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/forgot-password" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 15
  Write-Host "Forgot-password response:"; PrintResponse $r
  if ($r.token) { $rawToken = $r.token; Write-Host "Captured raw token (dev): $rawToken" }
} catch {
  Write-Host "Forgot-password failed:"; Write-Host $_
}

# 7) Reset password
if ($null -ne $rawToken) {
  Write-Host "`n=== STEP 7: Reset password ==="
  try {
    $body = @{ token = $rawToken; newPassword = $newPassword } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/reset-password" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 15
    Write-Host "Reset response:"; PrintResponse $r
    Write-Host "Now try logging in with new password..."
    $body2 = @{ email = $testEmail; password = $newPassword } | ConvertTo-Json
    $r2 = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body2 -ContentType 'application/json' -TimeoutSec 15
    Write-Host "Login with new password response:"; PrintResponse $r2
  } catch {
    Write-Host "Reset password error:"; Write-Host $_
  }
} else {
  Write-Host "No raw reset token captured (in production token not returned). If you want to test reset, check the email inbox or set NODE_ENV != 'production' on server."
}

# 8) Admin Get Logs (optional)
Write-Host "`n=== STEP 8: Admin get logs (optional) ==="
if ($adminToken) {
  try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $logs = Invoke-RestMethod -Uri "$baseUrl/admin/logs?limit=50" -Method Get -Headers $headers -TimeoutSec 15
    Write-Host "Admin logs:"; PrintResponse $logs
  } catch {
    Write-Host "Admin logs request failed:"; Write-Host $_
  }
} else {
  Write-Host "No ADMIN_ACCESS_TOKEN env var set. To fetch admin logs, set ADMIN_ACCESS_TOKEN and re-run or promote your test user to admin and login to get a token."
}

Write-Host "`nAll steps completed."

# EOF
