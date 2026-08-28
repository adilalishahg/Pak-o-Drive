import { app, BrowserWindow, Menu, MenuItemConstructorOptions, shell } from 'electron';

export function setupAppMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload Page',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        {
          label: 'Hard Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Go to Storefront',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('nav:navigate', '/');
          }
        },
        {
          label: 'Go to Admin Dashboard',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('nav:navigate', '/admin');
          }
        },
        {
          label: 'Go to Orders',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('nav:navigate', '/admin/orders');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        ...(process.env.NODE_ENV === 'development'
          ? [
              { type: 'separator' as const },
              { role: 'toggleDevTools' as const }
            ]
          : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Pak-o-Drive Documentation',
          click: async () => {
            await shell.openExternal('https://pakodrive.pk');
          }
        },
        {
          label: 'Contact Support via WhatsApp',
          click: async () => {
            await shell.openExternal('https://wa.me/923000000000?text=Salam%20Pak-o-Drive%20Support');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
