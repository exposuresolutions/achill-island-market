<#
.SYNOPSIS
  DDWL operator automation: Render API (env + deploy) + live smoke tests + Telegram ping.

.DESCRIPTION
  - Verify: GET /health, POST /ask-lilly, optional Telegram test message.
  - PushEnv: PUT each set variable from process env (or -EnvFile) to Render (single-key API — does not wipe other keys).
  - Deploy: POST deploy for the service.
  - All: PushEnv -> Deploy -> wait -> Verify.

  Requires for Render: RENDER_API_KEY and RENDER_SERVICE_ID OR RENDER_SERVICE_NAME (default: dodealswithlee).
  Create API key: https://dashboard.render.com/u/settings#api-keys
  API docs: https://api-docs.render.com/reference

.PARAMETER Action
  Verify | PushEnv | Deploy | All

.EXAMPLE
  $env:RENDER_API_KEY='rnd_...'; $env:RENDER_SERVICE_ID='srv-...'; .\scripts\ddwl-ops.ps1 -Action Verify

.EXAMPLE
  .\scripts\ddwl-ops.ps1 -Action All -EnvFile .\scripts\ddwl.local.env
#>
param(
  [ValidateSet('Verify', 'PushEnv', 'Deploy', 'All')]
  [string]$Action = 'Verify',

  [string]$RenderApiKey = $env:RENDER_API_KEY,
  [string]$ServiceId = $env:RENDER_SERVICE_ID,
  [string]$ServiceName = $(if ($env:RENDER_SERVICE_NAME) { $env:RENDER_SERVICE_NAME } else { 'dodealswithlee' }),

  [string]$BaseUrl = 'https://dodealswithlee.onrender.com',
  [string]$EnvFile = '',

  [int]$DeployWaitSec = 90,
  [switch]$SkipTelegram,
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$apiRoot = 'https://api.render.com/v1'

function Import-DotEnvFile {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { throw "Env file not found: $Path" }
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $eq = $line.IndexOf('=')
    if ($eq -lt 1) { return }
    $k = $line.Substring(0, $eq).Trim()
    $v = $line.Substring($eq + 1).Trim()
    [Environment]::SetEnvironmentVariable($k, $v, 'Process')
  }
}

function Get-RenderHeaders {
  param([string]$Key)
  if ([string]::IsNullOrWhiteSpace($Key)) { throw "RENDER_API_KEY is not set. https://dashboard.render.com/u/settings#api-keys" }
  return @{ Authorization = "Bearer $Key"; Accept = 'application/json' }
}

function Get-RenderServiceIdFromName {
  param([string]$Key, [string]$Name)
  $uri = "$apiRoot/services?name=$([uri]::EscapeDataString($Name))"
  $resp = Invoke-RestMethod -Uri $uri -Headers (Get-RenderHeaders $Key) -Method Get
  $rows = @()
  if ($null -eq $resp) { }
  elseif ($resp -is [System.Array]) { $rows = $resp }
  else { $rows = @($resp) }
  $match = $null
  foreach ($row in $rows) {
    $s = $row.service
    if (-not $s) { continue }
    if ($s.name -eq $Name -or $s.slug -eq $Name) {
      $match = $s
      break
    }
  }
  if (-not $match) {
    throw "No service named '$Name'. Open https://dashboard.render.com and copy the service id (srv-...), set RENDER_SERVICE_ID."
  }
  return $match.id
}

function Set-RenderServiceEnvVar {
  param([string]$Key, [string]$ServiceId, [string]$EnvKey, [string]$EnvValue)
  $encKey = [uri]::EscapeDataString($EnvKey)
  $uri = "$apiRoot/services/$ServiceId/env-vars/$encKey"
  $body = @{ value = $EnvValue } | ConvertTo-Json
  if ($WhatIf) {
    Write-Host "[whatif] PUT $uri"
    return
  }
  Invoke-RestMethod -Uri $uri -Headers (Get-RenderHeaders $Key) -Method Put -Body $body -ContentType 'application/json' | Out-Null
}

function Invoke-RenderDeploy {
  param([string]$Key, [string]$ServiceId)
  $uri = "$apiRoot/services/$ServiceId/deploys"
  $body = '{"clearCache":"do_not_clear"}'
  if ($WhatIf) {
    Write-Host "[whatif] POST $uri"
    return $null
  }
  return Invoke-RestMethod -Uri $uri -Headers (Get-RenderHeaders $Key) -Method Post -Body $body -ContentType 'application/json'
}

function Test-DdwlSite {
  param([string]$BaseUrl)
  Write-Host "`n== Health: $BaseUrl/health =="
  $h = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec 40
  $h | ConvertTo-Json -Compress | Write-Host
  if ($h.status -ne 'ok') { throw "Health check failed" }

  Write-Host "`n== ask-lilly (Kimi path) =="
  $body = '{"question":"Reply with one word: OK"}'
  $a = Invoke-RestMethod -Uri "$BaseUrl/ask-lilly" -Method Post -Body $body -ContentType 'application/json; charset=utf-8' -TimeoutSec 90
  $a | ConvertTo-Json -Compress | Write-Host
  if (-not $a.ok) { throw "/ask-lilly returned ok=false" }
  Write-Host "Provider: $($a.provider) OK"
}

