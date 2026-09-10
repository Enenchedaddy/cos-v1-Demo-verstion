#Requires -RunAsAdministrator

[CmdletBinding(SupportsShouldProcess)]
param(
  [string]$SiteName,
  [string]$ArtifactPath = (Join-Path $PSScriptRoot '..\dist'),
  [string]$ExpectedProjectHost = 'bppjneljqonuouleptgs.supabase.co'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module WebAdministration -ErrorAction Stop

$artifact = (Resolve-Path -LiteralPath $ArtifactPath).Path
$indexPath = Join-Path $artifact 'index.html'
if (-not (Test-Path -LiteralPath $indexPath -PathType Leaf)) {
  throw "The deployment artifact does not contain index.html: $artifact"
}

$artifactFiles = @(Get-ChildItem -LiteralPath $artifact -File -Recurse)
$hasExpectedProject = $false
foreach ($file in $artifactFiles) {
  $content = [IO.File]::ReadAllText($file.FullName)
  if ($content.Contains($ExpectedProjectHost)) {
    $hasExpectedProject = $true
  }
  if ($content.Contains('sb_secret_')) {
    throw 'The deployment artifact contains a Supabase secret-key marker. Refusing IIS deployment.'
  }
}

if (-not $hasExpectedProject) {
  throw "The deployment artifact does not contain the expected Supabase project host: $ExpectedProjectHost"
}

if ($SiteName) {
  $site = Get-Website -Name $SiteName -ErrorAction Stop
  $port80Bindings = @(Get-WebBinding -Name $site.Name -Protocol http | Where-Object { $_.bindingInformation -match ':80:' })
  if ($port80Bindings.Count -eq 0) {
    throw "IIS site '$($site.Name)' does not have an HTTP port 80 binding."
  }
} else {
  $candidates = @(Get-Website | Where-Object {
    @(Get-WebBinding -Name $_.Name -Protocol http | Where-Object { $_.bindingInformation -match ':80:' }).Count -gt 0
  })
  if ($candidates.Count -ne 1) {
    $candidateNames = ($candidates | ForEach-Object Name) -join ', '
    throw "Expected exactly one IIS site with an HTTP port 80 binding; found $($candidates.Count): $candidateNames. Pass -SiteName explicitly."
  }
  $site = $candidates[0]
  $port80Bindings = @(Get-WebBinding -Name $site.Name -Protocol http | Where-Object { $_.bindingInformation -match ':80:' })
}

$currentPath = [Environment]::ExpandEnvironmentVariables([string]$site.PhysicalPath)
$currentRoot = (Resolve-Path -LiteralPath $currentPath).Path.TrimEnd('\')
if (-not (Test-Path -LiteralPath $currentRoot -PathType Container)) {
  throw "The current IIS physical path is not a directory: $currentRoot"
}

$volumeRoot = [IO.Path]::GetPathRoot($currentRoot).TrimEnd('\')
if ($currentRoot -eq $volumeRoot) {
  throw "Refusing deployment because the IIS physical path resolves to a volume root: $currentRoot"
}

$parent = [IO.Directory]::GetParent($currentRoot)
if ($null -eq $parent) {
  throw "Unable to determine a safe release parent for: $currentRoot"
}

$releaseName = '{0}-release-{1}' -f (Split-Path -Leaf $currentRoot), (Get-Date -Format 'yyyyMMddHHmmss')
$releasePath = Join-Path $parent.FullName $releaseName
if (Test-Path -LiteralPath $releasePath) {
  throw "The versioned release path already exists: $releasePath"
}

$appPool = [string](Get-Item -LiteralPath "IIS:\Sites\$($site.Name)").applicationPool
$targetDescription = "IIS site '$($site.Name)' from '$currentRoot' to '$releasePath'"
if (-not $PSCmdlet.ShouldProcess($targetDescription, 'Deploy verified COS static artifact')) {
  return
}

$release = New-Item -ItemType Directory -Path $releasePath
Set-Acl -LiteralPath $release.FullName -AclObject (Get-Acl -LiteralPath $currentRoot)
Get-ChildItem -LiteralPath $artifact | Copy-Item -Destination $release.FullName -Recurse

$currentWebConfig = Join-Path $currentRoot 'web.config'
$releaseWebConfig = Join-Path $release.FullName 'web.config'
if ((Test-Path -LiteralPath $currentWebConfig -PathType Leaf) -and -not (Test-Path -LiteralPath $releaseWebConfig)) {
  Copy-Item -LiteralPath $currentWebConfig -Destination $releaseWebConfig
}

$bindingParts = ([string]$port80Bindings[0].bindingInformation).Split(':', 3)
$requestAddress = if ($bindingParts[0] -and $bindingParts[0] -ne '*') { $bindingParts[0] } else { '127.0.0.1' }
$hostHeader = $bindingParts[2]
$requestHeaders = if ($hostHeader) { @{ Host = $hostHeader } } else { @{} }
$baseUri = [Uri]"http://$requestAddress/"
$switched = $false

try {
  Set-ItemProperty -LiteralPath "IIS:\Sites\$($site.Name)" -Name physicalPath -Value $release.FullName
  $switched = $true
  Restart-WebAppPool -Name $appPool

  $indexResponse = Invoke-WebRequest -Uri $baseUri -Headers $requestHeaders -UseBasicParsing
  if ($indexResponse.StatusCode -ne 200) {
    throw "IIS smoke test returned HTTP $($indexResponse.StatusCode) for $baseUri"
  }

  $assetMatch = [regex]::Match($indexResponse.Content, 'src="(?<asset>/assets/index-[^"]+\.js)"')
  if (-not $assetMatch.Success) {
    throw 'IIS smoke test could not find the hashed application asset in index.html.'
  }

  $assetUri = [Uri]::new($baseUri, $assetMatch.Groups['asset'].Value.TrimStart('/'))
  $assetResponse = Invoke-WebRequest -Uri $assetUri -Headers $requestHeaders -UseBasicParsing
  if ($assetResponse.StatusCode -ne 200 -or -not $assetResponse.Content.Contains($ExpectedProjectHost)) {
    throw 'IIS served an application asset without the expected Supabase project configuration.'
  }
} catch {
  if ($switched) {
    Set-ItemProperty -LiteralPath "IIS:\Sites\$($site.Name)" -Name physicalPath -Value $currentRoot
    Restart-WebAppPool -Name $appPool
  }
  throw "IIS deployment failed and the previous physical path was restored. $($_.Exception.Message)"
}

[pscustomobject]@{
  SiteName = $site.Name
  AppPool = $appPool
  PreviousPhysicalPath = $currentRoot
  ActivePhysicalPath = $release.FullName
  MainAsset = $assetMatch.Groups['asset'].Value
  VerificationUrl = $baseUri.AbsoluteUri
  RollbackCommand = "Set-ItemProperty -LiteralPath 'IIS:\Sites\$($site.Name)' -Name physicalPath -Value '$currentRoot'; Restart-WebAppPool -Name '$appPool'"
}
