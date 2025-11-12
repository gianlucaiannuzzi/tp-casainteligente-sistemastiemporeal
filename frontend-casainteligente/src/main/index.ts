// @ts-expect-error: No type definitions for server file
import { iniciarServidor } from "../server/server";
import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { execFile } from "child_process";
import { existsSync } from "fs";

const isDev = !app.isPackaged;

// Detectar ruta correcta de FreeRTOS EXE
function getSimulacionPath() {
  if (isDev) {
    return join(__dirname, "../../freertos/CasaInteligente.exe");
  } else {
    // Cuando está empaquetado, el ejecutable se mueve dentro de resources/app.asar.unpacked/
    const path = join(process.resourcesPath, "freertos", "CasaInteligente.exe");
    return path;
  };
};

const iniciarSimulacion = () => {
  const exePath = getSimulacionPath();
  if (existsSync(exePath)) {
    execFile(exePath, (err) => {
      if (err) console.error("Error al ejecutar FreeRTOS:", err);
    });
  } else {
    console.error("❌ No se encontró el ejecutable de FreeRTOS:", exePath);
  }
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false
    },
  })

  iniciarSimulacion(); // Levanto la simulacion en FreeRTOS.
  iniciarServidor(); // Levanto el server de Express.

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})