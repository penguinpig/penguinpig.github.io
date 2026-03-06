Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$msg = "build site_$(Get-Date -Format 'yyyy-MM-dd.HHmm')"
$deployBranch = "master"
$repoRoot = (Get-Location).Path
$publicDir = Join-Path $repoRoot "public"
$deployDir = Join-Path $repoRoot ".deploy_worktree"
$worktreeReady = $false

try {
    Write-Host "Deploying updates to GitHub..." -ForegroundColor Green

    # Build site with Docker Hugo image.
    & docker run --rm -v "${repoRoot}:/src" -w /src hugomods/hugo:debian-nightly-non-root build
    if ($LASTEXITCODE -ne 0) {
        throw "Hugo build failed."
    }

    if (-not (Test-Path -LiteralPath $publicDir -PathType Container)) {
        throw "public directory not found after build."
    }

    # Fetch latest deploy branch and create an isolated worktree.
    & git fetch origin $deployBranch
    if ($LASTEXITCODE -ne 0) {
        throw "git fetch failed."
    }

    if (Test-Path -LiteralPath $deployDir) {
        & git worktree remove $deployDir --force | Out-Null
    }

    & git worktree add -B $deployBranch $deployDir "origin/$deployBranch"
    if ($LASTEXITCODE -ne 0) {
        throw "git worktree add failed."
    }
    $worktreeReady = $true

    # Replace deploy branch contents with generated public site.
    Get-ChildItem -LiteralPath $deployDir -Force |
        Where-Object { $_.Name -ne ".git" } |
        Remove-Item -Recurse -Force

    Get-ChildItem -LiteralPath $publicDir -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $deployDir -Recurse -Force
    }

    & git -C $deployDir add -A
    if ($LASTEXITCODE -ne 0) {
        throw "git add failed."
    }

    & git -C $deployDir diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "No changes to deploy."
        exit 0
    }
    if ($LASTEXITCODE -ne 1) {
        throw "git diff --cached --quiet failed."
    }

    # & git -C $deployDir commit -m $msg
    # if ($LASTEXITCODE -ne 0) {
    #     throw "git commit failed."
    # }

    # & git -C $deployDir push origin $deployBranch
    # if ($LASTEXITCODE -ne 0) {
    #     throw "git push failed."
    # }
}
finally {
    if ($worktreeReady -and (Test-Path -LiteralPath $deployDir)) {
        & git worktree remove $deployDir --force | Out-Null
    }
}
