$html = Get-Content 'index.html' -Raw -Encoding UTF8
$startTags = ($html -split '<script').Count - 1
$endTags = ($html -split '</script>').Count - 1
Write-Host '开始script标签数量:' $startTags
Write-Host '结束script标签数量:' $endTags
Write-Host '差异:' ($startTags - $endTags)
