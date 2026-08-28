import { app, BrowserWindow, Menu, Tray } from 'electron';
import * as path from 'path';

let tray: Tray | null = null;

export function setupSystemTray(mainWindow: BrowserWindow): Tray | null {
  try {
    const iconPath = path.join(__dirname, '../../assets/icon.png');
    // If icon does not exist yet, we handle gracefully without crashing
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Pak-o-Drive',
        click: () => {
          mainWindow.show();
          mainWindow.focus();
        }
      },
      {
        label: 'Admin Orders',
        click: () => {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('nav:navigate', '/admin/orders');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Pak-o-Drive E-Commerce Desktop');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      mainWindow.show();
      mainWindow.focus();
    });

    return tray;
  } catch {
    // Tray icon optional if assets not generated yet
    return null;
  }
}
