# 🚀 Guide de Migration vers Zustand

## ✅ Ce qui est fait

### 1. Installation
- ✅ Zustand installé
- ✅ Dossier `src/stores` créé
- ✅ Path alias `@stores/*` ajouté dans `tsconfig.json`

### 2. Client Store créé (`src/stores/clientStore.ts`)

Le store contient :
- **État** : `clients`, `selectedClient`, `loading`, `error`
- **Actions** :
  - `fetchClients()` - Récupérer tous les clients
  - `fetchClient(id)` - Récupérer un client spécifique
  - `createClient(data)` - Créer un nouveau client
  - `updateClient(id, data)` - Mettre à jour un client
  - `deleteClient(id)` - Supprimer un client
  - `refreshClient(id)` - Rafraîchir un client (GET après modification)
  - `optimisticUpdateClient(id, updates)` - Mise à jour optimiste

### 3. ClientDetailModal mis à jour
- ✅ Import du store : `import { useClientStore } from '@stores/clientStore'`
- ✅ `refreshClientData()` utilise maintenant `clientStore.refreshClient()`

## 📋 Ce qu'il reste à faire

### Étape 1 : Migrer le Dashboard

Dans `src/components/Dashboard.tsx` :

```typescript
// AVANT
const { state, actions } = useDashboardState();
const appointments = useAppointments(actions);

// APRÈS
import { useClientStore } from '@stores/clientStore';

const clientStore = useClientStore();
const appointments = useAppointments(actions);

// Dans le useEffect
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    appointments.loadAppointmentsByMode(state.viewMode);
    clientStore.fetchClients(); // ✅ Remplacer appointments.loadClients()
  }
}, []);

// Dans ClientDetailModal
<ClientDetailModal
  open={state.isClientDetailOpen}
  client={clientStore.selectedClient} // ✅ Depuis le store
  onClose={() => {
    actions.setClientDetailOpen(false);
    clientStore.setSelectedClient(null); // ✅ Réinitialiser le store
  }}
  onUpdated={(updated) => {
    // ⚠️ Pas besoin ! Le store se met à jour automatiquement
  }}
/>
```

### Étape 2 : Migrer ClientsPanel

Dans `src/components/ClientsPanel.tsx` :

```typescript
// AVANT
<ClientsPanel
  clients={state.clients}
  loading={state.loading}
  onSearch={(q) => (q ? appointments.searchClients(q) : appointments.loadClients())}
  onCreate={(payload) => appointments.createClient(payload)}
  onSelect={(client) => {
    actions.setSelectedClient(client);
    actions.setClientDetailOpen(true);
  }}
/>

// APRÈS
import { useClientStore } from '@stores/clientStore';

const clientStore = useClientStore();

<ClientsPanel
  clients={clientStore.clients} // ✅ Depuis le store
  loading={clientStore.loading} // ✅ Depuis le store
  onSearch={(q) => {
    // ⚠️ Garder la recherche via appointments pour l'instant
    q ? appointments.searchClients(q) : clientStore.fetchClients()
  }}
  onCreate={(payload) => clientStore.createClient(payload)} // ✅ Store
  onSelect={(client) => {
    clientStore.setSelectedClient(client); // ✅ Store
    actions.setClientDetailOpen(true);
  }}
/>
```

### Étape 3 : Simplifier useClientManagement

Dans `src/hooks/useClientManagement.ts` :

```typescript
import { useClientStore } from '@stores/clientStore';

export const useClientManagement = (client: any | null) => {
  const clientStore = useClientStore();
  // ... reste du code

  const updateClient = useCallback(async () => {
    if (!client) return;
    try {
      setLoading(true);
      // ✅ Utiliser le store directement
      await clientStore.updateClient(client.id, state);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, state, clientStore]);
};
```

### Étape 4 : (Optionnel) Créer un AppointmentStore

Pour avoir une architecture cohérente, créer `src/stores/appointmentStore.ts` :

```typescript
interface AppointmentStore {
  appointments: Appointment[];
  loading: boolean;
  fetchAppointments: (params) => Promise<void>;
  createAppointment: (data) => Promise<void>;
  // ...
}

export const useAppointmentStore = create<AppointmentStore>()(...);
```

## 🎯 Avantages de la Migration

### Avant (État local)
```
Dashboard
  ├─ useDashboardState (état local)
  ├─ useAppointments (logique + état)
  └─ ClientDetailModal
      ├─ useClientManagement
      └─ onUpdated callback → remonte au Dashboard
```

### Après (Zustand)
```
Stores Globaux (Zustand)
  ├─ clientStore
  └─ appointmentStore

Composants
  ├─ Dashboard → lit depuis clientStore
  ├─ ClientDetailModal → met à jour clientStore
  └─ ClientsPanel → lit depuis clientStore

✅ Pas de props drilling
✅ Mise à jour automatique partout
✅ Code plus simple
```

## 📊 Utilisation dans les Composants

```typescript
// N'importe où dans l'app
import { useClientStore } from '@stores/clientStore';

function MyComponent() {
  const { clients, loading, fetchClients, updateClient } = useClientStore();
  
  // ✅ Accès direct aux clients
  // ✅ Mise à jour automatique dans tous les composants
  
  useEffect(() => {
    fetchClients();
  }, []);
  
  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
}
```

## 🔥 DevTools

Pour voir l'état Zustand en temps réel :

1. Installer l'extension Redux DevTools
2. Ouvrir les DevTools
3. Onglet "Redux"
4. Vous verrez "ClientStore" avec toutes les actions

## 🚀 Prochaines Étapes

1. Tester le `ClientDetailModal` avec le nouveau `refreshClient`
2. Migrer le `Dashboard` pour utiliser `clientStore.clients`
3. Supprimer le code d'état local redondant
4. (Optionnel) Créer un `appointmentStore`
5. (Optionnel) Créer un `invoiceStore` pour les factures

## 💡 Conseils

- Migrer progressivement (un composant à la fois)
- Garder les deux systèmes en parallèle pendant la transition
- Tester à chaque étape
- Utiliser `console.log` pour vérifier les actions du store
