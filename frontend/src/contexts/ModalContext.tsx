import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export interface Modal {
  id: string;
  title?: string;
  icon?: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'slideUp' | 'fadeIn' | 'scaleIn';
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  onClose?: () => void;
}

interface ModalContextType {
  modals: Modal[];
  openModal: (modal: Omit<Modal, 'id'> & { id?: string }) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<Modal>) => void;
  
  // Helpers pour les modales courantes
  openClientDetail: (client: any) => string;
  openClientCreate: () => string;
  openAppointmentCreate: (clientId?: string) => string;
  openAppointmentEdit: (appointment: any) => string;
  openInvoiceCreate: (clientId?: string) => string;
  openInvoiceEdit: (invoice: any) => string;
  openPaymentCreate: (invoiceId: string) => string;
  openConfirmation: (title: string, message: string, onConfirm: () => void) => string;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);

  const openModal = useCallback((modal: Omit<Modal, 'id'> & { id?: string }): string => {
    const id = modal.id || `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setModals(prev => {
      // Vérifier si une modale avec le même ID existe déjà
      const existingModal = prev.find(m => m.id === id);
      if (existingModal) {
        // Si elle existe, la remplacer au lieu d'ajouter une nouvelle
        return prev.map(m => m.id === id ? { ...modal, id } : m);
      }
      // Sinon, ajouter la nouvelle modale
      return [...prev, { ...modal, id }];
    });
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id);
      if (modal?.onClose) {
        modal.onClose();
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      prev.forEach(modal => {
        if (modal.onClose) {
          modal.onClose();
        }
      });
      return [];
    });
  }, []);

  const updateModal = useCallback((id: string, updates: Partial<Modal>) => {
    setModals(prev => prev.map(modal => 
      modal.id === id ? { ...modal, ...updates } : modal
    ));
  }, []);

  // Helpers pour les modales courantes
  const openClientDetail = useCallback((client: any): string => {
    return openModal({
      id: `client-detail-${client.id}`,
      title: `Détails du client - ${client.name}`,
      icon: 'user-circle',
      size: 'xl',
      content: <div>Client Detail Content</div> // TODO: Remplacer par le vrai composant
    });
  }, [openModal]);

  const openClientCreate = useCallback((): string => {
    return openModal({
      id: 'client-create',
      title: 'Créer un client',
      icon: 'user-plus',
      size: 'lg',
      content: <div>Client Create Content</div> // TODO: Remplacer par le vrai composant
    });
  }, [openModal]);

  const openAppointmentCreate = useCallback((clientId?: string): string => {
    return openModal({
      id: `appointment-create-${clientId || 'new'}`,
      title: 'Créer un rendez-vous',
      icon: 'calendar-plus',
      size: 'lg',
      content: <div>Appointment Create Content</div> // TODO: Remplacer par le vrai composant
    });
  }, [openModal]);

  const openAppointmentEdit = useCallback((appointment: any): string => {
    return openModal({
      id: `appointment-edit-${appointment.id}`,
      title: 'Modifier le rendez-vous',
      icon: 'calendar-edit',
      size: 'lg',
      content: <div>Appointment Edit Content</div> // TODO: Remplacer par le vrai composant
    });
  }, [openModal]);

  const openInvoiceCreate = useCallback((clientId?: string): string => {
    return openModal({
      id: `invoice-create-${clientId || 'new'}`,
      title: 'Créer une facture',
      icon: 'tag',
      size: 'lg',
      content: <div>Invoice Create Content</div> // TODO: Remplacer par le vrai composant
    });
  }, [openModal]);

  const openInvoiceEdit = useCallback((invoice: any): string => {
    return openModal({
      id: `invoice-edit-${invoice.id}`,
      title: 'Modifier la facture',
      icon: 'tag',
      size: 'lg',
      content: <div>Invoice Edit Content</div> // TODO: Remplacer par le vrai composant
    });
  }, [openModal]);

  const openPaymentCreate = useCallback((invoiceId: string): string => {
    return openModal({
      id: `payment-create-${invoiceId}`,
      title: 'Ajouter un paiement',
      icon: 'credit-card',
      size: 'md',
      content: <div>Payment Create Content</div> // TODO: Remplacer par le vrai composant
    });
  }, [openModal]);

  const openConfirmation = useCallback((title: string, message: string, onConfirm: () => void): string => {
    return openModal({
      id: `confirmation-${Date.now()}`,
      title,
      icon: 'exclamation-triangle',
      size: 'sm',
      content: <div>Confirmation Content</div>, // TODO: Remplacer par le vrai composant
      footer: (
        <div className="flex gap-2">
          <button
            onClick={() => closeModal(`confirmation-${Date.now()}`)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm();
              closeModal(`confirmation-${Date.now()}`);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirmer
          </button>
        </div>
      )
    });
  }, [openModal, closeModal]);

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    openClientDetail,
    openClientCreate,
    openAppointmentCreate,
    openAppointmentEdit,
    openInvoiceCreate,
    openInvoiceEdit,
    openPaymentCreate,
    openConfirmation,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
