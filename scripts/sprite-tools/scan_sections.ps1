Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')

# Walk / Move section: X from 80 to 280, Y from 170 to 330
# Row 1 (Front Walk): Y around 195 to 225
# Row 2 (Right Walk): Y around 230 to 260
# Row 3 (Back Walk):  Y around 265 to 295
# Row 4 (Left Walk):  Y around 300 to 330

function Scan-HorizontalClusters($y1, $h, $x1, $w) {
    $inChar = $false
    $startX = 0
    $clusters = @()
    for ($x = $x1; $x -lt ($x1 + $w); $x++) {
        $hasCol = $false
        for ($y = $y1; $y -lt ($y1 + $h); $y++) {
            $c = $img.GetPixel($x, $y)
            $isChar = ($c.R -gt 50 -or $c.G -gt 55 -or $c.B -gt 60)
            if ($isChar) { $hasCol = $true; break }
        }
        if ($hasCol -and -not $inChar) {
            $inChar = $true
            $startX = $x
        } elseif (-not $hasCol -and $inChar) {
            $inChar = $false
            if (($x - $startX) -gt 8) {
                $clusters += @{ X=$startX; W=($x - $startX) }
            }
        }
    }
    return $clusters
}

Write-Host "--- Scanning Walk Rows ---"
$wFront = Scan-HorizontalClusters 190 35 80 180
Write-Host "Front Walk clusters count: $($wFront.Count)"
foreach ($c in $wFront) { Write-Host "  X=$($c.X), W=$($c.W)" }

$wRight = Scan-HorizontalClusters 230 35 80 180
Write-Host "Right Walk clusters count: $($wRight.Count)"
foreach ($c in $wRight) { Write-Host "  X=$($c.X), W=$($c.W)" }

$wBack = Scan-HorizontalClusters 265 35 80 180
Write-Host "Back Walk clusters count: $($wBack.Count)"
foreach ($c in $wBack) { Write-Host "  X=$($c.X), W=$($c.W)" }

$wLeft = Scan-HorizontalClusters 300 35 80 180
Write-Host "Left Walk clusters count: $($wLeft.Count)"
foreach ($c in $wLeft) { Write-Host "  X=$($c.X), W=$($c.W)" }

# Fall section: X from 590 to 780, Y from 360 to 450
Write-Host "--- Scanning Fall Section ---"
$fall = Scan-HorizontalClusters 370 70 590 190
Write-Host "Fall clusters count: $($fall.Count)"
foreach ($c in $fall) { Write-Host "  X=$($c.X), W=$($c.W)" }

# Drink section: X from 150 to 280, Y from 360 to 450
Write-Host "--- Scanning Drink Section ---"
$drink = Scan-HorizontalClusters 370 70 150 130
Write-Host "Drink clusters count: $($drink.Count)"
foreach ($c in $drink) { Write-Host "  X=$($c.X), W=$($c.W)" }

# Medication section: X from 290 to 430, Y from 360 to 450
Write-Host "--- Scanning Medication Section ---"
$med = Scan-HorizontalClusters 370 70 290 140
Write-Host "Med clusters count: $($med.Count)"
foreach ($c in $med) { Write-Host "  X=$($c.X), W=$($c.W)" }

$img.Dispose()

