import FormFieldWrapper from '@components/FormFieldWrapper';
import { Field, Input } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface InvoiceGeneralInfoProps {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  onInvoiceNumberChange: (value: string) => void;
  onInvoiceDateChange: (value: string) => void;
  onClientNameChange: (value: string) => void;
  isReadOnly: boolean;
  clientSuggestions?: Array<{ id: string; name: string; phone?: string }>;
  onClientSelect?: (client: { id: string; name: string }) => void;
}

const InvoiceGeneralInfo: React.FC<InvoiceGeneralInfoProps> = ({
  invoiceNumber,
  invoiceDate,
  clientName,
  onInvoiceNumberChange,
  onInvoiceDateChange,
  onClientNameChange,
  isReadOnly,
  clientSuggestions,
  onClientSelect
}) => {
  const { t } = useTranslation();
  return (
    <FormFieldWrapper disabled={isReadOnly}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
        <Field label={t('invoices.invoiceNumber', { defaultValue: 'Numéro de facture' })} htmlFor="inv-num">
          <Input id="inv-num" type="text" value={invoiceNumber} onChange={(e) => onInvoiceNumberChange(e.target.value)} placeholder={t('invoices.invoiceNumberPlaceholder', { defaultValue: '0002091' }) as string} />
        </Field>
        <Field label={t('invoices.date', { defaultValue: 'Date' })} htmlFor="inv-date">
          <Input id="inv-date" type="date" value={invoiceDate} onChange={(e) => onInvoiceDateChange(e.target.value)} />
        </Field>
        <div className="relative">
          <Field label={t('invoices.client', { defaultValue: 'Client' })} htmlFor="inv-client">
            <Input id="inv-client" type="text" value={clientName} onChange={(e) => onClientNameChange(e.target.value)} placeholder={t('invoices.clientNamePlaceholder', { defaultValue: 'Nom du client' }) as string} />
          </Field>
          {!isReadOnly && clientSuggestions && clientSuggestions.length > 0 && (
            <div className="absolute z-10 bg-white shadow rounded mt-1 w-full max-h-48 sm:max-h-60 overflow-auto">
              {clientSuggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onClientSelect && onClientSelect({ id: c.id, name: c.name })}
                  className="block w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 text-xs sm:text-sm"
                >
                  {c.name} {c.phone ? `— ${c.phone}` : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default InvoiceGeneralInfo;
