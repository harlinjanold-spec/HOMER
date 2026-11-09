Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')

# Check pixels in test_crop_front.png
$crop = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\test_crop_front.png')
$minX = $crop.Width; $maxX = 0; $minY = $crop.Height; $maxY = 0;
for ($y = 0; $y -lt $crop.Height; $y++) {
    for ($x = 0; $x -lt $crop.Width; $x++) {
        $c = $crop.GetPixel($x, $y)
        # Background is dark: R < 30 and G < 35 and B < 40
        if ($c.R -gt 40 -or $c.G -gt 45 -or $c.B -gt 50) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Front char bounds in crop: X: $minX to $maxX, Y: $minY to $maxY (Width: $($maxX-$minX+1), Height: $($maxY-$minY+1))"
$crop.Dispose()
$img.Dispose()

