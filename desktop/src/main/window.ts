import { BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';

export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

export function createMainWindow(preloadPath: string): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const defaultWidth = Math.min(1366, Math.floor(screenWidth * 0.9));
  const defaultHeight = Math.min(860, Math.floor(screenHeight * 0.9));

  const win = new BrowserWindow({
    width: defaultWidth,
    height: defaultHeight,
    minWidth: 1024,
    minHeight: 700,
    show: false, // Prevents white flash before render
    backgroundColor: '#0f172a', // Matches dark theme background
    autoHideMenuBar: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // Window control IPC handlers
  ipcMain.on('window:minimize', () => {
    if (win && !win.isDestroyed()) win.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (win && !win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on('window:close', () => {
    if (win && !win.isDestroyed()) win.close();
  });

  return win;
}
