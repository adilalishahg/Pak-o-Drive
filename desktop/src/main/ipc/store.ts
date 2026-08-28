import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export function setupStoreHandlers(): void {
  const userDataPath = app.getPath('userData');
  const storeFilePath = path.join(userDataPath, 'pakodrive-config.json');

  let localStore: Record<string, unknown> = {};

  try {
    if (fs.existsSync(storeFilePath)) {
      const data = fs.readFileSync(storeFilePath, 'utf-8');
      localStore = JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Store] Could not read existing store file, initializing new:', err);
    localStore = {};
  }

  ipcMain.handle('store:get', (_event, key: string) => {
    return localStore[key];
  });

  ipcMain.handle('store:set', (_event, key: string, value: unknown) => {
    localStore[key] = value;
    try {
      fs.writeFileSync(storeFilePath, JSON.stringify(localStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Failed to persist config:', err);
    }
  });
}
