import { Icon } from '@assets/icons';
import { ClientInvoicesInline } from '@features/invoices';
import InvoicesModal from '@invoices/components/InvoicesModal';
import { ClientAppointmentNotes, SimpleEvent } from '@src/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentDetailRenderer from './AppointmentDetailRenderer';
import AppointmentNoteItem from './AppointmentNoteItem';

interface AppointmentDetailsContentProps {
  appointment: SimpleEvent;
  detailsConfig: any[];
  notesConfig: any[];
  structuredNotes: ClientAppointmentNotes | null;
}

const AppointmentDetailsContent: React.FC<AppointmentDetailsContentProps> = ({
  appointment,
  detailsConfig,
  notesConfig,
  structuredNotes
}) => {
  const { t } = useTranslation();
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);

  return (
    <div className="px-6 sm:px-8 pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Informations principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {detailsConfig
            .filter(item => item.key === 'dateTime' || item.key === 'duration')
            .map((item) => (
              <AppointmentDetailRenderer key={item.key} item={item} />
            ))}
        </div>

        {/* Contact client */}
        {(appointment.clientEmail || appointment.clientPhone) && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">{t('appointment.contact')}</h4>
            <div className="space-y-3">
              {detailsConfig
                .filter(item => item.key === 'email' || item.key === 'phone')
                .map((item) => (
                  <div key={item.key} className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center`}>
                      <Icon name={item.icon} className={`text-sm ${item.iconColor}`} size="sm" />
                    </div>
                    <span className="text-sm text-blue-800 truncate" title={item.value}>{item.value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Résumé des factures */}
        {appointment.invoiceSummary && (
          <div 
            className={`bg-indigo-50 rounded-xl p-4 ${appointment.clientId ? 'cursor-pointer hover:bg-indigo-100 transition-colors duration-200' : ''}`}
            onClick={() => {
              if (appointment.clientId) {
                setShowInvoicesModal(true);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-indigo-900 mb-3">{t('invoices.title')}</h4>
              {appointment.clientId && (
                <Icon name="external-link" className="w-4 h-4 text-indigo-600" size="sm" />
              )}
            </div>
            <ClientInvoicesInline invoiceSummary={appointment.invoiceSummary} />
          </div>
        )}

        {/* Notes */}
        {structuredNotes && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('appointment.notes')}</h4>
            <div className="space-y-3">
              {notesConfig.map((note) => (
                <AppointmentNoteItem
                  key={note.key}
                  labelKey={note.labelKey}
                  value={note.value}
                  icon={note.icon}
                  iconColor={note.iconColor}
                  bgColor={note.bgColor}
                  borderColor={note.borderColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notes en string (fallback) */}
        {appointment.notes && typeof appointment.notes === 'string' && !structuredNotes && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('appointment.notes')}</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-800" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={String(appointment.notes)}>
                {appointment.notes}
              </p>
            </div>
          </div>
        )}

        {/* Lieu */}
        {detailsConfig
          .filter(item => item.key === 'location')
          .map((item) => (
            <AppointmentDetailRenderer key={item.key} item={item} />
          ))}
      </div>

      {/* Modal des factures */}
      {showInvoicesModal && appointment.clientId && (
        <InvoicesModal
          open={showInvoicesModal}
          onClose={() => setShowInvoicesModal(false)}
          clientId={appointment.clientId}
          clientName={appointment.customerName || 'Client'}
        />
      )}
    </div>
  );
};

export default AppointmentDetailsContent;
