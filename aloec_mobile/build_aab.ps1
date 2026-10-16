$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$keyProperties = Join-Path $projectRoot 'android/key.properties'
if (-not (Test-Path -LiteralPath $keyProperties)) {
    throw 'Falta android/key.properties: la versión de publicación necesita la firma original.'
}

$flutter = Get-Command flutter.bat -ErrorAction Stop
Push-Location $projectRoot
try {
    & $flutter.Source pub get
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudieron resolver las dependencias (código $LASTEXITCODE)."
    }

    & $flutter.Source build appbundle --release
    if ($LASTEXITCODE -ne 0) {
        throw "Falló la compilación del App Bundle (código $LASTEXITCODE)."
    }

    $bundle = Join-Path $projectRoot 'build/app/outputs/bundle/release/app-release.aab'
    if (-not (Test-Path -LiteralPath $bundle)) {
        throw "La compilación terminó sin generar $bundle"
    }

    $versionLine = Select-String -LiteralPath (Join-Path $projectRoot 'pubspec.yaml') -Pattern '^version:\s*[^+]+\+(\d+)' | Select-Object -First 1
    if (-not $versionLine) {
        throw 'No se pudo leer el código de versión de pubspec.yaml.'
    }
    $versionCode = $versionLine.Matches[0].Groups[1].Value
    $namedBundle = Join-Path $projectRoot "APPALOEC V$versionCode.aab"
    Copy-Item -LiteralPath $bundle -Destination $namedBundle -Force

    Write-Host "App Bundle listo: $namedBundle"
} finally {
    Pop-Location
}
