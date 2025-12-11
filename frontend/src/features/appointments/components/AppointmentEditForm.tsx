import { Icon } from '@assets/icons';
import { EditAppointmentState } from '@stores/appointmentStore';
import React from 'react';
import { Field, Input, Button } from '@components/ui';
import { useTranslation } from 'react-i18next';

interface AppointmentEditFormProps {
  edit: EditAppointmentState;
  loading: boolean;
  onUpdateField: (field: keyof EditAppointmentState, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AppointmentEditForm: React.FC<AppointmentEditFormProps> = ({
  edit,
  loading,
  onUpdateField,
  onSave,
  onCancel
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label={t('event.title')} htmlFor="edit-title">
          <Input id="edit-title" value={edit.title} onChange={(e) => onUpdateField('title', (e.target as HTMLInputElement).value)} />
        </Field>
        <Field label={t('event.startTime')} htmlFor="edit-start">
          <Input id="edit-start" type="datetime-local" value={edit.start} onChange={(e) => onUpdateField('start', (e.target as HTMLInputElement).value)} />
        </Field>
        <Field label={t('event.endTime')} htmlFor="edit-end">
          <Input id="edit-end" type="datetime-local" value={edit.end} onChange={(e) => onUpdateField('end', (e.target as HTMLInputElement).value)} />
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onSave} disabled={loading} variant="gradient" size="sm" leftIcon={<Icon name="check" className="w-3 h-3" size="xs" />}>{t('common.save')}</Button>
        <Button onClick={onCancel} variant="secondary" size="sm" leftIcon={<Icon name="x" className="w-3 h-3" size="xs" />}>{t('common.cancel')}</Button>
      </div>
    </div>
  );
};

export default AppointmentEditForm;
