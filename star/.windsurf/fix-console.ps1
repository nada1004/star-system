# PowerShell: console.log/warn/error 조건부 처리
# 패턴: console.log(...) → if (!CONFIG.PROD) console.log(...)
#       console.warn(...) → console.warn(...) [그대로]
#       console.error(...) → console.error(...) [그대로]

$jsDir = "d:\projects\star\star-datacenter\js"
$filesToCheck = @(
    "init.js",
    "data.js",
    "cloud-board.js",
    "stats.js"
)

$totalFixed = 0

foreach ($file in $filesToCheck) {
    $filePath = Join-Path $jsDir $file
    if (-not (Test-Path $filePath)) { continue }

    $content = Get-Content $filePath -Raw
    $lines = $content -split "`n"
    $modified = $false

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        # console.log만 조건부 처리 (warn/error는 보존)
        if ($line -match "console\.log\s*\(" -and $line -notmatch "if\s*\(" ) {
            # 들여쓰기 감지
            $indent = $line -replace "^(\s*).*", '$1'
            $stripped = $line.TrimStart()
            $lines[$i] = "$indent`if (!CONFIG.PROD) $stripped"
            $modified = $true
            $totalFixed++
        }
    }

    if ($modified) {
        Set-Content -Path $filePath -Value ($lines -join "`n") -Encoding UTF8
        Write-Host "✓ $file : console.log 문장 처리"
    }
}

Write-Host "`n✅ 총 $totalFixed 개 console 문장 처리 완료"
