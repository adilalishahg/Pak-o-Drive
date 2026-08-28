import { BrowserWindow, ipcMain } from 'electron';
import type { PrintReceiptPayload } from '../../types/electron';

export function setupPrinterHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('pos:getPrinters', async () => {
    try {
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers.map((p) => ({
        name: p.name,
        isDefault: p.isDefault
      }));
    } catch (error) {
      console.error('[Printer] Error fetching printers:', error);
      return [];
    }
  });

  ipcMain.handle('pos:printReceipt', async (_event, payload: PrintReceiptPayload) => {
    let printWindow: BrowserWindow | null = null;
    try {
      if (!payload || !payload.orderId) {
        return { success: false, error: 'Invalid receipt payload' };
      }

      printWindow = new BrowserWindow({
        show: false,
        width: 380,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      const receiptHtml = generateReceiptHtml(payload);
      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`);

      return await new Promise<{ success: boolean; error?: string }>((resolve) => {
        if (!printWindow) {
          return resolve({ success: false, error: 'Print window failed to initialize' });
        }

        printWindow.webContents.print(
          {
            silent: false,
            printBackground: true,
            margins: { marginType: 'none' }
          },
          (success, errorType) => {
            if (printWindow && !printWindow.isDestroyed()) {
              printWindow.close();
            }
            if (success) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: errorType });
            }
          }
        );
      });
    } catch (error) {
      console.error('[Printer] Print failure:', error);
      if (printWindow && !printWindow.isDestroyed()) {
        printWindow.close();
      }
      return { success: false, error: String(error) };
    }
  });
}

function generateReceiptHtml(p: PrintReceiptPayload): string {
  const itemsHtml = p.items
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
        <span style="flex: 1; padding-right: 8px;">${item.title} (x${item.quantity})</span>
        <span style="font-weight: bold;">PKR ${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt #${p.orderId}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            width: 76mm;
            padding: 8px;
            margin: 0 auto;
            color: #000;
            background: #fff;
          }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .title { font-size: 18px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 11px; margin-top: 2px; }
          .meta { font-size: 11px; margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
          .items { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
          .totals { font-size: 12px; margin-bottom: 8px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .grand-total { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
          .footer { text-align: center; font-size: 10px; border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">PAK-O-DRIVE</h1>
          <div class="subtitle">Automotive Parts & Accessories Store</div>
          <div class="subtitle">support@pakodrive.pk | +92 300 0000000</div>
        </div>

        <div class="meta">
          <div><strong>Order:</strong> #${p.orderId}</div>
          <div><strong>Date:</strong> ${p.createdAt}</div>
          <div><strong>Customer:</strong> ${p.customerName}</div>
          <div><strong>Phone:</strong> ${p.phone}</div>
          <div><strong>City:</strong> ${p.city}</div>
          <div><strong>Address:</strong> ${p.address}</div>
          <div><strong>Payment:</strong> ${p.paymentMethod}</div>
        </div>

        <div class="items">
          ${itemsHtml}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>PKR ${p.subtotal.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Delivery Charges:</span>
            <span>PKR ${p.shippingFee.toLocaleString()}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Payable (${p.paymentMethod}):</span>
            <span>PKR ${p.total.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <div>Thank you for choosing Pak-o-Drive!</div>
          <div>For returns or queries, WhatsApp us with Order ID.</div>
        </div>
      </body>
    </html>
  `;
}
