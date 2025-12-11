import { Icon } from '@assets/icons';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../contexts/ModalContext';

const ModalManager: React.FC = () => {
  const { modals, closeModal } = useModal();

  // Gérer l'escape key pour fermer la dernière modale
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modals.length > 0) {
        const lastModal = modals[modals.length - 1];
        if (lastModal.closeOnEscape !== false) {
          closeModal(lastModal.id);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modals, closeModal]);

  // Gérer le focus trap pour l'accessibilité
  useEffect(() => {
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1];
      const modalElement = document.getElementById(`modal-${lastModal.id}`);
      
      if (modalElement) {
        // Focus sur le premier élément focusable
        const focusableElements = modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }
    }
  }, [modals]);

  // Empêcher le scroll du body quand une modale est ouverte
  useEffect(() => {
    if (modals.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modals.length]);

  if (modals.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => {
          const lastModal = modals[modals.length - 1];
          if (lastModal.closeOnBackdropClick !== false) {
            closeModal(lastModal.id);
          }
        }}
      />

      {/* Modales empilées */}
      {modals.map((modal, index) => (
        <div
          key={modal.id}
          id={`modal-${modal.id}`}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 50 + index }}
        >
          <div
            className={`
              relative bg-white rounded-xl shadow-2xl max-w-full max-h-full overflow-hidden
              transform transition-all duration-300 ease-out
              ${modal.animation === 'slideUp' ? 'animate-in slide-in-from-bottom-4' :
                modal.animation === 'fadeIn' ? 'animate-in fade-in-0' :
                modal.animation === 'scaleIn' ? 'animate-in zoom-in-95' :
                'animate-in slide-in-from-bottom-4'
              }
              ${modal.size === 'sm' ? 'max-w-md' :
                modal.size === 'md' ? 'max-w-lg' :
                modal.size === 'lg' ? 'max-w-2xl' :
                modal.size === 'xl' ? 'max-w-6xl w-full h-[90vh] flex flex-col' :
                modal.size === 'full' ? 'max-w-full h-full flex flex-col' :
                'max-w-lg'
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête de la modale */}
            {modal.title && (
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {modal.icon && <Icon name={modal.icon} className="w-5 h-5" />}
                  {modal.title}
                </h2>
                {modal.showCloseButton !== false && (
                  <button
                    onClick={() => closeModal(modal.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Contenu de la modale */}
            <div className={
              modal.size === 'xl' || modal.size === 'full' 
                ? 'p-0 flex-1 min-h-0 flex flex-col overflow-hidden' 
                : (modal.title ? 'p-4 sm:p-6' : 'p-0')
            }>
              {modal.content}
            </div>

            {/* Pied de la modale */}
            {modal.footer && (
              <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                {modal.footer}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ModalManager;
