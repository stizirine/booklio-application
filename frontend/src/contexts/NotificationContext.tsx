import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // en millisecondes, 0 = permanent
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Helpers pour les types courants
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      // Appliquer 3000ms par défaut si duration n'est pas définie (undefined) ou si elle est 0 pour les types non-erreur
      duration: notification.duration !== undefined 
        ? notification.duration 
        : (notification.type === 'error' ? 0 : 3000),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove si duration > 0
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  }, [removeNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...(duration !== undefined && { duration }),
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 0, // Les erreurs restent jusqu'à fermeture manuelle
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...(duration !== undefined && { duration }),
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...(duration !== undefined && { duration }),
    });
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
