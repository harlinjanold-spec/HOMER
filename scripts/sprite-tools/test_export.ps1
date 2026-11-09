Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')

# Output directory
$outDir = 'd:\HOMER\apps\home-simulator\public\sprites'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

function Export-TransparentSprite($name, $x, $y, $w, $h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bgR = 11; $bgG = 18; $bgB = 26; # background base color

    for ($j = 0; $j -lt $h; $j++) {
        for ($i = 0; $i -lt $w; $i++) {
            $srcX = $x + $i
            $srcY = $y + $j
            if ($srcX -lt $img.Width -and $srcY -lt $img.Height) {
                $c = $img.GetPixel($srcX, $srcY)
                # Compute color difference from background
                $diff = [Math]::Sqrt([Math]::Pow($c.R - $bgR, 2) + [Math]::Pow($c.G - $bgG, 2) + [Math]::Pow($c.B - $bgB, 2))
                if ($diff -lt 18) {
                    # 100% transparent background
                    $bmp.SetPixel($i, $j, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                } elseif ($diff -lt 28) {
                    # Smooth anti-aliased edge
                    $alpha = [int]((($diff - 18) / 10.0) * 255)
                    $bmp.SetPixel($i, $j, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
                } else {
                    # Solid character pixel
                    $bmp.SetPixel($i, $j, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
                }
            }
        }
    }
    $path = Join-Path $outDir "$name.png"
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Exported: $path ($w x $h)"
}

Export-TransparentSprite "front_idle" 182 50 44 90
Export-TransparentSprite "right_idle" 231 49 47 91
Export-TransparentSprite "back_idle" 301 48 40 92
Export-TransparentSprite "left_idle" 361 50 33 90

$img.Dispose()

