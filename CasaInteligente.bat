@echo off
echo ===============================
echo    Compilando el proyecto...
echo ===============================
cd frontend-casainteligente
call npm run build

echo ===============================
echo      Abriendo interfaz gráfica...
echo ===============================
cd dist

if exist "Casa Inteligente 1.0.0.exe" (
    start "" "Casa Inteligente 1.0.0.exe"
) else (
    echo ❌ No se encontró la interfaz gráfica en la carpeta dist. Intente nuevamente...
    pause
)