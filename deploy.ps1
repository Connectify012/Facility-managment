# PowerShell Deployment Script for SpotWorks Backend
# Run this script from your project root directory

param(
    [string]$KeyPath = ".\Facility.pem",
    [string]$Host = "65.0.122.131",
    [string]$User = "ubuntu"
)

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

Write-Status "🚀 Starting deployment to AWS EC2..."

# Check if key file exists
if (-not (Test-Path $KeyPath)) {
    Write-Error "Key file $KeyPath not found!"
    Write-Warning "Please download your Facility.pem file from AWS and place it in the project root."
    exit 1
}

# Check if build directory exists or build the project
if (-not (Test-Path "dist")) {
    Write-Status "Building the project..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed! Please fix the errors and try again."
        exit 1
    }
} else {
    Write-Status "Using existing build..."
}

Write-Status "Creating deployment package..."

# Create temporary deployment directory
$TempDir = "temp_deploy"
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy necessary files
Copy-Item -Recurse -Path "dist" -Destination $TempDir
Copy-Item -Path "package.json" -Destination $TempDir
if (Test-Path "package-lock.json") {
    Copy-Item -Path "package-lock.json" -Destination $TempDir
}
if (Test-Path ".env") {
    Copy-Item -Path ".env" -Destination $TempDir
}
if (Test-Path "ecosystem.config.js") {
    Copy-Item -Path "ecosystem.config.js" -Destination $TempDir
}

Write-Status "Uploading files to EC2..."

# Upload files using SCP
$ScpCommand = "scp -i `"$KeyPath`" -r $TempDir/* $User@${Host}:/home/ubuntu/spotworks-backend/"
Write-Host "Running: $ScpCommand"

try {
    # Use PowerShell to execute SCP
    $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
    $ProcessInfo.FileName = "scp"
    $ProcessInfo.Arguments = "-i `"$KeyPath`" -r $TempDir/* $User@${Host}:/home/ubuntu/spotworks-backend/"
    $ProcessInfo.UseShellExecute = $false
    $ProcessInfo.RedirectStandardOutput = $true
    $ProcessInfo.RedirectStandardError = $true
    
    $Process = New-Object System.Diagnostics.Process
    $Process.StartInfo = $ProcessInfo
    $Process.Start() | Out-Null
    $Process.WaitForExit()
    
    if ($Process.ExitCode -ne 0) {
        $ErrorOutput = $Process.StandardError.ReadToEnd()
        Write-Error "Failed to upload files: $ErrorOutput"
        Remove-Item -Recurse -Force $TempDir
        exit 1
    }
} catch {
    Write-Error "SCP command failed. Make sure you have OpenSSH client installed."
    Write-Warning "You can install it via: Add-WindowsCapability -Online -Name OpenSSH.Client"
    Write-Warning "Or upload files manually using WinSCP or similar tool."
    Remove-Item -Recurse -Force $TempDir
    exit 1
}

Write-Status "Setting up the application on EC2..."

# Create SSH commands to run on the server
$SSHCommands = @"
# Navigate to project directory
cd /home/ubuntu/spotworks-backend

# Install production dependencies
echo "Installing dependencies..."
npm install --production

# Stop existing PM2 processes
pm2 stop spotworks-backend 2>/dev/null || true
pm2 delete spotworks-backend 2>/dev/null || true

# Start the application with PM2
echo "Starting application with PM2..."
if [ -f ecosystem.config.js ]; then
    pm2 start ecosystem.config.js --env production
else
    pm2 start dist/server.js --name "spotworks-backend" --env production
fi

# Save PM2 configuration
pm2 save

echo "Application deployed successfully!"
echo "Status:"
pm2 status
"@

# Execute SSH commands
try {
    $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
    $ProcessInfo.FileName = "ssh"
    $ProcessInfo.Arguments = "-i `"$KeyPath`" $User@$Host `"$SSHCommands`""
    $ProcessInfo.UseShellExecute = $false
    $ProcessInfo.RedirectStandardOutput = $true
    $ProcessInfo.RedirectStandardError = $true
    
    $Process = New-Object System.Diagnostics.Process
    $Process.StartInfo = $ProcessInfo
    $Process.Start() | Out-Null
    
    $Output = $Process.StandardOutput.ReadToEnd()
    $ErrorOutput = $Process.StandardError.ReadToEnd()
    
    $Process.WaitForExit()
    
    Write-Host $Output
    
    if ($Process.ExitCode -eq 0) {
        Write-Status "Deployment completed successfully! 🎉"
        Write-Status "Your application is now running on: http://$Host:3000"
        Write-Warning "Don't forget to configure your security group to allow inbound traffic on port 3000"
    } else {
        Write-Error "Deployment failed: $ErrorOutput"
    }
} catch {
    Write-Error "SSH command failed. Make sure you have OpenSSH client installed."
}

# Clean up temporary files
Remove-Item -Recurse -Force $TempDir

Write-Status "Deployment script completed."
