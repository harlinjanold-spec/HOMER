Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')

# Find bounds of the large hero character on left:
$minX = 999; $maxX = 0; $minY = 999; $maxY = 0;
for ($y = 60; $y -lt 150; $y++) {
    for ($x = 60; $x -lt 130; $x++) {
        $c = $img.GetPixel($x, $y)
        $diff = [Math]::Sqrt([Math]::Pow($c.R - 11, 2) + [Math]::Pow($c.G - 18, 2) + [Math]::Pow($c.B - 26, 2))
        if ($diff -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Large Hero Character: X=$minX to $maxX, Y=$minY to $maxY (W=$($maxX-$minX+1), H=$($maxY-$minY+1))"

# Check Drink Water (Q): X: 160 to 280, Y: 370 to 455
# Check Fall (F): X: 590 to 780, Y: 370 to 455
# Check Lie on Bed (Sequence): X: 330 to 615, Y: 245 to 335

$img.Dispose()

