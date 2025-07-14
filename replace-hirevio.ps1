# PowerShell script to replace specified strings in all text files recursively

# Set the root directory (current directory)
$root = Get-Location

# Get all files recursively, excluding common binary files
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $_.Extension -notin '.exe', '.dll', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.zip', '.tar', '.gz', '.pdf', '.mp3', '.mp4', '.mov', '.avi'
}

foreach ($file in $files) {
    # Read file content
    $content = Get-Content $file.FullName -Raw

    # Perform replacements
    $content = $content -replace 'eval8', 'eval8'
    $content = $content -replace 'eval8\.in', 'eval8.ai'
    $content = $content -replace 'Hysteresis Pvt Ltd', 'Hysteresis Pvt Ltd'

    # Write back to file
    Set-Content $file.FullName $content
}

Write-Host "Replacement complete." 

