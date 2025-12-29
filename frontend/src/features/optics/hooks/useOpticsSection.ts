import { useNotification } from '@contexts/NotificationContext';
import { useCapabilities } from '@contexts/TenantContext';
import { useOpticsStore } from '@features/optics/store/opticsStore';
import { presentApiErrorI18n } from '@src/helpers/errors';
import { Client } from '@stores/clientStore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OpticsRecord } from '../types';
import { convertEpToString } from '../utils';

export const useOpticsSection = (client?: Client | null) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotification();
  const optics = useOpticsStore();
  const capabilities = useCapabilities();

  const [records, setRecords] = React.useState<OpticsRecord[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isViewing, setIsViewing] = React.useState(false);
  const [selectedKind, setSelectedKind] = React.useState<'glasses' | 'contact_lens'>('glasses');
  const [form, setForm] = React.useState<Partial<OpticsRecord>>({
    sphereRight: '',
    sphereLeft: '',
    cylinderRight: '',
    cylinderLeft: '',
    axisRight: '',
    axisLeft: '',
    ep: '',
    add: '',
    // champs étendus lunettes
    lensType: 'single_vision' as any,
    lensMaterial: '' as any,
    index: '1.50' as any,
    treatments: [] as string[],
    segmentHeight: '' as any,
    vertexDistance: '' as any,
    baseCurve: '' as any,
    frameType: 'full_rim' as any,
    frameEye: '' as any,
    frameBridge: '' as any,
    frameTemple: '' as any,
    frameMaterial: '' as any,
  });

  React.useEffect(() => {
    const load = async () => {
      if (!client?.id) return;
      try {
        // Charger la config une seule fois
        await optics.ensureConfig();
        const list = await optics.fetchByClient(client.id);
        setRecords(list as any);
      } catch (err) {
        const { title, message } = presentApiErrorI18n(err, t);
        showError(title, message);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id]);

  const resetForm = () => {
    setForm({
      sphereRight: '',
      sphereLeft: '',
      cylinderRight: '',
      cylinderLeft: '',
      axisRight: '',
      axisLeft: '',
      ep: '',
      add: '',
    });
    setEditingId(null);
    setIsViewing(false);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsViewing(false);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (rec: OpticsRecord) => {
    setEditingId(rec.id);
    setIsViewing(false);
    setForm({
      sphereRight: rec.sphereRight || '',
      sphereLeft: rec.sphereLeft || '',
      cylinderRight: rec.cylinderRight || '',
      cylinderLeft: rec.cylinderLeft || '',
      axisRight: rec.axisRight || '',
      axisLeft: rec.axisLeft || '',
      ep: convertEpToString(rec.ep),
      add: rec.add || '',
      lensType: rec.lensType,
      lensMaterial: rec.lensMaterial,
      index: rec.index,
      treatments: rec.treatments || [],
      segmentHeight: rec.segmentHeight,
      vertexDistance: rec.vertexDistance,
      baseCurve: rec.baseCurve,
      frameType: rec.frameType,
      frameEye: rec.frameEye,
      frameBridge: rec.frameBridge,
      frameTemple: rec.frameTemple,
      frameMaterial: rec.frameMaterial,
    });
    setShowForm(true);
  };

  const handleViewClick = (rec: OpticsRecord) => {
    // Afficher les détails de la fiche en lecture seule
    setEditingId(null);
    setIsViewing(true);
    setForm({
      sphereRight: rec.sphereRight || '',
      sphereLeft: rec.sphereLeft || '',
      cylinderRight: rec.cylinderRight || '',
      cylinderLeft: rec.cylinderLeft || '',
      axisRight: rec.axisRight || '',
      axisLeft: rec.axisLeft || '',
      ep: convertEpToString(rec.ep),
      add: rec.add || '',
      lensType: rec.lensType,
      lensMaterial: rec.lensMaterial,
      index: rec.index,
      treatments: rec.treatments || [],
      segmentHeight: rec.segmentHeight,
      vertexDistance: rec.vertexDistance,
      baseCurve: rec.baseCurve,
      frameType: rec.frameType,
      frameEye: rec.frameEye,
      frameBridge: rec.frameBridge,
      frameTemple: rec.frameTemple,
      frameMaterial: rec.frameMaterial,
    });
    setEditingId(null); // Pas en mode édition
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof OpticsRecord; value: string };
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: keyof OpticsRecord, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleTreatment = (t: string) => {
    setForm(prev => {
      const list = new Set([...(prev.treatments as any[] || [])]);
      if (list.has(t)) list.delete(t); else list.add(t);
      return { ...prev, treatments: Array.from(list) } as any;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      (form as any).kind = selectedKind;
      if (editingId) {
        const updated = await optics.update(editingId, form as any);
        setForm(prev => ({
          ...prev,
          lensType: updated.lensType,
          lensMaterial: updated.lensMaterial,
          index: updated.index,
          treatments: updated.treatments || [],
          ep: convertEpToString(updated.ep as any) || prev.ep,
          segmentHeight: updated.segmentHeight ?? prev.segmentHeight,
          vertexDistance: updated.vertexDistance ?? prev.vertexDistance,
          baseCurve: updated.baseCurve ?? prev.baseCurve,
          frameType: updated.frameType ?? prev.frameType,
          frameEye: updated.frameEye ?? prev.frameEye,
          frameBridge: updated.frameBridge ?? prev.frameBridge,
          frameTemple: updated.frameTemple ?? prev.frameTemple,
          frameMaterial: updated.frameMaterial ?? prev.frameMaterial,
        }));
        showSuccess(t('common.success'), t('optics.updateSuccess', { defaultValue: 'Fiche mise à jour' }));
      } else {
        const created = await optics.create({ clientId: client?.id || '', ...(form as any) });
        setForm(prev => ({
          ...prev,
          lensType: created.lensType,
          lensMaterial: created.lensMaterial,
          index: created.index,
          treatments: created.treatments || [],
          ep: convertEpToString(created.ep as any) || prev.ep,
          segmentHeight: created.segmentHeight ?? prev.segmentHeight,
          vertexDistance: created.vertexDistance ?? prev.vertexDistance,
          baseCurve: created.baseCurve ?? prev.baseCurve,
          frameType: created.frameType ?? prev.frameType,
          frameEye: created.frameEye ?? prev.frameEye,
          frameBridge: created.frameBridge ?? prev.frameBridge,
          frameTemple: created.frameTemple ?? prev.frameTemple,
          frameMaterial: created.frameMaterial ?? prev.frameMaterial,
        }));
        showSuccess(t('common.success'), t('optics.createSuccess', { defaultValue: 'Fiche créée' }));
      }
      if (client?.id) {
        const list = await optics.fetchByClient(client.id);
        setRecords(list as any);
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      showError(title, message);
    }
  };

  return {
    // state
    records,
    showForm,
    editingId,
    isViewing,
    form,
    // handlers
    handleCreateClick,
    handleEditClick,
    handleViewClick,
    handleChange,
    handleSelect,
    handleToggleTreatment,
    handleSubmit,
    resetForm,
    setShowForm,
    selectedKind,
    setSelectedKind,
    // permissions & helpers
    t,
    ...capabilities,
  };
};


