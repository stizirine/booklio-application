import { Icon } from '@assets/icons';
import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'exclamation-triangle';
      case 'info': return 'information-circle';
      default: return 'bell';
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            relative p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out
            ${getNotificationStyles(notification.type)}
            animate-in slide-in-from-right-full
          `}
        >
          {/* Bouton de fermeture */}
          <button
            onClick={() => removeNotification(notification.id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>

          {/* Contenu de la notification */}
          <div className="flex items-start gap-3 pr-6">
            <div className="flex-shrink-0">
              <Icon 
                name={getNotificationIcon(notification.type)} 
                className="w-5 h-5" 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="text-sm opacity-90">
                  {notification.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions personnalisées */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`
                    px-3 py-1 text-xs font-medium rounded-md transition-colors
                    ${action.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                      action.variant === 'secondary' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' :
                      action.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Barre de progression pour les notifications temporaires */}
          {notification.duration && notification.duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
              <div 
                className="h-full bg-current opacity-30 animate-pulse"
                style={{
                  animation: `shrink ${notification.duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationContainer;
