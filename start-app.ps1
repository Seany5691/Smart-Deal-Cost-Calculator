# Smart Deal Cost Calculator Startup Script
Write-Host "Starting Smart Deal Cost Calculator..." -ForegroundColor Cyan

# Kill any existing Node.js processes
Write-Host "Killing any existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object { 
    Write-Host "Killing process $($_.Id)..." -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force 
}

# Set paths
$rootPath = $PSScriptRoot
$serverPath = Join-Path -Path $rootPath -ChildPath "server"
$clientPath = Join-Path -Path $rootPath -ChildPath "client"

# Install dependencies if needed
Write-Host "Checking and installing server dependencies..." -ForegroundColor Yellow
Set-Location -Path $serverPath
npm install

Write-Host "Checking and installing client dependencies..." -ForegroundColor Yellow
Set-Location -Path $clientPath
npm install

# Return to root directory
Set-Location -Path $rootPath

# Check if npm is available
$npmPath = "npm"
if (-not (Get-Command $npmPath -ErrorAction SilentlyContinue)) {
    # Try to find npm in common locations
    $possiblePaths = @(
        "C:\Program Files\nodejs\npm.cmd",
        "C:\Program Files (x86)\nodejs\npm.cmd",
        "$env:APPDATA\npm\npm.cmd"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $npmPath = $path
            break
        }
    }
}

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "node" -ArgumentList "app.js" -WorkingDirectory $serverPath -PassThru -WindowStyle Normal

# Wait for the server to start
Write-Host "Waiting for backend server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start the frontend development server in a new window
Write-Host "Starting frontend development server..." -ForegroundColor Green
$frontendCmd = "Set-Location '$clientPath'; npm run dev"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

# Wait for the frontend server to start
Write-Host "Waiting for frontend server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open the application in the default browser
Write-Host "Opening application in browser..." -ForegroundColor Magenta
Start-Process "http://localhost:3000/test"

Write-Host "Smart Deal Cost Calculator is now running!" -ForegroundColor Cyan
Write-Host "Backend server running with PID: $($serverProcess.Id)" -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Red

# Keep the script running to maintain the processes
try {
    while ($true) {
        # Check if backend process is still running
        if (-not (Get-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue)) {
            Write-Host "Backend server stopped unexpectedly!" -ForegroundColor Red
            break
        }
        Start-Sleep -Seconds 5
    }
}
finally {
    # Cleanup when script is interrupted
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    
    # Kill any node processes that might have been spawned
    Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object { 
        Write-Host "Killing process $($_.Id)..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "All servers stopped." -ForegroundColor Green
}
