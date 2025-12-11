import Icon from '@assets/icons/Icon';
import React from 'react';
import { Button, Card } from '@components/ui';
import { useTranslation } from 'react-i18next';

interface ExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  url: string;
  buttonText: string;
  onConfirm: () => void;
}

const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  url,
  buttonText,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="x" className="w-6 h-6" size="lg" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">{description}</p>
          <div className="bg-gray-100 p-3 rounded-md">
            <p className="text-sm text-gray-700 break-all">{url}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="secondary" size="sm">{t('common.cancel')}</Button>
          <Button onClick={handleConfirm} variant="primary" size="sm">{buttonText}</Button>
        </div>
      </Card>
    </div>
  );
};

export default ExternalLinkModal;

