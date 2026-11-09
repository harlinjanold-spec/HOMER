Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')
$outDir = 'd:\HOMER\apps\home-simulator\public\sprites'
$outDirAssets = 'd:\HOMER\apps\home-simulator\src\assets\sprites'

function Export-CropClean($name, $x, $y, $w, $h) {
    # Scan non-bg bounds
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
    if ($maxX -lt $minX) { return }
    $cw = $maxX - $minX + 1
    $ch = $maxY - $minY + 1
    $cx = $x + $minX
    $cy = $y + $minY

    $bmp = New-Object System.Drawing.Bitmap($cw, $ch, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($j = 0; $j -lt $ch; $j++) {
        for ($i = 0; $i -lt $cw; $i++) {
            $c = $img.GetPixel($cx + $i, $cy + $j)
            $diff = [Math]::Sqrt([Math]::Pow($c.R - 11, 2) + [Math]::Pow($c.G - 18, 2) + [Math]::Pow($c.B - 26, 2))
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
    $bmp.Save((Join-Path $outDir "$name.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $outDirAssets "$name.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Exported $name : ${cw}x${ch}"
}

# Walk Front (4 frames)
Export-CropClean "walk_front_1" 95 195 25 35
Export-CropClean "walk_front_2" 140 195 25 35
Export-CropClean "walk_front_3" 185 195 25 35
Export-CropClean "walk_front_4" 230 195 25 35

# Walk Right (4 frames)
Export-CropClean "walk_right_1" 95 235 25 35
Export-CropClean "walk_right_2" 140 235 25 35
Export-CropClean "walk_right_3" 185 235 25 35
Export-CropClean "walk_right_4" 230 235 25 35

# Walk Back (4 frames)
Export-CropClean "walk_back_1" 95 270 25 35
Export-CropClean "walk_back_2" 140 270 25 35
Export-CropClean "walk_back_3" 185 270 25 35
Export-CropClean "walk_back_4" 230 270 25 35

# Walk Left (4 frames)
Export-CropClean "walk_left_1" 95 305 25 35
Export-CropClean "walk_left_2" 140 305 25 35
Export-CropClean "walk_left_3" 185 305 25 35
Export-CropClean "walk_left_4" 230 305 25 35

$img.Dispose()

