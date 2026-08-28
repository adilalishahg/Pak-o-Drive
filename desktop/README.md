# 🖥️ Pak-o-Drive Desktop & POS Application (Electron.js)

Dedicated Electron.js runtime for the Pak-o-Drive E-Commerce platform, featuring native Pakistani POS thermal receipt printing, WhatsApp deep linking, single-instance execution, and system tray management.

---

## 🏗️ Architecture

- **Main Process (`src/main/`)**:
  - `index.ts`: Application lifecycle, single-instance mutex, window orchestration.
  - `window.ts`: Graceful ready-to-show display, screen dimension calculations.
  - `menu.ts`: Native OS menu bar & keyboard shortcuts (`Ctrl+1` Store, `Ctrl+2` Admin, `Ctrl+3` Orders).
  - `tray.ts`: System tray minimizing & quick background order navigation.
  - `ipc/`: Safe IPC handlers for POS receipt printing, external URL sanitization, and persistent config.
- **Preload Script (`src/preload/`)**:
  - Secure `contextBridge` exposing strictly typed `window.electronAPI`.
  - Zero Node.js primitives exposed to DOM (`contextIsolation: true`, `nodeIntegration: false`).

---

## 🚀 Quick Start

### 1. Install Desktop Dependencies
```bash
cd desktop
npm install
```

### 2. Run in Development Mode
Make sure your Next.js dev server is running on `http://localhost:3000`:
```bash
# In the root directory:
npm run dev

# In another terminal:
npm run desktop:dev
```

### 3. Build Windows Installer (.exe)
```bash
npm run desktop:dist
```
The resulting installer will be generated in `desktop/dist-package/`.

---

## 🖨️ POS Receipt Printing Bridge

The desktop application provides a direct IPC handler for 80mm thermal receipt printing:
```ts
if (window.electronAPI?.isDesktop) {
  await window.electronAPI.printReceipt({
    orderId: "POD-98421",
    customerName: "Muhammad Ali",
    phone: "03001234567",
    city: "Lahore",
    address: "House 12, Street 4, Gulberg III",
    items: [
      { title: "Toyota Corolla LED Headlight Set", quantity: 1, price: 4500 }
    ],
    subtotal: 4500,
    shippingFee: 250,
    total: 4750,
    paymentMethod: "COD",
    createdAt: new Date().toLocaleString()
  });
}
```
