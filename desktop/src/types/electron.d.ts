export interface PrintReceiptPayload {
  orderId: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'COD' | 'JazzCash' | 'Easypaisa';
  createdAt: string;
}

export interface ElectronAPI {
  isDesktop: boolean;
  platform: string;
  version: string;
  openExternal: (url: string) => Promise<boolean>;
  printReceipt: (payload: PrintReceiptPayload) => Promise<{ success: boolean; error?: string }>;
  getPrinters: () => Promise<Array<{ name: string; isDefault: boolean }>>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  getStoreValue: (key: string) => Promise<unknown>;
  setStoreValue: (key: string, value: unknown) => Promise<void>;
  onNetworkStatusChange: (callback: (isOnline: boolean) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
