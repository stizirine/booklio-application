import { Icon } from '@assets/icons';
import { ClientAppointmentNotes } from '@src/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentCardDetailsProps {
  appointment: {
    reason?: string;
    notes?: any;
    location?: string;
  };
}

const AppointmentCardDetails: React.FC<AppointmentCardDetailsProps> = ({ appointment }) => {
  const { t } = useTranslation();

  // Type guard pour vérifier si les notes sont structurées
  const isStructuredNotes = (notes: any): notes is ClientAppointmentNotes => {
    return notes && typeof notes === 'object' && ('reason' in notes || 'comment' in notes);
  };

  const renderNotes = () => {
    if (!appointment.notes) return null;

    if (isStructuredNotes(appointment.notes)) {
      // Affichage des notes structurées
      return (
        <div className="space-y-2 sm:space-y-3">
          {(appointment.notes as ClientAppointmentNotes).reason && (
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <Icon name="check-circle" className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" size="xs" />
                <div>
                  <p className="text-xs font-medium text-blue-800 uppercase tracking-wide">{t('appointment.reasonLabel')}</p>
                <p
                  className="text-xs sm:text-sm text-blue-900 mt-1 whitespace-pre-wrap break-words"
                  title={(appointment.notes as ClientAppointmentNotes).reason}
                >
                  {(appointment.notes as ClientAppointmentNotes).reason}
                </p>
                </div>
              </div>
            </div>
          )}
          {(appointment.notes as ClientAppointmentNotes).comment && (
            <div className="p-2 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <Icon name="edit" className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mt-0.5 flex-shrink-0" size="xs" />
                <div>
                  <p className="text-xs font-medium text-gray-800 uppercase tracking-wide">{t('appointment.commentLabel')}</p>
                <p
                  className="text-xs sm:text-sm text-gray-900 mt-1 whitespace-pre-wrap break-words"
                  title={(appointment.notes as ClientAppointmentNotes).comment}
                >
                  {(appointment.notes as ClientAppointmentNotes).comment}
                </p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // Affichage des notes en string (fallback)
      return (
        <div className="space-y-2 sm:space-y-3">
          {String(appointment.notes)
            .split('\n')
            .filter(line => {
              const trimmedLine = line.trim();
              // Exclure les informations client
              const isClient = trimmedLine.startsWith('Client:');
              const isPhone = trimmedLine.startsWith('Téléphone:') || trimmedLine.startsWith('Phone:');
              const isEmail = trimmedLine.startsWith('Email:');
              const isAddress = trimmedLine.startsWith('Adresse:') || trimmedLine.startsWith('Address:');
              
              // Garder seulement les lignes non vides et qui ne sont pas des infos client
              return trimmedLine && !isClient && !isPhone && !isEmail && !isAddress;
            })
            .map((line, idx) => {
              const trimmedLine = line.trim();
              // Détecter si c'est un motif ou un commentaire
              const isReason = trimmedLine.startsWith('Motif:') || trimmedLine.startsWith('Reason:');
              const isComment = trimmedLine.startsWith('Notes:') || trimmedLine.startsWith('Commentaires:');
              
              return (
                <div key={idx} className={`p-2 sm:p-3 rounded-lg border-l-4 ${
                  isReason ? 'bg-blue-50 border-blue-400' : 
                  isComment ? 'bg-gray-50 border-gray-400' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-start gap-1.5 sm:gap-2">
                  <Icon 
                    name={isReason ? 'check-circle' : isComment ? 'edit' : 'info'} 
                    className={`w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${
                      isReason ? 'text-blue-600' : 
                      isComment ? 'text-gray-600' :
                      'text-gray-500'
                    }`} 
                    size="xs" 
                  />
                    <div className="flex-1">
                      <p className={`text-xs font-medium uppercase tracking-wide ${
                        isReason ? 'text-blue-800' : 
                        isComment ? 'text-gray-800' :
                        'text-gray-700'
                      }`}>
                        {isReason ? 'Motif' : isComment ? 'Commentaire' : 'Note'}
                      </p>
                      <p className={`text-xs sm:text-sm mt-1 whitespace-pre-wrap break-words ${
                        isReason ? 'text-blue-900' : 
                        isComment ? 'text-gray-900' :
                        'text-gray-800'
                      }`} title={trimmedLine.replace(/^(Motif:|Reason:|Notes:|Commentaires:)\s*/, '')}>
                        {trimmedLine.replace(/^(Motif:|Reason:|Notes:|Commentaires:)\s*/, '')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      );
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
        {appointment.reason && (
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Icon name="check-circle" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" size="sm" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">{t('appointment.reason')}</h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{appointment.reason}</p>
              </div>
            </div>
          </div>
        )}
        
        {appointment.notes && (
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon name="edit" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" size="sm" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">{t('appointment.notes')}</h4>
                {renderNotes()}
              </div>
            </div>
          </div>
        )}

        {appointment.location && (
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon name="location-marker" className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" size="sm" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">{t('appointment.location')}</h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{appointment.location}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCardDetails;
