import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI, PrintReceiptPayload } from '../types/electron';

const electronAPI: ElectronAPI = {
  isDesktop: true,
  platform: process.platform,
  version: process.env.npm_package_version || '1.0.0',

  openExternal: (url: string) => {
    return ipcRenderer.invoke('shell:openExternal', url);
  },

  printReceipt: (payload: PrintReceiptPayload) => {
    return ipcRenderer.invoke('pos:printReceipt', payload);
  },

  getPrinters: () => {
    return ipcRenderer.invoke('pos:getPrinters');
  },

  minimizeWindow: () => {
    ipcRenderer.send('window:minimize');
  },

  maximizeWindow: () => {
    ipcRenderer.send('window:maximize');
  },

  closeWindow: () => {
    ipcRenderer.send('window:close');
  },

  getStoreValue: (key: string) => {
    return ipcRenderer.invoke('store:get', key);
  },

  setStoreValue: (key: string, value: unknown) => {
    return ipcRenderer.invoke('store:set', key, value);
  },

  onNetworkStatusChange: (callback: (isOnline: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isOnline: boolean) => callback(isOnline);
    ipcRenderer.on('network:status-change', handler);
    return () => {
      ipcRenderer.removeListener('network:status-change', handler);
    };
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
