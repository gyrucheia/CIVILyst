param(
    [switch]$RecoverDatabaseAccount,
    [string]$XamppPath = 'C:/xampp',
    [string]$CredentialFile = (Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Documents/Codex/civily-local/db-password.txt')
)

$ErrorActionPreference = 'Stop'
$mysql = Join-Path $XamppPath 'mysql/bin/mysql.exe'
$php = Join-Path $XamppPath 'php/php.exe'
$apiRoot = Join-Path $PSScriptRoot 'api'
$endpoint = 'http://127.0.0.1:8787/api/session'

if (!(Test-Path -LiteralPath $CredentialFile)) {
    $bytes = [byte[]]::new(32)
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $password = [Convert]::ToHexString($bytes)
    $dbArgs = @('--no-defaults', '--protocol=TCP', '-h', '127.0.0.1', '-P', '3306', '-u', 'root', '--connect-timeout=3')
    $directory = Split-Path -Parent $CredentialFile
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    $accountAction = if ($RecoverDatabaseAccount) { 'ALTER USER' } else { 'CREATE USER' }
    $sql = @(
        "$accountAction 'civily_app'@'127.0.0.1' IDENTIFIED BY '$password';"
        "GRANT SELECT, INSERT ON civily_dev.* TO 'civily_app'@'127.0.0.1';"
        "GRANT UPDATE ON civily_dev.petition_types TO 'civily_app'@'127.0.0.1';"
        "GRANT UPDATE (delivery_status,status_updated_at,provider_message_id,sent_at) ON civily_dev.sms_notifications TO 'civily_app'@'127.0.0.1';"
    ) -join "`n"
    $sql | & $mysql @dbArgs
    if ($LASTEXITCODE -ne 0) { throw 'Could not provision the CIVILyst database account. Check that XAMPP MySQL is running and local administrator access is available.' }
    Set-Content -LiteralPath $CredentialFile -Value $password -NoNewline
}

try {
    $existing = Invoke-RestMethod $endpoint -TimeoutSec 2
    if ($existing.PSObject.Properties.Name -contains "staff") { Write-Output 'CIVILyst API is already running.'; exit 0 }
} catch { }

$oldPassword = $env:CIVILY_DB_PASSWORD
try {
    $env:CIVILY_DB_PASSWORD = (Get-Content -LiteralPath $CredentialFile -Raw).Trim()
    Start-Process -FilePath $php -ArgumentList @('-S','127.0.0.1:8787','-t',("`"$apiRoot`""),("`"$(Join-Path $apiRoot 'index.php')`"")) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
} finally {
    $env:CIVILY_DB_PASSWORD = $oldPassword
}

for ($attempt = 0; $attempt -lt 10; $attempt++) {
    try {
        $session = Invoke-RestMethod $endpoint -TimeoutSec 2
        if ($session.PSObject.Properties.Name -contains "staff") {
            Write-Output 'CIVILyst API is running.'
            exit 0
        }
    } catch { }
    Start-Sleep -Milliseconds 300
}
throw 'The local CIVILyst API did not become available on port 8787.'


