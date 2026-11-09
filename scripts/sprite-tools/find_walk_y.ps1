Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')

for ($y = 160; $y -lt 340; $y += 5) {
    $count = 0
    for ($x = 70; $x -lt 270; $x++) {
        $c = $img.GetPixel($x, $y)
        # Check for silver hair (R > 180, G > 180, B > 180)
        if ($c.R -gt 180 -and $c.G -gt 180 -and $c.B -gt 180) { $count++ }
    }
    if ($count -gt 10) {
        Write-Host "Y=$y has $count hair pixels"
    }
}
$img.Dispose()

