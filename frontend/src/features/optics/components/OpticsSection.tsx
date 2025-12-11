import FormFieldWrapper from '@components/FormFieldWrapper';
import { Button } from '@components/ui';
import { useFormMode } from '@hooks/useFormMode';
import { Client } from '@stores/clientStore';
import React from 'react';
import { useOpticsSection } from '../hooks/useOpticsSection';
import ContactLensForm from './ContactLensForm';
import { CorrectionFields } from './CorrectionFields';
import GlassesForm from './GlassesForm';
import { OpticsHeader } from './OpticsHeader';
import { OpticsHistory } from './OpticsHistory';

interface OpticsSectionProps {
  client?: Client | null;
}

const OpticsSection: React.FC<OpticsSectionProps> = ({ client }) => {
  const { 
    t,
    records,
    showForm,
    editingId,
    isViewing,
    form,
    handleCreateClick,
    handleEditClick,
    handleViewClick,
    handleChange,
    handleSelect,
    handleToggleTreatment,
    handleSubmit,
    setShowForm,
    resetForm,
    canAccessOptics, 
    canManagePrescriptions, 
    canTakeMeasurements,
  } = useOpticsSection(client);

  // Gestion centralisée des modes de formulaire
  const { isReadOnly, isEditing, isViewing: isViewingMode } = useFormMode({
    editingId,
    showForm,
    isViewing,
    defaultMode: 'create'
  });

  // Vérifier si l'utilisateur peut accéder aux fonctionnalités optiques
  if (!canAccessOptics()) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4 max-h-[65vh] overflow-y-auto">
      <OpticsHeader
        title={t('optics.sectionTitle')}
        onCreate={handleCreateClick}
        onMeasure={undefined}
        onPrint={undefined}
        clientName={client?.name}
        onCreateLabel={t('optics.newRecord')}
        onMeasureLabel={t('optics.measureStart')}
        onPrintLabel={t('optics.print')}
      />
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg border border-gray-200 space-y-2.5 sm:space-y-3">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
            {isEditing ? t('optics.editRecord') : isViewingMode ? t('optics.viewRecord') : t('optics.newRecord')}
          </h3>
          
          {/* Type selector */}
          <FormFieldWrapper disabled={isReadOnly}>
            <div>
              <label className="text-[10px] sm:text-xs font-semibold text-gray-600 mb-1 block">{t('optics.kind')}</label>
              <div className="inline-flex gap-1.5 sm:gap-2 bg-gray-100 rounded p-0.5 sm:p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={(((form as any).kind || 'glasses')==='glasses') ? 'primary' : 'secondary'}
                  onClick={() => handleSelect('kind' as any, 'glasses')}
                  className="text-[10px] sm:text-xs"
                >
                  {t('optics.glasses')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={(((form as any).kind)==='contact_lens') ? 'primary' : 'secondary'}
                  onClick={() => handleSelect('kind' as any, 'contact_lens')}
                  className="text-[10px] sm:text-xs"
                >
                  {t('optics.contactLens')}
                </Button>
              </div>
            </div>
          </FormFieldWrapper>

          {/* Correction fields */}
          <CorrectionFields
            form={form}
            onChange={handleChange}
            canTakeMeasurements={canTakeMeasurements()}
            isReadOnly={isReadOnly}
            t={t}
          />

          {/* Type-specific forms */}
          {((form as any).kind || 'glasses') === 'glasses' ? (
            <GlassesForm 
              form={form} 
              handleSelect={handleSelect} 
              handleToggleTreatment={handleToggleTreatment} 
              t={t as any} 
              readOnly={isReadOnly} 
            />
          ) : (
            <ContactLensForm 
              form={form} 
              handleSelect={handleSelect} 
              t={t as any} 
              readOnly={isReadOnly} 
            />
          )}
          
          {/* Action buttons */}
          <div className="flex gap-1.5 sm:gap-2 justify-end">
            {isEditing ? (
              <Button type="submit" variant="secondary" size="sm" className="text-xs sm:text-sm">
                {t('common.save')}
              </Button>
            ) : isViewingMode ? (
              <Button type="button" variant="secondary" size="sm" onClick={() => { setShowForm(false); resetForm(); }} className="text-xs sm:text-sm">
                {t('common.close')}
              </Button>
            ) : (
              <>
                <Button type="submit" variant="gradient" size="sm" className="text-xs sm:text-sm">
                  {t('common.create')}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => { setShowForm(false); resetForm(); }} className="text-xs sm:text-sm">
                  {t('common.cancel')}
                </Button>
              </>
            )}
          </div>
        </form>
      )}

      {/* History */}
      <OpticsHistory
        records={records}
        onView={handleViewClick}
        onEdit={canManagePrescriptions() ? handleEditClick : undefined}
        canManage={canManagePrescriptions()}
        t={t}
        noRecordsLabel={t('optics.noRecords')}
        historyLabel={t('optics.history')}
        viewLabel={t('common.view')}
        editLabel={t('common.edit')}
        historyLineTemplate="optics.historyLine"
      />
    </div>
  );
};

export default OpticsSection;