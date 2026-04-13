$ErrorActionPreference = "Stop"
$lines = Get-Content 'js\tier-tour.js' -Encoding UTF8
$totalLines = $lines.Count
Write-Host "총 라인 수: $totalLines"

# cfg.js로 가져갈 라인 범위 (0-indexed)
# 845~1984줄: _cfgOpen ~ renderSeasonList (index: 844~1983)
# 2753~4015줄: setBoardMemo2 ~ 파일 끝 (index: 2752~4014)
$cfgLines1 = $lines[844..1983]
$cfgLines2 = $lines[2752..($totalLines-1)]

$cfgContent = @('/* cfg.js - 설정 탭 (tier-tour.js에서 분리) */', '') + $cfgLines1 + @('') + $cfgLines2
$cfgContent | Out-File 'js\cfg.js' -Encoding UTF8
Write-Host "cfg.js: $($cfgContent.Count)줄 생성"

# tier-tour.js에서 해당 범위 제거
$keepLines = $lines[0..843] + $lines[1984..2751]
$keepLines | Out-File 'js\tier-tour.js' -Encoding UTF8
Write-Host "tier-tour.js: $($keepLines.Count)줄 남음"
