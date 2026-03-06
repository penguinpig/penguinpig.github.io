param(
    [string]$DeployBranch = "master",
    [switch]$NoPush,
    [switch]$SkipBuild,
    [string[]]$PreservePaths = @(".github")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$msg = "build site_$(Get-Date -Format 'yyyy-MM-dd.HHmm')"
$repoRoot = (Get-Location).Path
$publicDir = Join-Path $repoRoot "public"
$deployDir = Join-Path $repoRoot ".deploy_worktree"
$worktreeReady = $false
$commitCreated = $false
$commitHash = ""

function Get-RootName([string]$Path) {
    $trimmed = $Path.Trim().TrimStart("/", "\")
    if ([string]::IsNullOrWhiteSpace($trimmed)) {
        return ""
    }
    return ($trimmed -split "[/\\]")[0]
}

try {
    Write-Host "Deploying updates to GitHub..." -ForegroundColor Green

    # Build site with Docker Hugo image.
    if (-not $SkipBuild) {
        & docker run --rm -v "${repoRoot}:/src" -w /src hugomods/hugo:debian-nightly-non-root build --minify
        if ($LASTEXITCODE -ne 0) {
            throw "Hugo build failed."
        }
    }

    if (-not (Test-Path -LiteralPath $publicDir -PathType Container)) {
        throw "public directory not found after build."
    }

    # Fetch latest deploy branch and create an isolated worktree.
    & git fetch origin $DeployBranch
    if ($LASTEXITCODE -ne 0) {
        throw "git fetch failed."
    }

    if (Test-Path -LiteralPath $deployDir) {
        & git worktree remove $deployDir --force | Out-Null
    }

    & git worktree add -B $DeployBranch $deployDir "origin/$DeployBranch"
    if ($LASTEXITCODE -ne 0) {
        throw "git worktree add failed."
    }
    $worktreeReady = $true

    # Replace deploy branch contents with generated public site, while preserving selected paths.
    $preserveRootNames = @(
        $PreservePaths |
        ForEach-Object { Get-RootName $_ } |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        Sort-Object -Unique
    )

    Get-ChildItem -LiteralPath $deployDir -Force |
        Where-Object {
            $_.Name -ne ".git" -and
            ($preserveRootNames -notcontains $_.Name)
        } |
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

    & git -C $deployDir commit -m $msg
    if ($LASTEXITCODE -ne 0) {
        throw "git commit failed."
    }
    $commitCreated = $true
    $commitHash = (& git -C $deployDir rev-parse --short HEAD).Trim()

    if ($NoPush) {
        Write-Host "Commit created locally on '$DeployBranch': $commitHash"
    }
    else {
        & git -C $deployDir push origin $DeployBranch
        if ($LASTEXITCODE -ne 0) {
            throw "git push failed."
        }
        Write-Host "Pushed '$DeployBranch' commit: $commitHash"
    }
}
finally {
    if ($worktreeReady -and (Test-Path -LiteralPath $deployDir)) {
        & git worktree remove $deployDir --force | Out-Null
    }
}
