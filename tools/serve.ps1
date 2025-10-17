param(
  [int]$Port = 8000,
  [string]$RootPath = (Get-Location).ProviderPath
)

function Get-MimeType {
  param($path)
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  switch ($ext) {
    '.html' { 'text/html; charset=utf-8' }
    '.htm'  { 'text/html; charset=utf-8' }
    '.css'  { 'text/css; charset=utf-8' }
    '.js'   { 'application/javascript; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.png'  { 'image/png' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.gif'  { 'image/gif' }
    '.svg'  { 'image/svg+xml' }
    '.ico'  { 'image/x-icon' }
    '.txt'  { 'text/plain; charset=utf-8' }
    default { 'application/octet-stream' }
  }
}

$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Error "Failed to start HttpListener on $prefix. Try running PowerShell as Administrator or choose a different port. $_"
  exit 1
}

Write-Host "Serving '$RootPath' at $prefix"
Write-Host "Press Ctrl+C to stop."

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'index.html' }

    $filePath = Join-Path $RootPath $urlPath

    if (Test-Path $filePath -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentType = Get-MimeType $filePath
      $response.ContentLength64 = $bytes.Length
      $response.StatusCode = 200
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $msg = "404 Not Found: $urlPath"
      $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $response.ContentType = 'text/plain; charset=utf-8'
      $response.ContentLength64 = $buf.Length
      $response.OutputStream.Write($buf, 0, $buf.Length)
    }
    $response.OutputStream.Close()
  } catch [System.Exception] {
    Write-Host "Error handling request: $($_.Exception.Message)"
  }
}
