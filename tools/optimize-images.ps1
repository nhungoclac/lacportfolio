param(
  [int]$MaxDimension = 1800,
  [int]$Quality = 82
)

Add-Type -AssemblyName System.Drawing

$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\photo")).Path
$outputRoot = Join-Path $sourceRoot "optimized"
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

function Test-HasAlpha([System.Drawing.Bitmap]$Bitmap) {
  # PNGs often declare an alpha channel even when every visible pixel is opaque.
  # Sample a grid so those photo-like PNGs can still be delivered as JPEG.
  $steps = 24
  for ($x = 0; $x -le $steps; $x++) {
    for ($y = 0; $y -le $steps; $y++) {
      $px = [Math]::Min($Bitmap.Width - 1, [Math]::Round($x * ($Bitmap.Width - 1) / $steps))
      $py = [Math]::Min($Bitmap.Height - 1, [Math]::Round($y * ($Bitmap.Height - 1) / $steps))
      if ($Bitmap.GetPixel($px, $py).A -lt 255) { return $true }
    }
  }
  return $false
}

function Save-Jpeg([System.Drawing.Image]$Image, [string]$Destination, [int]$JpegQuality) {
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    [long]$JpegQuality
  )
  $Image.Save($Destination, $encoder, $parameters)
  $parameters.Dispose()
}

$images = Get-ChildItem -Path $sourceRoot -File -Recurse |
  Where-Object { $_.Extension -in ".png", ".jpg", ".jpeg" -and $_.FullName -notlike "$outputRoot*" }

$converted = 0
$keptOriginal = 0
foreach ($file in $images) {
  $relative = $file.FullName.Substring($sourceRoot.Length).TrimStart("\\")

  $bitmap = $null
  $canvas = $null
  $graphics = $null
  try {
    $bitmap = New-Object System.Drawing.Bitmap $file.FullName
    $hasAlpha = Test-HasAlpha $bitmap
    $outputExtension = if ($hasAlpha) { ".png" } else { ".jpg" }
    $destination = Join-Path $outputRoot ([System.IO.Path]::ChangeExtension($relative, $outputExtension))
    New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null

    $scale = [Math]::Min(1, $MaxDimension / [Math]::Max($bitmap.Width, $bitmap.Height))
    $width = [Math]::Max(1, [Math]::Round($bitmap.Width * $scale))
    $height = [Math]::Max(1, [Math]::Round($bitmap.Height * $scale))
    $pixelFormat = if ($hasAlpha) { [System.Drawing.Imaging.PixelFormat]::Format32bppArgb } else { [System.Drawing.Imaging.PixelFormat]::Format24bppRgb }
    $canvas = New-Object System.Drawing.Bitmap $width, $height, $pixelFormat
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.Clear($(if ($hasAlpha) { [System.Drawing.Color]::Transparent } else { [System.Drawing.Color]::White }))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.DrawImage($bitmap, 0, 0, $width, $height)
    if ($hasAlpha) {
      $canvas.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
      Save-Jpeg $canvas $destination $Quality
    }
    if ($hasAlpha -and (Get-Item -LiteralPath $destination).Length -ge $file.Length) {
      Remove-Item -LiteralPath $destination -Force
      $keptOriginal++
    } else {
      $converted++
    }
  }
  catch {
    Write-Warning "Could not optimize ${relative}: $($_.Exception.Message)"
  }
  finally {
    if ($graphics) { $graphics.Dispose() }
    if ($canvas) { $canvas.Dispose() }
    if ($bitmap) { $bitmap.Dispose() }
  }
}

Write-Output "Created or refreshed $converted optimized delivery images; retained $keptOriginal smaller originals."
