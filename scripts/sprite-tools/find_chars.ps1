Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')

# Find exact bounds of the 4 overview characters:
# Front (Down), Right, Back (Up), Left
# They are between Y: 40 and 150, X: 160 and 400

function Find-CharBounds($x1, $y1, $w, $h) {
    $minX = 9999; $maxX = 0; $minY = 9999; $maxY = 0;
    for ($y = $y1; $y -lt ($y1 + $h); $y++) {
        for ($x = $x1; $x -lt ($x1 + $w); $x++) {
            $c = $img.GetPixel($x, $y)
            # Exclude text labels (labels are grey/white near the bottom y > 130)
            if ($y -lt 140) {
                # Look for peach skin or silver hair
                $isHair = ($c.R -gt 180 -and $c.G -gt 180 -and $c.B -gt 180)
                $isSkin = ($c.R -gt 180 -and $c.G -gt 130 -and $c.B -lt 160)
                $isShirt = ($c.R -gt 160 -and $c.G -gt 150 -and $c.B -gt 110)
                $isPants = ($c.R -gt 60 -and $c.R -lt 140 -and $c.G -gt 40 -and $c.G -lt 100 -and $c.B -lt 80)
                $isVest = ($c.R -gt 25 -and $c.R -lt 80 -and $c.G -gt 25 -and $c.G -lt 80 -and $c.B -gt 25 -and $c.B -lt 80)
                if ($isHair -or $isSkin -or $isShirt -or $isPants -or $isVest) {
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }
    }
    return @{ X=$minX; Y=$minY; W=($maxX-$minX+1); H=($maxY-$minY+1) }
}

$front = Find-CharBounds 170 40 55 105
$right = Find-CharBounds 230 40 55 105
$back  = Find-CharBounds 285 40 55 105
$left  = Find-CharBounds 345 40 55 105

Write-Host "Front: $($front.X), $($front.Y), $($front.W)x$($front.H)"
Write-Host "Right: $($right.X), $($right.Y), $($right.W)x$($right.H)"
Write-Host "Back:  $($back.X),  $($back.Y),  $($back.W)x$($back.H)"
Write-Host "Left:  $($left.X),  $($left.Y),  $($left.W)x$($left.H)"

$img.Dispose()

