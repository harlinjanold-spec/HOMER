Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('d:\HOMER\apps\home-simulator\src\assets\avatar-spritesheet.jpg')
Write-Host "Width: $($img.Width), Height: $($img.Height)"
$img.Dispose()

