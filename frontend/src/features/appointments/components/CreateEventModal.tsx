import { Icon } from '@assets/icons';
import { Badge, Button, Field, Input, Select, Textarea } from '@components/ui';
import { formatDateRange } from '@src/features/appointments/utils/appointments';
import type { ClientItem } from '@src/types';
import { AppointmentStatus } from '@src/types';
import { ClientAppointmentNotes } from '@src/types/clients';
import React, { useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    clientId?: string;
    title: string;
    start: string;
    end: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    customerEmail?: string;
    notes?: ClientAppointmentNotes;
    reason?: string;
  }) => void;
  clients?: ClientItem[];
  initialDate?: Date;
}

interface FormState {
  title: string;
  start: string;
  end: string;
  selectedClientId?: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  customerEmail: string;
  notes: ClientAppointmentNotes;
  reason: string;
  status: AppointmentStatus;
  search: string;
  matched: ClientItem | null;
}

enum FormActionType {
  SET_FIELD = 'SET_FIELD',
  SET_CLIENT = 'SET_CLIENT',
  CLEAR_MATCH = 'CLEAR_MATCH',
  RESET_FORM = 'RESET_FORM',
  PREFILL = 'PREFILL'
}

type FormAction = 
  | { type: FormActionType.SET_FIELD; field: keyof FormState; value: any }
  | { type: FormActionType.SET_CLIENT; client: ClientItem }
  | { type: FormActionType.CLEAR_MATCH }
  | { type: FormActionType.RESET_FORM }
  | { type: FormActionType.PREFILL; data: Partial<FormState> };

const initialState: FormState = {
  title: '',
  start: '',
  end: '',
  selectedClientId: undefined,
  firstName: '',
  lastName: '',
  address: '',
  phone: '',
  customerEmail: '',
  notes: { reason: '', comment: '' },
  reason: '',
  status: AppointmentStatus.Scheduled,
  search: '',
  matched: null,
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case FormActionType.SET_FIELD:
      return { ...state, [action.field]: action.value };
    case FormActionType.SET_CLIENT:
      const parts = (action.client.name || '').trim().split(' ');
      return {
        ...state,
        selectedClientId: action.client.id,
        firstName: parts.slice(0, -1).join(' ') || action.client.name || '',
        lastName: parts.slice(-1).join(' '),
        phone: action.client.phone || '',
        customerEmail: action.client.email || '',
        address: action.client.address || '',
        matched: action.client,
      };
    case FormActionType.CLEAR_MATCH:
      return { ...state, matched: null };
    case FormActionType.RESET_FORM:
      return initialState;
    case FormActionType.PREFILL:
      return { ...state, ...action.data };
    default:
      return state;
  }
};

