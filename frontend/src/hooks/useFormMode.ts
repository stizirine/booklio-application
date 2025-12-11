import { useMemo } from 'react';

export type FormMode = 'create' | 'edit' | 'view';

interface UseFormModeProps {
  editingId: string | null;
  showForm: boolean;
  isViewing?: boolean; // Mode consultation explicite
  defaultMode?: FormMode;
}

/**
 * Hook pour gérer les modes de formulaire de manière centralisée
 * 
 * @param editingId - ID de l'élément en cours d'édition (null si création)
 * @param showForm - Si le formulaire est affiché
 * @param defaultMode - Mode par défaut si showForm est true mais editingId est null
 * @returns Objet avec le mode actuel et des helpers
 */
export const useFormMode = ({ 
  editingId, 
  showForm, 
  isViewing: isViewingMode = false,
  defaultMode = 'create' 
}: UseFormModeProps) => {
  const mode = useMemo((): FormMode => {
    if (!showForm) return 'create';
    if (isViewingMode) return 'view';
    if (editingId) return 'edit';
    return defaultMode;
  }, [editingId, showForm, isViewingMode, defaultMode]);

  const isReadOnly = useMemo(() => mode === 'view', [mode]);
  const isEditable = useMemo(() => mode === 'edit' || mode === 'create', [mode]);
  const isCreating = useMemo(() => mode === 'create', [mode]);
  const isEditing = useMemo(() => mode === 'edit', [mode]);
  const isViewing = useMemo(() => mode === 'view', [mode]);

  return {
    mode,
    isReadOnly,
    isEditable,
    isCreating,
    isEditing,
    isViewing,
  };
};
