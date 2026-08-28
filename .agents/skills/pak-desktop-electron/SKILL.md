---
name: pak-desktop-electron
description: Specialized workflows, IPC architecture, thermal receipt printing, and Electron.js desktop standards for Pak-o-Drive.
---

# 🖥️ Pak-o-Drive Desktop & POS Electron Engineering Skill

Use this skill when developing, refactoring, building, or debugging the Pak-o-Drive Electron.js desktop application and Point-of-Sale (POS) integration.

---

## 1. Core Architecture & Process Separation

Pak-o-Drive Desktop strictly isolates Node.js backend internals from UI presentation layers.

```
desktop/
├── src/main/       # Electron Main Process (Lifecycle, System Tray, Window Management)
│   ├── index.ts    # Single Instance Lock & App initialization
│   ├── window.ts   # Window dimensions, state persistence, graceful ready-to-show
│   ├── menu.ts     # Native menu bar & keyboard shortcuts (CmdOrCtrl+1/2/3)
│   ├── tray.ts     # System tray minimizing and quick order navigation
│   └── ipc/        # Modular IPC Handlers (printer, shell, store)
├── src/preload/    # Secure ContextBridge (window.electronAPI)
└── src/types/      # Typed IPC contracts (PrintReceiptPayload, ElectronAPI)
```

---

## 2. Mandatory Electron Security Guidelines

1. **Strict Context Isolation**:
   - `contextIsolation: true` is ALWAYS enabled.
   - `nodeIntegration: false` is ALWAYS enforced in all `BrowserWindow` and `webPreferences`.
   - Never expose raw Node `child_process`, `fs`, or `electron` primitives to the DOM window.

2. **Safe Protocol & URL Interception**:
   - External links, WhatsApp ordering URLs (`https://wa.me/`, `whatsapp://`), and documentation must be intercepted in `webContents.setWindowOpenHandler` and routed via `shell.openExternal`.
   - Never allow untrusted navigations within the main window.

---

## 3. POS & COD Thermal Receipt Printing Standards

For Pakistani warehouse dispatchers and retail counters:
- **Paper Width**: Standard 80mm / 76mm thermal roll styling (`@page { size: 80mm auto; margin: 0; }`).
- **Required Metadata**:
  - Order ID (formatted with `#` prefix)
  - Courier / Payment Mode (`COD`, `JazzCash`, `Easypaisa`)
  - Recipient Name, Phone (`03XX-XXXXXXX`), Full Address, and City
  - Itemized lines with quantity and formatted PKR totals (`PKR X,XXX`)
  - Return / WhatsApp Support footer

---

## 4. Development & Build Commands

- **Run Dev Desktop**:
  ```bash
  npm run desktop:dev
  # or from desktop directory:
  cd desktop && npm run dev
  ```
- **Compile TypeScript**:
  ```bash
  npm run desktop:build
  ```
- **Package Windows Installer (.exe)**:
  ```bash
  npm run desktop:dist
  ```
