# Download ELEA site images into assets/images/
# Run from the project root (PowerShell on Windows).
# Example: Open PowerShell in the project folder and run:
#   powershell -ExecutionPolicy Bypass -File .\assets\download-images.ps1

$images = @{
  'hero.png'      = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/d2c1a47bc_generated_6c34ece9.png'
  'wardrobe.png'  = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/55f93c939_generated_7753700d.png'
  'bathroom.png'  = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/61af2b74e_generated_9cc92036.png'
  'kitchen.png'   = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/62fca6c11_generated_b0b85b0c.png'
  'moveIn.png'    = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/c1a177070_generated_0384e73c.png'
  'moveOut.png'   = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/6de0a790b_generated_0fb410c0.png'
  'afterReno.png' = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/90eeb7d66_generated_e3994a53.png'
  'oven.png'      = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/d02966e3e_generated_6589a252.png'
  'laundry.png'   = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/7770c6408_generated_990668fe.png'
  'window.png'    = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/160f38289_generated_e7975bb5.png'
  'living.png'    = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/b83124895_generated_939c2fee.png'
  'bedroom.png'   = 'https://media.base44.com/images/public/6a93f9b539592b2f67e9e4dd/1e14340e8_generated_6d380dc6.png'
}

$destDir = Join-Path -Path $PSScriptRoot -ChildPath "..\assets\images" | Resolve-Path -Relative
$fullDest = Join-Path -Path (Get-Location) -ChildPath "assets\images"
if (-not (Test-Path -Path $fullDest)) {
  New-Item -ItemType Directory -Path $fullDest -Force | Out-Null
}

Write-Host "Downloading images to $fullDest`n"
foreach ($name in $images.Keys) {
  $url = $images[$name]
  $out = Join-Path $fullDest $name
  try {
    Write-Host "Downloading $name..."
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
  } catch {
    Write-Host ("Failed to download {0}: {1}" -f $name, $_.Exception.Message) -ForegroundColor Yellow
  }
}

Write-Host "\nDone. Check assets/images/ for the downloaded images."