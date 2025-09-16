# Enhanced Postman CLI (pm-clx) Installation Script for Windows
# Follows Postman's official installer patterns

param(
    [switch]$Help
)

# Configuration
$REPO = "postman-cs/postman-clx"
$ARCHIVE_NAME = "pm-clx-win64.zip"
$BINARY_NAME = "pm-clx-win64.exe"
$INSTALL_NAME = "postman-clx.exe"

if ($Help) {
    Write-Host @"
Enhanced Postman CLI (pm-clx) Windows Installer

USAGE:
    .\install.ps1 [OPTIONS]

OPTIONS:
    -Help       Show this help message

DESCRIPTION:
    Installs the enhanced Postman CLI with governance reporting capabilities.
    Automatically downloads the latest release and installs to user directory.

"@
    exit 0
}

try {
    # Get latest version
    Write-Host "Fetching latest release information..."
    $latestUrl = "https://api.github.com/repos/$REPO/releases/latest"
    $response = Invoke-RestMethod -Uri $latestUrl -Method Get

    if (-not $response.tag_name) {
        throw "Failed to get latest version from GitHub"
    }

    $version = $response.tag_name
    Write-Host "Latest version: $version"

    # Set up paths
    $INSTALL_PATH = "$Env:USERPROFILE\AppData\Local\Microsoft\WindowsApps"
    New-Item -type directory -path "$INSTALL_PATH" -Force | Out-Null

    # Download archive
    $downloadUrl = "https://github.com/$REPO/releases/download/$version/$ARCHIVE_NAME"
    $tempPath = "$env:TEMP\$ARCHIVE_NAME"

    Write-Host "Downloading from $downloadUrl..."
    $client = New-Object System.Net.WebClient
    $client.DownloadFile($downloadUrl, $tempPath)

    # Verify download
    if (-not (Test-Path $tempPath) -or (Get-Item $tempPath).Length -eq 0) {
        throw "Downloaded file is empty or missing"
    }

    # Extract archive
    Write-Host "Extracting archive..."
    $extractPath = "$env:TEMP\pm-clx-extract"
    if (Test-Path $extractPath) {
        Remove-Item $extractPath -Recurse -Force
    }
    Expand-Archive $tempPath $extractPath -Force

    # Verify extracted binary
    $extractedBinary = "$extractPath\$BINARY_NAME"
    if (-not (Test-Path $extractedBinary)) {
        throw "Binary $BINARY_NAME not found in extracted archive"
    }

    # Install binary (rename to final name)
    $finalPath = "$INSTALL_PATH\$INSTALL_NAME"
    if (Test-Path $finalPath) {
        Write-Host "Existing installation found, backing up..."
        Move-Item $finalPath "$finalPath.backup" -Force
    }

    Move-Item $extractedBinary $finalPath -Force

    # Cleanup
    Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
    Remove-Item $extractPath -Recurse -Force -ErrorAction SilentlyContinue

    # Verify installation
    Write-Host "Verifying installation..."
    if (Test-Path $finalPath) {
        try {
            $versionOutput = & $finalPath --version 2>$null
            if ($LASTEXITCODE -eq 0 -and $versionOutput) {
                Write-Host "The Enhanced Postman CLI (pm-clx) $versionOutput has been installed successfully"
            } else {
                Write-Host "The Enhanced Postman CLI (pm-clx) has been installed successfully"
            }
        } catch {
            Write-Host "The Enhanced Postman CLI (pm-clx) has been installed successfully"
        }

        Write-Host ""
        Write-Host "Usage examples:"
        Write-Host "  postman-clx api lint ./spec.yaml -r json"
        Write-Host "  postman-clx api lint -d ./specs -r html"
        Write-Host "  postman-clx collection run collection-id"
    } else {
        throw "Installation verification failed"
    }

} catch {
    Write-Host "An error occurred while installing the Enhanced Postman CLI (pm-clx)"
    Write-Host $_.Exception.Message
    exit 1
}