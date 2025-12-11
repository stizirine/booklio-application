import { useCallback, useMemo, useState } from 'react';

export type ConfirmationModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'danger' | 'warning' | 'info' | 'success';
};

export const useConfirmationModal = () => {
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const showConfirmation = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type: 'danger' | 'warning' | 'info' | 'success' = 'info'
  ) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return useMemo(() => ({
    confirmationModal,
    showConfirmation,
    closeConfirmation
  }), [confirmationModal, showConfirmation, closeConfirmation]);
};
