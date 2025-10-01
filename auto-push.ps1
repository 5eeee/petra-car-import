param(
    [string]$Message = "Auto update $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Ensure-Git {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git не найден в PATH. Установите Git или добавьте его в переменную окружения PATH."
    }
}

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)][string]$Arguments
    )
    $process = Start-Process git $Arguments -NoNewWindow -RedirectStandardOutput ([System.IO.StringWriter]::new()) -RedirectStandardError ([System.IO.StringWriter]::new()) -PassThru
    $process.WaitForExit()
    if ($process.ExitCode -ne 0) {
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        throw "Команда git $Arguments завершилась с кодом $($process.ExitCode).`n$stdout$stderr"
    }
}

try {
    Ensure-Git

    $repoRoot = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
    Set-Location $repoRoot

    $status = git status --porcelain
    if (-not $Force -and [string]::IsNullOrWhiteSpace($status)) {
        Write-Host 'Изменений нет — коммит не требуется.'
        exit 0
    }

    Invoke-Git 'add -A'
    Invoke-Git "commit -m `"$Message`""
    Invoke-Git 'push'
    Write-Host 'Изменения закоммичены и отправлены.'
}
catch {
    Write-Error $_
    exit 1
}
