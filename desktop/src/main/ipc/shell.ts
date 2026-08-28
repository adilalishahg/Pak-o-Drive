import { ipcMain, shell } from 'electron';

export function setupShellHandlers(): void {
  ipcMain.handle('shell:openExternal', async (_event, targetUrl: string) => {
    try {
      if (!targetUrl || typeof targetUrl !== 'string') {
        return false;
      }

      const parsed = new URL(targetUrl);
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
      
      // WhatsApp deep links (wa.me, api.whatsapp.com, or whatsapp:// protocol)
      if (
        allowedProtocols.includes(parsed.protocol) ||
        parsed.protocol === 'whatsapp:'
      ) {
        await shell.openExternal(targetUrl);
        return true;
      }

      console.warn(`[Shell] Blocked disallowed protocol: ${parsed.protocol}`);
      return false;
    } catch (error) {
      console.error('[Shell] Failed to open external URL:', error);
      return false;
    }
  });
}
