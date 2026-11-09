Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')

# Let's inspect pixel color at (10, 10), (100, 100), (200, 100), etc.
$bgCol = $img.GetPixel(10, 10)
Write-Host "Top-left BG color: R=$($bgCol.R), G=$($bgCol.G), B=$($bgCol.B)"

# Check box Character - Frames Overview:
# Character 1: Front (Down) is around x: 170-220, y: 55-145
# Let's crop a test rectangle from (175, 55, 45, 90)
$rect = New-Object System.Drawing.Rectangle(175, 55, 45, 90)
$crop = $img.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$crop.Save('d:\HOMER\apps\home-simulator\src\assets\test_crop_front.png', [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose()
$img.Dispose()
Write-Host "Saved test_crop_front.png"

