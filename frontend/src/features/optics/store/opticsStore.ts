import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createOpticsRecord, deleteOpticsRecord, getOpticsConfig, getOpticsRecord, listOpticsRecords, OpticsConfig, updateOpticsRecord } from '../api/optics.api';
import { OpticsRecord } from '../types';

interface OpticsStore {
  records: OpticsRecord[];
  loading: boolean;
  error: string | null;
  config?: OpticsConfig | null;
  configLoaded: boolean;
  fetchByClient: (clientId: string) => Promise<OpticsRecord[]>;
  ensureConfig: () => Promise<void>;
  create: (payload: Omit<OpticsRecord, 'id' | 'createdAt'>) => Promise<OpticsRecord>;
  update: (id: string, payload: Partial<OpticsRecord>) => Promise<OpticsRecord>;
  fetchOne: (id: string) => Promise<OpticsRecord>;
  remove: (id: string) => Promise<void>;
}

export const useOpticsStore = create<OpticsStore>()(
  devtools((set, _get) => ({
    records: [],
    loading: false,
    error: null,
    config: null,
    configLoaded: false,

    // Normalise un enregistrement backend vers OpticsRecord plat
    // Note: définie ici pour réutilisation par create/update/fetch
    normalizeBackendRecord: undefined as unknown as (r: any) => OpticsRecord,

    ensureConfig: async () => {
      const state = _get();
      if (state.configLoaded && state.config) return;
      try {
        const cfg = await getOpticsConfig();
        set({ config: cfg, configLoaded: true });
      } catch (e: any) {
        // on n'écrase pas l'app si la config échoue, on marque juste loaded pour éviter boucles
        set({ configLoaded: true });
      }
    },

    fetchByClient: async (clientId: string) => {
      set({ loading: true, error: null });
      try {
        const data = await listOpticsRecords(clientId) as any;
        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];
        const normalize = (r: any): OpticsRecord => ({
          id: r.id || r._id || r.uuid,
          clientId: r.clientId,
          createdAt: r.createdAt || r.created_at || new Date().toISOString(),
          updatedAt: r.updatedAt || r.updated_at,
          sphereRight: r.correction?.od?.sphere?.toString?.() ?? undefined,
          sphereLeft: r.correction?.og?.sphere?.toString?.() ?? undefined,
          cylinderRight: r.correction?.od?.cylinder?.toString?.() ?? undefined,
          cylinderLeft: r.correction?.og?.cylinder?.toString?.() ?? undefined,
          axisRight: r.correction?.od?.axis?.toString?.() ?? undefined,
          axisLeft: r.correction?.og?.axis?.toString?.() ?? undefined,
          pd: r.glassesParams?.pd,
          notes: r.notes,
          lensType: r.glassesParams?.lensType,
          index: r.glassesParams?.index,
          treatments: r.glassesParams?.treatments || [],
          segmentHeight: r.glassesParams?.segmentHeight?.toString?.() ?? undefined,
          vertexDistance: r.glassesParams?.vertexDistance?.toString?.() ?? undefined,
          baseCurve: r.glassesParams?.baseCurve?.toString?.() ?? undefined,
          frameType: r.glassesParams?.frame?.type,
          frameEye: r.glassesParams?.frame?.eye?.toString?.() ?? undefined,
          frameBridge: r.glassesParams?.frame?.bridge?.toString?.() ?? undefined,
          frameTemple: r.glassesParams?.frame?.temple?.toString?.() ?? undefined,
          frameMaterial: r.glassesParams?.frame?.material,
        });
        // exposer le normalizer pour réutilisation
        (_get() as any).normalizeBackendRecord = normalize;
        const normalized: OpticsRecord[] = raw.map(normalize);
        set({ records: normalized, loading: false });
        return normalized;
      } catch (e: any) {
        set({ error: e.message || 'Failed to fetch optics records', loading: false });
        return [];
      }
    },

    create: async (payload) => {
      set({ loading: true, error: null });
      try {
        const rec = await createOpticsRecord(payload as any);
        const normalize = (_get() as any).normalizeBackendRecord || ((r: any) => r);
        const nr = normalize(rec);
        set(state => ({ records: [nr as OpticsRecord, ...state.records], loading: false }));
        return nr as OpticsRecord;
      } catch (e: any) {
        set({ error: e?.message || 'Failed to create optics record', loading: false });
        throw e;
      }
    },

    update: async (id, payload) => {
      set({ loading: true, error: null });
      try {
        const rec = await updateOpticsRecord(id, payload as any);
        const normalize = (_get() as any).normalizeBackendRecord || ((r: any) => r);
        const nr = normalize(rec);
        set(state => ({
          // Remplacer entièrement l'entrée pour éviter de conserver d'anciennes valeurs
          records: state.records.map(r => r.id === id ? (nr as OpticsRecord) : r),
          loading: false,
        }));
        return nr as OpticsRecord;
      } catch (e: any) {
        set({ error: e.message || 'Failed to update optics record', loading: false });
        throw e;
      }
    },

    fetchOne: async (id) => {
      set({ loading: true, error: null });
      try {
        const rec = await getOpticsRecord(id);
        console.log('🚀 ~ rec:', rec);  
        console.log('🚀 ~ rec as OpticsRecord:', rec as OpticsRecord); 
        set({ loading: false });
        return rec as OpticsRecord;
      } catch (e: any) {
        set({ error: e.message || 'Failed to fetch optics record', loading: false });
        throw e;
      }
    },

    remove: async (id) => {
      set({ loading: true, error: null });
      try {
        await deleteOpticsRecord(id);
        set(state => ({ records: state.records.filter(r => r.id !== id), loading: false }));
      } catch (e: any) {
        set({ error: e.message || 'Failed to delete optics record', loading: false });
        throw e;
      }
    },
  }))
);

export default useOpticsStore;

