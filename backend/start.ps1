# Inicia el backend con el entorno virtual correcto
Set-Location $PSScriptRoot

if (-not (Test-Path .\.venv\Scripts\python.exe)) {
    Write-Host "Creando entorno virtual..."
    python -m venv .venv
    .\.venv\Scripts\pip.exe install -r requirements.txt
}

Write-Host "Iniciando Academic Tutor API en http://localhost:8000"
Write-Host "Documentacion: http://localhost:8000/docs"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
