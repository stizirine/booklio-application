# 🔄 Exemple de Migration du Dashboard vers Zustand

## Avant (Code Actuel)

```typescript
// Dashboard.tsx - AVANT
const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { state, actions } = useDashboardState(); // ❌ État local
  const appointments = useAppointments(actions);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      appointments.loadAppointmentsByMode(state.viewMode);
      appointments.loadClients(); // ❌ Via hook useAppointments
    }
  }, []);

  return (
    <>
      <ClientsPanel
        clients={state.clients} // ❌ État local
        loading={state.loading}
        onSearch={(q) => (q ? appointments.searchClients(q) : appointments.loadClients())}
        onCreate={(payload) => appointments.createClient(payload)}
        onSelect={(client) => {
          actions.setSelectedClient(client);
          actions.setClientDetailOpen(true);
        }}
      />

      <ClientDetailModal
        open={state.isClientDetailOpen}
        client={state.selectedClient} // ❌ État local
        onClose={() => actions.setClientDetailOpen(false)}
        onUpdated={(updated) => {
          // ❌ Callback manuel pour mettre à jour la liste
          const mappedClient = mapApiClientToFrontend(updated);
          const next = state.clients.map((c) => 
            c.id === mappedClient.id ? mappedClient : c
          );
          actions.setClients(next);
        }}
      />
    </>
  );
};
```

## Après (Avec Zustand)

```typescript
// Dashboard.tsx - APRÈS
import { useClientStore } from '@stores/clientStore';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { state, actions } = useDashboardState(); // Pour appointments uniquement
  const clientStore = useClientStore(); // ✅ Store global Zustand
  const appointments = useAppointments(actions);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      appointments.loadAppointmentsByMode(state.viewMode);
      clientStore.fetchClients(); // ✅ Directement via le store
    }
  }, []);

  return (
    <>
      <ClientsPanel
        clients={clientStore.clients} // ✅ Depuis le store
        loading={clientStore.loading} // ✅ Depuis le store
        onSearch={(q) => {
          if (q) {
            appointments.searchClients(q); // Garder pour l'instant
          } else {
            clientStore.fetchClients(); // ✅ Store
          }
        }}
        onCreate={async (payload) => {
          await clientStore.createClient(payload); // ✅ Store
          actions.setIsCreateOpen(false);
        }}
        onSelect={(client) => {
          clientStore.setSelectedClient(client); // ✅ Store
          actions.setClientDetailOpen(true);
        }}
      />

      <ClientDetailModal
        open={state.isClientDetailOpen}
        client={clientStore.selectedClient} // ✅ Depuis le store
        onClose={() => {
          actions.setClientDetailOpen(false);
          clientStore.setSelectedClient(null); // ✅ Réinitialiser
        }}
        onUpdated={() => {
          // ✅ Plus besoin ! Le store se met à jour automatiquement
          // Le `refreshClient()` est déjà appelé dans ClientDetailModal
        }}
      />
    </>
  );
};
```

## 🎯 Différences Clés

| Avant | Après |
|-------|-------|
| `state.clients` | `clientStore.clients` |
| `state.loading` | `clientStore.loading` |
| `appointments.loadClients()` | `clientStore.fetchClients()` |
| `appointments.createClient()` | `clientStore.createClient()` |
| `actions.setClients()` | Automatique ✅ |
| Callback `onUpdated` complexe | Plus besoin ✅ |

## 🚀 Avantages Immédiats

### 1. Synchronisation Automatique
```typescript
// Dans ClientDetailModal
await clientStore.refreshClient(client.id);

// ✅ Le Dashboard se met à jour automatiquement !
// ✅ La liste des clients se met à jour automatiquement !
// ✅ Plus besoin de callbacks
```

### 2. Code Plus Simple
```typescript
// AVANT : 10 lignes de code
onUpdated={(updated) => {
  const mappedClient = mapApiClientToFrontend(updated);
  const next = state.clients.map((c) => 
    c.id === mappedClient.id ? mappedClient : c
  );
  actions.setClients(next);
}}

// APRÈS : 0 ligne ! 🎉
// Le store gère tout automatiquement
```

### 3. Accès Partout
```typescript
// N'importe quel composant peut accéder aux clients
import { useClientStore } from '@stores/clientStore';

function AnyComponent() {
  const { clients, loading } = useClientStore();
  // ✅ Accès direct, pas besoin de props drilling
}
```

## 📊 Flux de Données

### Avant (Props Drilling)
```
Dashboard (state)
  ↓ props
ClientsPanel (clients, loading)
  ↓ callback
Dashboard (actions.setClients)
  ↓ props
ClientDetailModal (client)
  ↓ callback onUpdated
Dashboard (met à jour state)
```

### Après (Zustand Store)
```
Store Global (clientStore)
  ↕️
Dashboard (lit clients)
  ↕️
ClientsPanel (lit clients)
  ↕️
ClientDetailModal (met à jour clients)
  ↕️
Store Global (tous se mettent à jour automatiquement)
```

## 🧪 Test de la Migration

1. **Créer un client**
   ```typescript
   await clientStore.createClient({ firstName: 'Test', lastName: 'User' });
   // ✅ Apparaît immédiatement dans ClientsPanel
   ```

2. **Modifier un client**
   ```typescript
   await clientStore.updateClient(clientId, { firstName: 'Updated' });
   // ✅ Se met à jour partout automatiquement
   ```

3. **Créer une facture**
   ```typescript
   // Dans ClientDetailModal
   await invoicesHook.create(invoiceData);
   await clientStore.refreshClient(client.id);
   // ✅ invoiceSummary mis à jour dans ClientsPanel
   ```

## 💡 Conseils de Migration

1. **Migrer par étapes**
   - ✅ Étape 1 : `ClientDetailModal` (déjà fait)
   - ⏳ Étape 2 : `Dashboard` (suivre cet exemple)
   - ⏳ Étape 3 : `ClientsPanel`
   - ⏳ Étape 4 : Supprimer l'ancien code

2. **Garder la compatibilité**
   - Garder `onUpdated` pour l'instant (vide)
   - Tester que tout fonctionne
   - Supprimer ensuite

3. **Utiliser les DevTools**
   - Redux DevTools fonctionne avec Zustand
   - Voir toutes les actions en temps réel
   - Debugger facilement

## 🎯 Résultat Final

```typescript
// ✨ Code final simplifié
const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { state, actions } = useDashboardState();
  const clientStore = useClientStore(); // ✅ Une seule ligne
  const appointments = useAppointments(actions);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      appointments.loadAppointmentsByMode(state.viewMode);
      clientStore.fetchClients(); // ✅ Remplace tout le code client
    }
  }, []);

  // ... reste du code avec clientStore.clients, clientStore.loading, etc.
};
```

**🎉 Moins de code, plus de fonctionnalités, meilleure architecture !**
