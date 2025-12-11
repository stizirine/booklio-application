import { Icon } from '@assets/icons';
import ModalPortal from '@components/ModalPortal';
import { Button, Field, Input, Textarea } from '@components/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string, reason?: string) => void;
  appointment: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    customerName?: string;
  };
  loading?: boolean;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  loading = false
}) => {
  const { t } = useTranslation();
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');

  // Configuration déclarative des sections et champs
  const sections = [
    {
      key: 'current',
      titleKey: 'appointment.currentAppointment',
      icon: { name: 'info', className: 'w-4 h-4 text-blue-600' },
      variant: 'info',
    },
    {
      key: 'new',
      titleKey: 'appointment.newSchedule',
      icon: { name: 'calendar', className: 'w-4 h-4 text-yellow-600' },
      variant: 'form',
      fields: [
        {
          type: 'date' as const,
          labelKey: 'appointment.newDate',
          value: () => newDate,
          onChange: (v: string) => setNewDate(v),
          required: true,
        },
        {
          type: 'time' as const,
          labelKey: 'appointment.newTime',
          value: () => newTime,
          onChange: (v: string) => setNewTime(v),
          required: true,
        },
      ],
    },
    {
      key: 'extra',
      titleKey: 'appointment.extraDetails',
      icon: { name: 'edit', className: 'w-4 h-4 text-purple-600' },
      variant: 'textarea',
      textarea: {
        labelKey: 'appointment.rescheduleReason',
        placeholderKey: 'appointment.rescheduleReasonPlaceholder',
        value: () => reason,
        onChange: (v: string) => setReason(v),
        rows: 3,
      },
    },
  ];

  useEffect(() => {
    if (isOpen && appointment) {
      // Pré-remplir avec la date de début et l'heure de fin du RDV
      const dateStr = appointment.start.toISOString().slice(0, 10);
      const timeStr = appointment.end.toISOString().slice(11, 16);
      setNewDate(dateStr);
      setNewTime(timeStr);
      setReason('');
    }
  }, [isOpen, appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate && newTime) {
      onConfirm(newDate, newTime, reason);
    }
  };

  const formatCurrentDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-3 sm:p-6 pb-20 sm:pb-6">
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] w-full max-w-lg rounded-[var(--radius-md)] shadow-card max-h-[calc(100vh-5rem)] sm:max-h-[90vh] flex flex-col">
        {/* Header fixe */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-border)] flex-shrink-0 bg-[var(--color-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning)]/80 flex items-center justify-center shadow-sm">
              <Icon name="calendar" className="w-5 h-5 text-white" size="sm" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-fg)]">{t('appointment.reschedule')}</h2>
              <p className="text-sm text-[var(--color-muted)]">
                {t('appointment.rescheduleDescription', {
                  title: appointment.title,
                  customer: appointment.customerName || t('common.unknown'),
                  currentDate: formatCurrentDate(appointment.start)
                })}
              </p>
            </div>
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
          <form id="reschedule-form" onSubmit={handleSubmit} className="space-y-4">
            {sections.map((section) => {
              if (section.key === 'current') {
                return (
                  <div key={section.key} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <Icon name={section.icon.name as any} className={section.icon.className} size="sm" />
                      {t(section.titleKey)}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="tag" className="w-4 h-4 text-gray-500" size="sm" />
                        <span className="font-medium">{appointment.title}</span>
                      </div>
                      {appointment.customerName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Icon name="user" className="w-4 h-4" size="sm" />
                          <span>{appointment.customerName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon name="clock" className="w-4 h-4" size="sm" />
                        <span>{formatCurrentDate(appointment.start)}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              if (section.key === 'new') {
                return (
                  <div key={section.key} className="space-y-4">
                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Icon name={section.icon.name as any} className={section.icon.className} size="sm" />
                      {t(section.titleKey)}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.fields?.map((field, idx) => (
                        <Field key={idx} label={t(field.labelKey)}>
                          <Input
                            type={field.type}
                            value={field.value()}
                            onChange={(e) => field.onChange(e.target.value)}
                            required={Boolean(field.required)}
                          />
                        </Field>
                      ))}
                    </div>
                  </div>
                );
              }
              if (section.key === 'extra') {
                return (
                  <div key={section.key} className="space-y-3">
                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Icon name={section.icon.name as any} className={section.icon.className} size="sm" />
                      {t(section.titleKey)}
                    </h4>
                    <Field label={<>{t(section.textarea?.labelKey || '')} <span className="text-gray-500 font-normal">({t('common.optional')})</span></>}>
                      <Textarea
                        value={section.textarea?.value()}
                        onChange={(e) => section.textarea?.onChange(e.target.value)}
                        placeholder={t(section.textarea?.placeholderKey || '') as string}
                        rows={section.textarea?.rows || 3}
                      />
                    </Field>
                  </div>
                );
              }
              return null;
            })}
          </form>
        </div>

        {/* Footer fixe */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-[var(--color-border)] flex-shrink-0 bg-[var(--color-card)]">
          <Button type="button" onClick={onClose} variant="secondary" size="md" disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="reschedule-form" variant="warning" size="md" disabled={loading || !newDate || !newTime} leftIcon={<Icon name="check" className="w-4 h-4" size="sm" />}>
            {loading ? `${t('common.loading')}...` : t('appointment.confirmReschedule')}
          </Button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default RescheduleModal;
