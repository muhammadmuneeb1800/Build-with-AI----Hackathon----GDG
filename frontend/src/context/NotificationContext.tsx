import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { NotificationConfig, NotificationContextType } from '../types/types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 1. Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showNotification = useCallback((config: NotificationConfig) => {
    const { type, title, message, duration = 4000 } = config;
    const fullMessage = title ? `${title}: ${message}` : message;
    
    const toastConfig: ToastOptions = {
      position: 'top-right',
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (type) {
      case 'success': toast.success(fullMessage, toastConfig); break;
      case 'error': toast.error(fullMessage, toastConfig); break;
      case 'warning': toast.warning(fullMessage, toastConfig); break;
      case 'info': toast.info(fullMessage, toastConfig); break;
    }
  }, []);

  // useMemo use karein taake context value stable rahe
  const value = useMemo(() => ({
    showNotification,
    showSuccess: (title: string, message: string) => showNotification({ type: 'success', title, message }),
    showError: (title: string, message: string) => showNotification({ type: 'error', title, message }),
    showWarning: (title: string, message: string) => showNotification({ type: 'warning', title, message }),
    showInfo: (title: string, message: string) => showNotification({ type: 'info', title, message }),
  }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer newestOnTop theme="light" />
    </NotificationContext.Provider>
  );
};

// 2. Custom Hook
// Agar abhi bhi error aaye, toh is hook ko ek alag file "useNotification.ts" mein le jayein.
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a ToastProvider');
  }
  return context;
}