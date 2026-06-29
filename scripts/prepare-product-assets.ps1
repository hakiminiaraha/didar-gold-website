param(
  [int]$MaxWidth = 1400,
  [long]$Quality = 82
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $root "local-assets\raw-images\Danteartstudio\PS2\final"
$targetRoot = Join-Path $root "public\images\didar-products"

if (-not (Test-Path $sourceRoot)) {
  throw "Dante source folder was not found: $sourceRoot"
}

New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

$assets = @(
  @{ Source = "1\1.jpg"; Target = "product-07.jpg" },
  @{ Source = "2\1.jpg"; Target = "product-08.jpg" },
  @{ Source = "3\1.jpg"; Target = "product-09.jpg" },
  @{ Source = "4\DSC02626.jpg"; Target = "product-10.jpg" },
  @{ Source = "5\2.jpg"; Target = "product-11.jpg" },
  @{ Source = "6\DSC02948.jpg"; Target = "product-12.jpg" },
  @{ Source = "7\1.jpg"; Target = "product-13.jpg" },
  @{ Source = "8\2.jpg"; Target = "product-14.jpg" },
  @{ Source = "10\2.jpg"; Target = "product-15.jpg" },
  @{ Source = "11\DSC02977.jpg"; Target = "product-16.jpg" },
  @{ Source = "12\3.jpg"; Target = "product-17.jpg" },
  @{ Source = "18\IMG_352c2.JPG"; Target = "product-18.jpg" }
)

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" } |
  Select-Object -First 1

$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  $Quality
)

foreach ($asset in $assets) {
  $source = Join-Path $sourceRoot $asset.Source
  $target = Join-Path $targetRoot $asset.Target

  if (-not (Test-Path $source)) {
    throw "Source image was not found: $source"
  }

  $image = [System.Drawing.Image]::FromFile($source)
  try {
    $cropSize = [int][Math]::Floor([Math]::Min($image.Width, $image.Height) * 0.97)
    $cropX = [Math]::Max(0, [int][Math]::Floor(($image.Width - $cropSize) / 2))
    $cropY = 0
    $sourceRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)
    $scale = [Math]::Min(1.0, $MaxWidth / [double]$cropSize)
    $width = [Math]::Max(1, [int][Math]::Round($cropSize * $scale))
    $height = $width

    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $targetRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
        $graphics.DrawImage($image, $targetRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $graphics.Dispose()
      }

      $bitmap.Save($target, $jpegCodec, $encoderParams)
      $size = (Get-Item $target).Length
      Write-Output ("Created {0} ({1}x{2}, {3:N0} bytes)" -f $asset.Target, $width, $height, $size)
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $image.Dispose()
  }
}
