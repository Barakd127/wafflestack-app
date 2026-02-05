# PowerShell script to copy ALL preview images from all Kenney kits

$baseRef = "c:\Users\BARAK\Projects\base44\references\Code"
$baseDest = "c:\Users\BARAK\Projects\base44\public\previews"

# Create destination directory
New-Item -ItemType Directory -Force -Path $baseDest | Out-Null

# Map of kit folders to destination names
$kitMappings = @{
    "kenney_hexagon-kit" = "hexagon"
    "kenney_castle-kit" = "castle"
    "kenney_city-kit-commercial_2.1" = "commercial"
    "kenney_city-kit-suburban_20" = "suburban"
    "kenney_city-kit-industrial_1.0" = "industrial"
    "kenney_city-kit-roads" = "roads"
    "kenney_fantasy-town-kit_2.0" = "fantasy-town"
    "kenney_food-kit" = "food"
    "kenney_furniture-kit" = "furniture"
    "kenney_graveyard-kit_5.0" = "graveyard"
    "kenney_mini-dungeon" = "mini-dungeon"
    "kenney_modular-buildings" = "modular-buildings"
    "kenney_pirate-kit" = "pirate"
    "kenney_platformer-kit" = "platformer"
    "kenney_retro-urban-kit" = "retro-urban"
    "kenney_space-kit" = "space"
    "kenney_watercraft-pack" = "watercraft"
    "kenney_car-kit" = "car"
    "kenney_nature-kit" = "nature"
}

Write-Host "🖼️  Copying ALL Kenney preview images..." -ForegroundColor Cyan

$copiedKits = 0
$totalFiles = 0

foreach ($kitFolder in $kitMappings.Keys) {
    $sourcePath = "$baseRef\$kitFolder\Previews"
    $destName = $kitMappings[$kitFolder]
    $destPath = "$baseDest\$destName"
    
    if (Test-Path $sourcePath) {
        # Create destination folder
        New-Item -ItemType Directory -Force -Path $destPath | Out-Null
        
        # Copy all preview images
        $files = Get-ChildItem -Path $sourcePath -File
        $fileCount = $files.Count
        
        Copy-Item -Path "$sourcePath\*" -Destination $destPath -Force
        
        Write-Host "  ✅ $destName`: Copied $fileCount files" -ForegroundColor Green
        $copiedKits++
        $totalFiles += $fileCount
    } else {
        Write-Host "  ⏭️  $destName`: No previews found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Complete! Copied $totalFiles preview images from $copiedKits kits!" -ForegroundColor Green
Write-Host "Location: $baseDest" -ForegroundColor Cyan
