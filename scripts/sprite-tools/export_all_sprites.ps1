Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')
$outDir = 'd:\HOMER\apps\home-simulator\public\sprites'
$outDirAssets = 'd:\HOMER\apps\home-simulator\src\assets\sprites'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }
if (-not (Test-Path $outDirAssets)) { New-Item -ItemType Directory -Path $outDirAssets -Force }

function Export-TransparentRegion($name, $x, $y, $w, $h) {
    # Find tight bounding box of character within this region
    $minX = $w; $maxX = 0; $minY = $h; $maxY = 0;
    for ($j = 0; $j -lt $h; $j++) {
        for ($i = 0; $i -lt $w; $i++) {
            $px = $x + $i; $py = $y + $j
            if ($px -lt $img.Width -and $py -lt $img.Height) {
                $c = $img.GetPixel($px, $py)
                $diff = [Math]::Sqrt([Math]::Pow($c.R - 11, 2) + [Math]::Pow($c.G - 18, 2) + [Math]::Pow($c.B - 26, 2))
                if ($diff -gt 25) {
                    if ($i -lt $minX) { $minX = $i }
                    if ($i -gt $maxX) { $maxX = $i }
                    if ($j -lt $minY) { $minY = $j }
                    if ($j -gt $maxY) { $maxY = $j }
                }
            }
        }
    }
    if ($maxX -lt $minX -or $maxY -lt $minY) {
        Write-Host "Warning: empty region for $name"
        return
    }

    $cropW = $maxX - $minX + 1
    $cropH = $maxY - $minY + 1
    $cropX = $x + $minX
    $cropY = $y + $minY

    $bmp = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bgR = 11; $bgG = 18; $bgB = 26;

    for ($j = 0; $j -lt $cropH; $j++) {
        for ($i = 0; $i -lt $cropW; $i++) {
            $c = $img.GetPixel($cropX + $i, $cropY + $j)
            $diff = [Math]::Sqrt([Math]::Pow($c.R - $bgR, 2) + [Math]::Pow($c.G - $bgG, 2) + [Math]::Pow($c.B - $bgB, 2))
            if ($diff -lt 20) {
                $bmp.SetPixel($i, $j, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($diff -lt 32) {
                $alpha = [int]((($diff - 20) / 12.0) * 255)
                $bmp.SetPixel($i, $j, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            } else {
                $bmp.SetPixel($i, $j, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }

    $p1 = Join-Path $outDir "$name.png"
    $p2 = Join-Path $outDirAssets "$name.png"
    $bmp.Save($p1, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save($p2, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Exported $name : ${cropW}x${cropH} (from $cropX, $cropY)"
}

# 1. Main Hero Idle / Directions
Export-TransparentRegion "raghav_hero" 60 60 70 90
Export-TransparentRegion "raghav_front" 182 50 44 90
Export-TransparentRegion "raghav_right" 231 49 47 91
Export-TransparentRegion "raghav_back" 301 48 40 92
Export-TransparentRegion "raghav_left" 361 50 33 90

# 2. Drink Water (Q): 3 frames around X: 160 to 280, Y: 380 to 455
Export-TransparentRegion "raghav_drink_1" 160 380 35 70
Export-TransparentRegion "raghav_drink_2" 200 380 40 70
Export-TransparentRegion "raghav_drink_3" 245 380 35 70

# 3. Medication (M): 3 frames around X: 295 to 430, Y: 380 to 455
Export-TransparentRegion "raghav_med_1" 300 380 45 70
Export-TransparentRegion "raghav_med_2" 350 380 35 70
Export-TransparentRegion "raghav_med_3" 390 380 35 70

# 4. Fall (F): 4 frames around X: 590 to 780, Y: 380 to 455
Export-TransparentRegion "raghav_fall_1" 595 380 35 70
Export-TransparentRegion "raghav_fall_2" 635 380 35 70
Export-TransparentRegion "raghav_fall_3" 675 390 55 55
Export-TransparentRegion "raghav_fall_4" 735 400 45 45

# 5. Get Up: 4 frames around X: 790 to 970, Y: 380 to 455
Export-TransparentRegion "raghav_getup_1" 800 400 40 45
Export-TransparentRegion "raghav_getup_2" 845 395 35 50
Export-TransparentRegion "raghav_getup_3" 890 385 35 65
Export-TransparentRegion "raghav_getup_4" 935 380 35 70

# 6. Sleep / In Bed: around X: 540 to 610, Y: 250 to 330
Export-TransparentRegion "raghav_sleep_bed" 540 250 70 80

# 7. Sit on Chair: around X: 530 to 600, Y: 180 to 235
Export-TransparentRegion "raghav_sit" 535 180 45 55

$img.Dispose()
Write-Host "All sprite extractions completed successfully!"

