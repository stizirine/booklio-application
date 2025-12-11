import React from 'react';
import { useTranslation } from 'react-i18next';

interface InvoiceHeaderProps {
  storeName: string;
  ownerName: string;
  storeAddress: string;
  phoneNumber: string;
  patenteNumber: string;
  rcNumber: string;
  npeNumber: string;
  iceNumber: string;
  clientName?: string;
  clientAddress?: string;
  clientSSN?: string;
  clientBirthDate?: string;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  storeName,
  ownerName: _ownerName,
  storeAddress,
  phoneNumber,
  patenteNumber: _patenteNumber,
  rcNumber,
  npeNumber,
  iceNumber,
  clientName,
  clientAddress,
  clientSSN,
  clientBirthDate
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-4 sm:mb-6 border-b-2 border-gray-800 pb-2 sm:pb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Informations du magasin (gauche) */}
        <div>
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 uppercase">{storeName}</h1>
          <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-700">
            <p>{storeAddress}</p>
            <p>
              <span className="font-medium">{t('invoices.phone', { defaultValue: 'Tél.' })}:</span> {phoneNumber}
            </p>
            <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1">
              <p>
                <span className="font-medium">FINESS/AM:</span> {npeNumber || '—'}
              </p>
              <p>
                <span className="font-medium">{t('profile.npeNumber', { defaultValue: 'N°Siren / Siret' })}:</span> {rcNumber || '—'}
              </p>
              <p>
                <span className="font-medium">{t('profile.iceNumber', { defaultValue: 'TVA Intracommunautaire' })}:</span> {iceNumber || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Informations du client (droite) */}
        <div className="text-left sm:text-right">
          {clientName && (
            <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-700">
              <p className="font-semibold text-gray-900">{clientName}</p>
              {clientSSN && (
                <p className="text-[10px] sm:text-xs">
                  <span className="font-medium">{t('invoices.ssn', { defaultValue: 'N°SS' })}:</span> {clientSSN}
                </p>
              )}
              {clientBirthDate && (
                <p className="text-[10px] sm:text-xs">
                  <span className="font-medium">{t('invoices.birthDate', { defaultValue: 'Date de naissance' })}:</span> {clientBirthDate}
                </p>
              )}
              {clientAddress && (
                <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs">
                  {clientAddress.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;