import { useContext } from 'react';
import { AdminErrorContext } from '../context/AdminErrorContext';
import { AdminErrorContextValue } from '../types/adminError';

/**
 * useAdminErrors Hook
 * Encapsulates global admin console error and warning state.
 * Adheres strictly to Rule #8 (Zero Logic in UI).
 */
export function useAdminErrors(): AdminErrorContextValue {
  const context = useContext(AdminErrorContext);
  if (!context) {
    throw new Error('useAdminErrors must be used within an AdminErrorProvider');
  }
  return context;
}