function Send-TelegramTest {
  $token = $env:TG_BOT_TOKEN
  $chat = $env:TG_CHAT_ID
  if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($chat)) {
    Write-Host "`n[telegram] Skipping (set TG_BOT_TOKEN and TG_CHAT_ID to test)."
    return
  }
  $msg = "DDWL ops script ping — $(Get-Date -Format o)"
  $uri = "https://api.telegram.org/bot$token/sendMessage"
  $payload = @{ chat_id = $chat; text = $msg }
  $r = Invoke-RestMethod -Uri $uri -Method Post -Body $payload -TimeoutSec 40
  if ($r.ok) { Write-Host "`n[telegram] Message sent." } else { throw "Telegram send failed" }
}

$keysToPush = @(
  'KIMI_API_KEY', 'KIMI_MODEL', 'KIMI_BASE_URL', 'GROQ_API_KEY',
  'TG_BOT_TOKEN', 'TG_CHAT_ID', 'TG_ALLOWED_USERS', 'NOTIFY_ENABLED', 'TG_BOT_LABEL',
  'TELEGRAM_BOT_TOKEN', 'TELEGRAM_ADMIN_CHAT_ID', 'TELEGRAM_BOT_LABEL'
)

if ($EnvFile) { Import-DotEnvFile $EnvFile }

if (-not [string]::IsNullOrWhiteSpace($RenderApiKey) -and [string]::IsNullOrWhiteSpace($ServiceId) -and -not [string]::IsNullOrWhiteSpace($ServiceName)) {
  if ($Action -in @('PushEnv', 'Deploy', 'All')) {
    Write-Host "Resolving service id by name: $ServiceName"
    $ServiceId = Get-RenderServiceIdFromName -Key $RenderApiKey -Name $ServiceName
    Write-Host "ServiceId: $ServiceId"
  }
}

if ($Action -eq 'Verify') {
  Test-DdwlSite -BaseUrl $BaseUrl
  if (-not $SkipTelegram) { Send-TelegramTest }
  Write-Host "`nDone (Verify)."
  exit 0
}

if ($Action -eq 'PushEnv') {
  if ([string]::IsNullOrWhiteSpace($RenderApiKey) -or [string]::IsNullOrWhiteSpace($ServiceId)) {
    throw "PushEnv needs RENDER_API_KEY and RENDER_SERVICE_ID (or resolve via RENDER_SERVICE_NAME + name lookup)."
  }
  foreach ($k in $keysToPush) {
    $v = [Environment]::GetEnvironmentVariable($k, 'Process')
    if ([string]::IsNullOrWhiteSpace($v)) { continue }
    Write-Host "Pushing $k ..."
    Set-RenderServiceEnvVar -Key $RenderApiKey -ServiceId $ServiceId -EnvKey $k -EnvValue $v
  }
  Write-Host "PushEnv complete. Trigger Deploy or wait for autodeploy."
  exit 0
}

if ($Action -eq 'Deploy') {
  if ([string]::IsNullOrWhiteSpace($RenderApiKey) -or [string]::IsNullOrWhiteSpace($ServiceId)) {
    throw "Deploy needs RENDER_API_KEY and RENDER_SERVICE_ID."
  }
  $d = Invoke-RenderDeploy -Key $RenderApiKey -ServiceId $ServiceId
  $d | ConvertTo-Json -Depth 5 | Write-Host
  exit 0
}

if ($Action -eq 'All') {
  if ([string]::IsNullOrWhiteSpace($RenderApiKey) -or [string]::IsNullOrWhiteSpace($ServiceId)) {
    throw "All needs RENDER_API_KEY and RENDER_SERVICE_ID (or set RENDER_SERVICE_NAME for lookup)."
  }
  foreach ($k in $keysToPush) {
    $v = [Environment]::GetEnvironmentVariable($k, 'Process')
    if ([string]::IsNullOrWhiteSpace($v)) { continue }
    Write-Host "Pushing $k ..."
    Set-RenderServiceEnvVar -Key $RenderApiKey -ServiceId $ServiceId -EnvKey $k -EnvValue $v
  }
  Write-Host "Triggering deploy..."
  Invoke-RenderDeploy -Key $RenderApiKey -ServiceId $ServiceId | Out-Null
  Write-Host "Waiting $DeployWaitSec s for deploy..."
  Start-Sleep -Seconds $DeployWaitSec
  Test-DdwlSite -BaseUrl $BaseUrl
  if (-not $SkipTelegram) { Send-TelegramTest }
  Write-Host "`nDone (All)."
  exit 0
}
