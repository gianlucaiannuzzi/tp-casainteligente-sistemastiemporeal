@echo off
echo ==============================================================
echo                   Compilando el proyecto...
echo ==============================================================
cd frontend-casainteligente
call npm run build

echo ==============================================================
echo                    Generando ejecutable...
echo ==============================================================
cd dist

if exist "Casa Inteligente.exe" (
    move "Casa Inteligente.exe" ../../"Casa Inteligente.exe"
    echo ==============================================================
    echo       Ejecutable generado. Puede cerrar esta ventana.
    echo ==============================================================
) else (
    echo ==============================================================
    echo    No se pudo generar el ejecutable. Intente nuevamente...
    echo ==============================================================
)

pause