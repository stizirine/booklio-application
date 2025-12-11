import { Icon } from '@assets/icons';
import React, { useEffect, useRef } from 'react';
import ModalPortal from './ModalPortal';
import { Button } from '@components/ui';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number; // en millisecondes
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'info',
  loading = false,
  autoClose = true,
  autoCloseDelay = 5000
}) => {
  const { t } = useTranslation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fermeture automatique
  useEffect(() => {
    if (!isOpen || !autoClose || loading) {
      // Nettoyer le timeout si la modal se ferme ou si le loading est activé
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Créer un nouveau timeout pour la fermeture automatique
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    // Nettoyer le timeout lors du démontage ou si les dépendances changent
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOpen, autoClose, autoCloseDelay, loading, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'exclamation',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          iconBg: 'bg-yellow-100'
        };
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: 'text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          iconBg: 'bg-green-100'
        };
      default:
        return {
          icon: 'info',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
            <div className="flex items-start">
              <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl ${styles.iconBg} shadow-lg`}>
                <Icon name={styles.icon} className={`text-2xl ${styles.iconColor}`} size="xl" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <div className="mt-2">
                  <p 
                    className="text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: message }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row-reverse gap-3">
            <Button
              className="w-full sm:w-auto px-6 py-3"
              variant={type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'}
              onClick={onConfirm}
              disabled={loading}
              leftIcon={loading ? <Icon name="refresh" className="animate-spin h-4 w-4" size="sm" /> : undefined}
            >
              {loading ? t('common.loading') : (confirmText || t('common.confirm'))}
            </Button>
            <Button
              className="w-full sm:w-auto px-6 py-3"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText || t('common.cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default ConfirmationModal;
