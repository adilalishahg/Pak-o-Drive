export type AdminLogLevel = 'error' | 'warn';

export interface AdminLogEntry {
  id: string;
  type: AdminLogLevel;
  message: string;
  stack?: string;
  source?: string;
  timestamp: Date;
  count: number;
  dismissed: boolean;
}

export interface AdminErrorContextValue {
  alerts: AdminLogEntry[];
  activeAlert: AdminLogEntry | null;
  unreadErrorsCount: number;
  unreadWarningsCount: number;
  currentIndex: number;
  expandedId: string | null;
  minimized: boolean;
  drawerOpen: boolean;
  copiedId: string | null;
  setDrawerOpen: (open: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  dismissAlert: (id: string) => void;
  dismissCurrent: () => void;
  clearAll: () => void;
  toggleDetails: (id: string) => void;
  nextAlert: () => void;
  prevAlert: () => void;
  copyError: (id: string) => Promise<boolean>;
  simulateTestError: (type?: AdminLogLevel) => void;
}
