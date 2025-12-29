import { Icon } from '@assets/icons';
import { Button, Input } from '@components/ui';
import VirtualizedList from '@components/VirtualizedList';
import { ClientInvoicesInline } from '@features/invoices';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { formatDateRange, splitAppointmentsByTime } from '@src/features/appointments/utils/appointments';
import { getStatusClasses } from '@src/features/appointments/utils/statusUtils';
import type { ClientAppointmentItem, ClientItem, NewClientPayload } from '@src/types';
import { AppointmentStatus } from '@src/types';
import React, { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QuickCreateClientForm from './QuickCreateClientForm';

interface ClientsPanelProps {
  clients: ClientItem[];
  loading?: boolean;
  onSearch?: (query: string) => void;
  onCreate?: (payload: NewClientPayload) => Promise<any> | void;
  onSelect?: (client: ClientItem) => void;
}

// Le tri des appointments est géré côté backend, pas besoin de re-trier ici

function getInitials(name?: string) {
  const n = (name || '').trim();
  if (!n) return '—';
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || '').join('');
}

function ClientHeader({ c, onSelect }: { c: ClientItem; onSelect?: (c: ClientItem) => void }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center justify-between p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-md group"
      onClick={() => onSelect && onSelect(c)}
    >
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        {/* Avatar moderne avec gradient - Responsive */}
        <div className="relative flex-shrink-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl sm:rounded-2xl bg-gray-700 text-white grid place-items-center text-sm sm:text-base md:text-lg font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            {getInitials(c.name)}
          </div>
          {/* Indicateur de statut - Responsive */}
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 rounded-full bg-green-500 border border-white sm:border-2 flex items-center justify-center">
            <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 md:h-2 md:w-2 rounded-full bg-white"></div>
          </div>
        </div>
        
        {/* Informations client - Responsive */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors truncate">
            {c.name}
          </h3>
          
          {/* Contact info avec icônes - Responsive */}
          <div className="space-y-0.5 sm:space-y-1">
            {c.email && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs">📧</span>
                </div>
                <span className="truncate">{c.email}</span>
              </div>
            )}
            {c.phone && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">📞</span>
                </div>
                <span className="truncate">{c.phone}</span>
              </div>
            )}
          </div>
          {/* Résumé factures client */}
          <ClientInvoicesInline invoiceSummary={c.invoiceSummary} />
        </div>
      </div>
      
      {/* Métriques et actions - Responsive */}
      <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0 ml-2">
        {/* Badge de notes - Responsive */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-semibold">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></div>
            <span className="hidden sm:inline">{t('clients.notes')}:</span>
            <Icon name="edit" className="sm:hidden" size="xs" />
            <span>{typeof c.notesCount === 'number' ? c.notesCount : 0}</span>
          </span>
        </div>
        
        {/* Dernier RDV - Responsive */}
        {c.lastAppointment && (
          <div className="text-xs text-gray-500 text-right hidden sm:block">
            <div className="font-medium text-gray-700">{t('clients.lastAppointment')}</div>
            <div>{new Date(c.lastAppointment).toLocaleDateString('fr-FR')}</div>
          </div>
        )}
        
        {/* Icône de chevron - Responsive */}
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
          <Icon name="chevron-right" className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 group-hover:text-gray-600 transition-colors" size="xs" />
        </div>
      </div>
    </div>
  );
}
const ClientHeaderMemo = React.memo(ClientHeader);