// Fonction helper pour formater une date en format datetime-local
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({ open, onClose, onCreate, clients = [], initialDate }) => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(formReducer, initialState);
  const prevOpenRef = React.useRef(false);

  // Réinitialiser le formulaire quand la modal se ferme
  useEffect(() => {
    if (!open) {
      dispatch({ type: FormActionType.RESET_FORM });
      prevOpenRef.current = false;
    }
  }, [open]);

  // Initialiser les dates avec initialDate quand la modal s'ouvre
  useEffect(() => {
    if (!open) return;
    
    // Utiliser initialDate si fourni, sinon utiliser la date actuelle
    const dateToUse = initialDate ? new Date(initialDate) : new Date();
    const startDate = new Date(dateToUse);
    
    // Définir l'heure par défaut à 9h00 si pas d'heure spécifiée ou si c'est minuit
    if (startDate.getHours() === 0 && startDate.getMinutes() === 0) {
      startDate.setHours(9, 0, 0, 0);
    }
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1); // +1 heure par défaut
    
    dispatch({
      type: FormActionType.PREFILL,
      data: {
        start: formatDateTimeLocal(startDate),
        end: formatDateTimeLocal(endDate),
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDate?.getTime()]);

  // Remplace les diacritiques sans utiliser Unicode property escapes (compatibilité CRA)
  const normalized = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const found = useMemo(() => {
    const q = normalized(state.search.trim());
    if (!q || q.length < 2) return null;
    return (
      clients.find((c) =>
        normalized(c.name || '').includes(q) ||
        normalized(c.email || '').includes(q) ||
        normalized(c.phone || '').includes(q)
      ) || null
    );
  }, [clients, state.search]);

  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail || {};
      dispatch({
        type: FormActionType.PREFILL,
        data: {
          selectedClientId: d.clientId || undefined,
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          phone: d.phone || '',
          customerEmail: d.email || '',
          address: d.address || '',
        }
      });
    };
    window.addEventListener('prefillCreateEvent', handler);
    return () => window.removeEventListener('prefillCreateEvent', handler);
  }, []);

  useEffect(() => {
    if (found) {
      dispatch({ type: FormActionType.SET_CLIENT, client: found });
    } else {
      dispatch({ type: FormActionType.CLEAR_MATCH });
    }
  }, [found]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ 
      clientId: state.selectedClientId, 
      title: state.title, 
      start: state.start, 
      end: state.end, 
      firstName: state.firstName, 
      lastName: state.lastName, 
      address: state.address, 
      phone: state.phone, 
      customerEmail: state.customerEmail, 
      notes: state.notes, 
      reason: state.reason 
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 pb-20 sm:pb-6">
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] w-full max-w-lg rounded-[var(--radius-md)] shadow-card max-h-[calc(100vh-5rem)] sm:max-h-[90vh] flex flex-col">
        {/* Header fixe */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-border)] flex-shrink-0 bg-[var(--color-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-fg)]">{t('event.createTitle')}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)] rounded-[var(--radius-sm)] transition-all duration-200"
            aria-label={t('common.close')}
          >
            <Icon name="x" className="w-5 h-5" size="sm" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--color-bg)]">
          <form id="create-event-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Section recherche client */}
          <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-[var(--radius-md)] p-3 sm:p-4 border border-[var(--color-primary)]/20">
            <label className="flex text-sm font-semibold text-[var(--color-fg)] mb-2 items-center gap-2">
              <Icon name="search" className="w-4 h-4 text-[var(--color-primary)]" size="sm" />
              {t('event.searchClient')}
            </label>
            <Input
              className="w-full"
              value={state.search}
              onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'search', value: e.target.value })}
              placeholder={t('event.searchPlaceholder')}
            />
            <p className={`mt-2 text-sm font-medium flex items-center gap-2 ${state.matched ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)]'}`}>
              {state.matched ? (
                <>
                  <Icon name="check" className="w-4 h-4" size="sm" />
                  {t('event.clientFound', { name: state.matched.name })}
                </>
              ) : (
                <>
                  <Icon name="plus" className="w-4 h-4" size="sm" />
                  {t('event.newClient')}
                </>
              )}
            </p>
          </div>

          {/* Section informations de base */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-[var(--color-fg)] flex items-center gap-2">
              <Icon name="info" className="w-4 h-4 text-[var(--color-primary)]" size="sm" />
              Informations de base
            </h4>
            
            <Field label={t('event.title')} htmlFor="evt-title">
              <Input id="evt-title" value={state.title} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'title', value: e.target.value })} required />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('event.firstName')} htmlFor="evt-first">
                <Input id="evt-first" value={state.firstName} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'firstName', value: e.target.value })} />
              </Field>
              <Field label={t('event.lastName')} htmlFor="evt-last">
                <Input id="evt-last" value={state.lastName} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'lastName', value: e.target.value })} />
              </Field>
            </div>

            <Field label={t('event.address')} htmlFor="evt-address">
              <Input id="evt-address" value={state.address} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'address', value: e.target.value })} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('event.phone')} htmlFor="evt-phone">
                <Input id="evt-phone" value={state.phone} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'phone', value: e.target.value })} />
              </Field>
              <Field label={t('event.customerEmail')} htmlFor="evt-email">
                <Input id="evt-email" type="email" value={state.customerEmail} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'customerEmail', value: e.target.value })} />
              </Field>
            </div>
          </div>

          {/* Section planning */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-[var(--color-fg)] flex items-center gap-2">
              <Icon name="calendar" className="w-4 h-4 text-[var(--color-success)]" size="sm" />
              Planning
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('event.start')} htmlFor="evt-start">
                <Input
                  id="evt-start"
                  type="datetime-local"
                  value={state.start}
                  onChange={(e) => {
                    const startValue = e.target.value;
                    if (startValue) {
                      // Calculer la date de fin en ajoutant 30 minutes
                      const startDate = new Date(startValue);
                      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // +30 minutes
                      
                      // Convertir en format datetime-local
                      const formatDateTimeLocal = (date: Date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                      };
                      
                      dispatch({ 
                        type: FormActionType.SET_FIELD, 
                        field: 'start', 
                        value: startValue 
                      });
                      dispatch({ 
                        type: FormActionType.SET_FIELD, 
                        field: 'end', 
                        value: formatDateTimeLocal(endDate) 
                      });
                    } else {
                      dispatch({ type: FormActionType.SET_FIELD, field: 'start', value: startValue });
                    }
                  }} 
                  required
                />
              </Field>
              <Field label={t('event.end')} htmlFor="evt-end">
                <Input id="evt-end" type="datetime-local" value={state.end} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'end', value: e.target.value })} required />
              </Field>
            </div>
            {(state.start && state.end) && (
              <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-[var(--radius-md)] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[var(--color-success)] flex items-center gap-2">
                    <Icon name="clock" className="w-3 h-3" size="xs" />
                    {formatDateRange(state.start, state.end)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-success)] font-medium">
                    <Icon name="bolt" className="w-3 h-3" size="xs" />
                    <span>Durée: 30min (auto)</span>
                  </div>
                </div>
              </div>
            )}

            <Field label={t('dashboard.status')} htmlFor="evt-status">
              <div className="flex items-center gap-3">
                <Select id="evt-status" value={state.status} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'status', value: e.target.value as AppointmentStatus })}>
                  {Object.values(AppointmentStatus).map((s) => (
                    <option key={s} value={s}>{t(`statuses.${s}`)}</option>
                  ))}
                </Select>
                <Badge variant="info" size="sm">{t(`statuses.${state.status}`)}</Badge>
              </div>
            </Field>
          </div>

          {/* Section détails */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-[var(--color-fg)] flex items-center gap-2">
              <Icon name="edit" className="w-4 h-4 text-[var(--color-secondary)]" size="sm" />
              Détails supplémentaires
            </h4>
            
            <Field label={t('event.reason')} htmlFor="evt-reason">
              <Input id="evt-reason" value={state.notes.reason || ''} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'notes', value: { ...state.notes, reason: e.target.value } })} />
            </Field>

            <Field label={t('event.notes')} htmlFor="evt-notes">
              <Textarea id="evt-notes" rows={2} value={state.notes.comment || ''} onChange={(e) => dispatch({ type: FormActionType.SET_FIELD, field: 'notes', value: { ...state.notes, comment: e.target.value } })} />
            </Field>
          </div>

          </form>
        </div>

        {/* Footer fixe */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-[var(--color-border)] flex-shrink-0 bg-[var(--color-card)]">
          <Button type="button" onClick={onClose} variant="secondary" size="md">
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="create-event-form" variant="gradient" size="md" leftIcon={<Icon name="plus" className="w-5 h-5" size="sm" />}>
            {t('event.createCta')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;

 
