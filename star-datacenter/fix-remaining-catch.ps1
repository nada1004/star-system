# PowerShell 스크립트: 남은 empty catch 블록 일괄 수정
# 안전성: 각 파일의 백업을 만들고 진행

$jsDir = "d:\projects\star\star-datacenter\js"
$backupDir = "d:\projects\star\star-datacenter\js-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# 백업 생성
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
Get-ChildItem -Path $jsDir -Filter "*.js" | Copy-Item -Destination $backupDir -Force
Write-Host "✅ 백업 생성: $backupDir"

# 수정할 파일 목록 (이미 수정된 파일 제외)
$filesToFix = @(
    "duck-race.js",
    "chatbot.js",
    "cloud-board.js",
    "match-builder.js",
    "competition.js",
    "render.js",
    "settings.js",
    "stats.js"
)

$totalFixed = 0

foreach ($file in $filesToFix) {
    $filePath = Join-Path $jsDir $file
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  파일 없음: $file"
        continue
    }

    $content = Get-Content $filePath -Raw
    $original = $content

    # 패턴 1: catch(e) {} 또는 catch(err) {} 등
    # 단순한 try-catch 블록만 처리 (한 줄)
    $pattern1 = 'catch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*?)\s*\)\s*\{\s*\}'
    $replacement1 = 'catch($1) { console.warn("[' + $file.Replace('.js','') + '] Error:", $1.message || $1); }'

    $content = [Regex]::Replace($content, $pattern1, $replacement1)

    # 패턴 2: catch {} (파라미터 없음)
    $pattern2 = 'catch\s*\{\s*\}'
    $replacement2 = 'catch(e) { console.warn("[' + $file.Replace('.js','') + '] Unknown error"); }'

    $content = [Regex]::Replace($content, $pattern2, $replacement2)

    if ($content -ne $original) {
        $count = [Regex]::Matches($content, 'console\.warn\(\"\[').Count - [Regex]::Matches($original, 'console\.warn\(\"\[').Count
        if ($count -gt 0) {
            Set-Content -Path $filePath -Value $content -Encoding UTF8
            Write-Host "✓ $file : +$count 수정"
            $totalFixed += $count
        }
    }
}

Write-Host "`n✅ 총 $totalFixed 개 catch 블록 수정 완료"
Write-Host "백업: $backupDir"