function ClientAppointmentRow({ appointment }: { appointment: ClientAppointmentItem }) {
  const { t } = useTranslation();
  
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled: return 'clock';
      case AppointmentStatus.InProgress: return 'cog';
      case AppointmentStatus.Done: return 'check-circle';
      case AppointmentStatus.Canceled: return 'x-circle';
      case AppointmentStatus.Rescheduled: return 'calendar';
      case AppointmentStatus.Created: return 'edit';
      default: return 'calendar';
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300">
      {/* Barre de statut colorée */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
        appointment.status === AppointmentStatus.Scheduled ? 'bg-yellow-400' :
        appointment.status === AppointmentStatus.InProgress ? 'bg-blue-400' :
        appointment.status === AppointmentStatus.Done ? 'bg-green-400' :
        appointment.status === AppointmentStatus.Canceled ? 'bg-red-400' :
        appointment.status === AppointmentStatus.Rescheduled ? 'bg-orange-400' :
        'bg-gray-400'
      }`}></div>
      
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Icône de statut - Responsive */}
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          appointment.status === AppointmentStatus.Scheduled ? 'bg-yellow-100 text-yellow-600' :
          appointment.status === AppointmentStatus.InProgress ? 'bg-blue-100 text-blue-600' :
          appointment.status === AppointmentStatus.Done ? 'bg-green-100 text-green-600' :
          appointment.status === AppointmentStatus.Canceled ? 'bg-red-100 text-red-600' :
          appointment.status === AppointmentStatus.Rescheduled ? 'bg-orange-100 text-orange-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          <Icon name={getStatusIcon(appointment.status)} size="xs" />
        </div>
        
        {/* Contenu principal - Responsive */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1 group-hover:text-gray-700 transition-colors">
                {appointment.title || t('clients.appointmentWithoutTitle')}
              </h4>
              <p className="text-xs text-gray-600 mb-2">{formatDateRange(appointment.startAt, appointment.endAt)}</p>
            </div>
            
            {/* Badge de statut - Responsive */}
            <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium self-start ${
              appointment.status ? getStatusClasses(appointment.status).badge : 'bg-gray-100 text-gray-700'
            }`}>
              {t(`statuses.${appointment.status}`)}
            </span>
          </div>
          
          {/* Notes - Responsive */}
          {appointment.notes && (
            <div className="mt-2 space-y-1">
              {typeof appointment.notes === 'string' ? (
                <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-gray-300">
                  <p className="text-xs text-gray-700 line-clamp-2">{appointment.notes}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {appointment.notes.reason && (
                    <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-gray-300">
                      <div className="flex items-start gap-1">
                        <span className="text-blue-600 text-xs flex-shrink-0">🎯</span>
                        <p className="text-xs text-blue-800 line-clamp-2">{appointment.notes.reason}</p>
                      </div>
                    </div>
                  )}
                  {appointment.notes.comment && (
                    <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-gray-300">
                      <div className="flex items-start gap-1">
                        <Icon name="edit" className="text-gray-600 text-xs flex-shrink-0" size="xs" />
                        <p className="text-xs text-gray-700 line-clamp-2">{appointment.notes.comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const ClientAppointmentRowMemo = React.memo(ClientAppointmentRow);

const ClientsPanel: React.FC<ClientsPanelProps> = ({ clients, loading, onSearch: _onSearch, onCreate, onSelect }) => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [showCreateForm, setShowCreateForm] = useState(false);
  // plus de state local pour le formulaire rapide (géré par le sous-composant)
  // Déclenche la recherche debouncée (n'affiche rien)
  // TEMPORAIREMENT DÉSACTIVÉ POUR DEBUG
  // useDebouncedSearch(query, onSearch);
  const { t } = useTranslation();
  const [collapsedPastByClientId, setCollapsedPastByClientId] = useLocalStorage<Record<string, boolean>>(
    'clientsPanel.pastCollapsedByClientId',
    {},
    { ttlMs: 1000 * 60 * 60 * 24 * 14 }
  );
  
  // Le filtrage est géré côté backend via onSearch, on n'affiche que les clients reçus
  // Pas de filtrage local nécessaire sauf si la recherche n'est pas déclenchée
  const filtered = useMemo(() => {
    const q = deferredQuery.trim();
    // Si pas de query ou query < 2 caractères, afficher tous les clients
    if (!q || q.length < 2) return clients;
    // Sinon, le backend a déjà filtré via onSearch, retourner les clients tels quels
    return clients;
  }, [clients, deferredQuery]);


  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
      {/* Header moderne - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm sm:text-lg">👥</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t('clients.title')}</h3>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{t('clients.description')}</p>
          </div>
        </div>
        
        {/* Barre de recherche et bouton créer - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="h-4 w-4 text-gray-400" size="sm" />
            </div>
            <Input
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-white shadow-sm"
              placeholder={t('clients.searchPlaceholder') as string}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          
          {/* Bouton créer un client - Responsive */}
          <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="gradient" size="md" leftIcon={<Icon name="plus" className="w-4 h-4" size="sm" />}>
            <span className="sm:inline">{t('clients.create')}</span>
          </Button>
        </div>
      </div>

      {/* Formulaire de création de client - Responsive */}
      {showCreateForm && (
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="plus" className="w-4 h-4 text-gray-600" size="sm" />
                {t('clients.createNew')}
              </h4>
              <Button onClick={() => setShowCreateForm(false)} variant="secondary" size="sm" className="p-1 !px-2 !py-1">
                <Icon name="x" className="w-4 h-4" size="sm" />
              </Button>
            </div>
            <QuickCreateClientForm 
              disabled={loading} 
              onCreate={async (payload) => {
                if (onCreate) {
                  await onCreate(payload);
                  setShowCreateForm(false); // Fermer le formulaire après création
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Barre d'état moderne - Responsive */}
      <div className="mb-4 sm:mb-6">
        {loading ? (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            <span>{t('common.loading')}</span>
          </div>
        ) : (
          query.trim().length >= 2 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500"></div>
              <span>{t('clients.resultsCount', { count: filtered.length })}</span>
            </div>
          )
        )}
      </div>

      {/* Contenu principal */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xl sm:text-2xl">👥</span>
          </div>
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t('clients.empty')}</h4>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">{t('clients.startAdding')}</p>
          <QuickCreateClientForm disabled={loading} onCreate={onCreate} />
        </div>
      ) : (
        <VirtualizedList
          items={filtered}
          rowHeight={176}
          overscan={10}
          className="max-h-[65vh]"
          renderRow={(c, idx) => (
            <div key={(c as any).id || (c as any)._id || c.email || c.name || idx} className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-gray-300">
              <ClientHeaderMemo c={c} onSelect={onSelect} />
              {c.appointments && c.appointments.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                      {t('calendar.appointmentsCount', { count: c.appointments.length })}
                    </h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                      <span className="hidden sm:inline">{t('clients.active')}</span>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-auto pr-1 sm:pr-2">
                    {(() => {
                      const { upcoming, past } = splitAppointmentsByTime(c.appointments);
                      const defaultCollapsed = past.length > 3;
                      const isCollapsed = collapsedPastByClientId[c.id] ?? defaultCollapsed;
                      const toggleCollapsed = () => {
                        setCollapsedPastByClientId((prev) => ({ ...prev, [c.id]: !isCollapsed }));
                      };
                      return (
                        <>
                          {upcoming.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="sticky top-0 z-30 bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 shadow-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500"></div>
                                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                                    {t('clients.upcomingAppointments')} ({upcoming.length})
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2 sm:space-y-3">
                                {upcoming.map((appointment, aIdx) => (
                                  <ClientAppointmentRowMemo key={(appointment as any)._id || (appointment as any).id || `${appointment.startAt}-${appointment.endAt}-${aIdx}`} appointment={appointment} />
                                ))}
                              </div>
                            </div>
                          )}
                          {past.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              <div className="sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500"></div>
                                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                                    {t('clients.pastAppointments')} ({past.length})
                                  </p>
                                </div>
                                <Button type="button" onClick={toggleCollapsed} variant="secondary" size="sm">
                                  <Icon name={isCollapsed ? 'chevron-down' : 'chevron-up'} className="w-3 h-3" size="xs" />
                                </Button>
                              </div>
                              {!isCollapsed && (
                                <div className="space-y-2 sm:space-y-3">
                                  {past.map((appointment, pIdx) => (
                                    <ClientAppointmentRowMemo key={(appointment as any)._id || (appointment as any).id || `${appointment.startAt}-${appointment.endAt}-${pIdx}`} appointment={appointment} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
};

export default ClientsPanel;


