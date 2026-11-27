$ErrorActionPreference = 'Stop'
$credentialFile = Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Documents/Codex/civily-local/db-password.txt'
$dbPassword = (Get-Content -LiteralPath $credentialFile -Raw).Trim()
$name = Read-Host 'Super Admin full name'
$email = Read-Host 'Super Admin email'
$password = Read-Host 'Super Admin password (at least 12 characters)' -AsSecureString
$priorDbPassword = $env:CIVILY_DB_PASSWORD
try {
    $env:CIVILY_DB_PASSWORD = $dbPassword
    $clearPassword = [System.Net.NetworkCredential]::new('', $password).Password
    @{ name = $name; email = $email; password = $clearPassword } | ConvertTo-Json -Compress -EscapeHandling EscapeNonAscii |
        & 'C:/xampp/php/php.exe' (Join-Path $PSScriptRoot 'scripts/create-super-admin.php')
    exit $LASTEXITCODE
} finally {
    $env:CIVILY_DB_PASSWORD = $priorDbPassword
    $password.Dispose()
    Remove-Variable clearPassword -ErrorAction SilentlyContinue
}
