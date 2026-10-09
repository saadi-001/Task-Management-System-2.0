import React, { createContext, useContext, useState, ReactNode } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string | null;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextData {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextData | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within an AlertProvider');
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (options: AlertOptions) => {
    setConfig({
      type: 'info', // default
      ...options,
    });
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    if (config.onConfirm) config.onConfirm();
    hideAlert();
  };

  const handleCancel = () => {
    if (config.onCancel) config.onCancel();
    hideAlert();
  };

  const getIconName = () => {
    switch (config.type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      default: return 'info';
    }
  };

  const getVariant = () => {
    switch (config.type) {
      case 'success': return 'info'; // We use info theme for success (usually blue/green based)
      case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <ConfirmModal
        visible={visible}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText || 'OK'}
        cancelText={config.cancelText !== undefined ? config.cancelText : null}
        iconName={getIconName()}
        variant={getVariant()}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};
