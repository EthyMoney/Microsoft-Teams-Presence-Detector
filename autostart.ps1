# Check if the script is already running with admin privileges
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
  # If not running with admin privileges, re-run the script with elevated permissions
  Start-Process -FilePath PowerShell.exe -Verb Runas -ArgumentList "-File ""$PSCommandPath"" $args"
  Exit
}

Set-Location <path to your project directory here>

pm2 start main.js -n teams-status-monitor --kill-timeout 15000 --shutdown-with-message

# close the window after 5 seconds
Start-Sleep -s 5
