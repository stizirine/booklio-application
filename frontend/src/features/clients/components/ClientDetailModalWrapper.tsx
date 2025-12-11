import { useModal } from '@contexts/ModalContext';
import { Client } from '@stores/clientStore';
import React from 'react';
import ClientDetailModal from './ClientDetailModal';

interface ClientDetailModalWrapperProps {
  client: Client | null;
  onUpdated: (client: Client) => void;
}

const ClientDetailModalWrapper: React.FC<ClientDetailModalWrapperProps> = ({ 
  client, 
  onUpdated 
}) => {
  const { openModal, closeModal } = useModal();

  React.useEffect(() => {
    if (client) {
      const modalId = `client-detail-${client.id}`;
      
      // Nettoyer l'ancienne modale si elle existe
      closeModal(modalId);
      
      // Créer la nouvelle modale
      openModal({
        id: modalId,
        title: `Détails du client - ${client.name}`,
        icon: 'user-circle',
        size: 'xl',
        closeOnEscape: true,
        closeOnBackdropClick: false,
        content: (
          <ClientDetailModal
            open={true}
            client={client}
            onClose={() => closeModal(modalId)}
            onUpdated={onUpdated}
          />
        )
      });
    }
    
    // Cleanup: fermer la modale quand le composant se démonte ou que client devient null
    return () => {
      if (client) {
        closeModal(`client-detail-${client.id}`);
      }
    };
  }, [client, onUpdated, openModal, closeModal]);

  return null;
};

export default ClientDetailModalWrapper;
