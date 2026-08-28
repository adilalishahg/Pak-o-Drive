import { app, BrowserWindow, shell } from 'electron';
import * as path from 'path';
import * as http from 'http';
import { createMainWindow } from './window';
import { setupAppMenu } from './menu';
import { setupSystemTray } from './tray';
import { setupShellHandlers } from './ipc/shell';
import { setupPrinterHandlers } from './ipc/printer';
import { setupStoreHandlers } from './ipc/store';

// Single instance lock to prevent duplicate app instances
const hasInstanceLock = app.requestSingleInstanceLock();

if (!hasInstanceLock) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const port = process.env.PORT || '3000';
  const targetUrl = process.env.APP_URL || `http://localhost:${port}`;

  async function checkServerAvailable(urlStr: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const parsed = new URL(urlStr);
        const req = http.request(
          {
            hostname: parsed.hostname,
            port: parsed.port || 80,
            path: '/',
            method: 'GET',
            timeout: 2000
          },
          (res) => {
            resolve(res.statusCode !== undefined);
          }
        );
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      } catch {
        resolve(false);
      }
    });
  }

  async function loadAppWithRetry(win: BrowserWindow, url: string, retries = 20): Promise<void> {
    for (let i = 1; i <= retries; i++) {
      if (win.isDestroyed()) return;

      const isUp = await checkServerAvailable(url);
      if (isUp) {
        console.log(`[Desktop] Server online at ${url}. Loading UI...`);
        try {
          await win.loadURL(url);
          return;
        } catch (err) {
          console.warn(`[Desktop] Load attempt ${i} failed:`, err);
        }
      } else {
        console.log(`[Desktop] Waiting for Next.js server on ${url} (Attempt ${i}/${retries})...`);
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!win.isDestroyed()) {
      const fallbackHtml = `
        <!DOCTYPE html>
        <html style="background:#0f172a; color:#f8fafc; font-family:sans-serif; height:100%; display:flex; align-items:center; justify-content:center; text-align:center;">
          <div>
            <h1 style="color:#38bdf8; font-size:24px; margin-bottom:8px;">Pak-o-Drive Desktop</h1>
            <p style="color:#94a3b8; font-size:14px; max-width:400px; line-height:1.5;">
              Next.js server connect nahi ho saka (<code>${url}</code>).<br/>
              Barahe karam terminal mein <code>npm run dev</code> chalayein aur neeche diye button par click karein.
            </p>
            <button onclick="window.location.reload()" style="background:#0284c7; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:16px;">
              🔄 Retry Connection
            </button>
          </div>
        </html>
      `;
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`);
    }
  }

  async function initializeApp() {
    const preloadPath = path.join(__dirname, '../preload/index.js');
    mainWindow = createMainWindow(preloadPath);

    // Setup modular IPC subsystems
    setupShellHandlers();
    setupPrinterHandlers(mainWindow);
    setupStoreHandlers();
    setupAppMenu(mainWindow);
    setupSystemTray(mainWindow);

    // Safe external links (WhatsApp, etc.)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (
        url.startsWith('https://wa.me/') ||
        url.startsWith('https://api.whatsapp.com/') ||
        url.startsWith('whatsapp://') ||
        !url.includes('localhost')
      ) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    loadAppWithRetry(mainWindow, targetUrl);

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    initializeApp();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        initializeApp();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
