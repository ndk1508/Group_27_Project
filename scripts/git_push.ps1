param(
  [string]$Branch = $(git rev-parse --abbrev-ref HEAD 2>$null),
  [string]$Message = "chore: update changes",
  [string[]]$Files = @()
)

# Move to repo root (one level up from scripts)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $RepoRoot

Write-Host "Repo: $RepoRoot"
Write-Host "Branch target: $Branch"
if ($Files.Count -gt 0) {
  Write-Host "Files to stage: $($Files -join ', ')"
} else {
  Write-Host "Files to stage: all (.)"
}

git status --short

# Checkout or create branch
if (git show-ref --verify --quiet "refs/heads/$Branch") {
  git checkout $Branch
} else {
  git checkout -b $Branch
}

if ($Files.Count -gt 0) {
  git add @($Files)
} else {
  git add .
}

# Commit only if có staged changes
$staged = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "Không có thay đổi để commit."
} else {
  git commit -m $Message
}

# Push (set upstream nếu cần)
try {
  git rev-parse --abbrev-ref --symbolic-full-name @{u} > $null 2>&1
  git push
} catch {
  git push -u origin $Branch
}

Write-Host "Đã push lên remote: $Branch"
