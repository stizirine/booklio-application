# Architecture Tenant Context

## 🎯 Vue d'ensemble

L'application utilise maintenant un **contexte global** pour gérer les informations du tenant, évitant ainsi de passer le `tenant` en props à travers toute l'application.

## 🏗️ Architecture

### 1. TenantContext
```typescript
// src/contexts/TenantContext.tsx
export const TenantProvider: React.FC<{ children: ReactNode }>
export const useTenant: () => TenantContextType
export const useCapabilities: () => CapabilitiesHelpers
```

### 2. Structure des données
```typescript
interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}
```

### 3. Helpers pour les capacités
```typescript
const useCapabilities = () => ({
  hasCapability: (capability: string) => boolean,
  hasFeatureFlag: (flag: string) => boolean,
  canAccessOptics: () => boolean,
  canManagePrescriptions: () => boolean,
  canTakeMeasurements: () => boolean,
  canPrintOptics: () => boolean,
  isOptician: () => boolean,
  isGeneric: () => boolean,
});
```

## 🔄 Flux de données

### 1. Initialisation
```typescript
// App.tsx
<TenantProvider>
  <Dashboard user={user} onLogout={handleLogout} />
</TenantProvider>
```

### 2. Utilisation dans les composants
```typescript
// Dans n'importe quel composant
const { tenant, loading } = useTenant();
const { isOptician, canAccessOptics } = useCapabilities();

if (isOptician()) {
  // Afficher les fonctionnalités optiques
}
```

### 3. Synchronisation automatique
- Le contexte écoute les événements `authChanged`
- Recharge automatiquement les données du tenant
- Gère les états de loading et d'erreur

## 🚀 Avantages

### ✅ Avant (Props drilling)
```typescript
// App.tsx
<Dashboard user={user} tenant={tenant} onLogout={handleLogout} />

// Dashboard.tsx
<ClientsPage tenant={tenant} />

// ClientsPage.tsx
<ClientDetailModal tenant={tenant} />

// ClientDetailModal.tsx
<OpticsSection tenant={tenant} />
```

### ✅ Après (Contexte global)
```typescript
// App.tsx
<TenantProvider>
  <Dashboard user={user} onLogout={handleLogout} />
</TenantProvider>

// N'importe quel composant
const { isOptician } = useCapabilities();
if (isOptician()) {
  // Fonctionnalités optiques
}
```

## 📝 Utilisation

### 1. Accès aux données du tenant
```typescript
import { useTenant } from '../contexts/TenantContext';

const MyComponent = () => {
  const { tenant, loading, error } = useTenant();
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!tenant) return <div>Aucun tenant</div>;
  
  return <div>Tenant: {tenant.tenantId}</div>;
};
```

### 2. Vérification des capacités
```typescript
import { useCapabilities } from '../contexts/TenantContext';

const MyComponent = () => {
  const { isOptician, canAccessOptics, hasFeatureFlag } = useCapabilities();
  
  return (
    <div>
      {isOptician() && <div>Interface opticien</div>}
      {canAccessOptics() && <div>Fonctionnalités optiques</div>}
      {hasFeatureFlag('optics.photo_upload') && <div>Upload de photos</div>}
    </div>
  );
};
```

### 3. Rechargement manuel
```typescript
const { refreshTenant } = useTenant();

const handleRefresh = async () => {
  await refreshTenant();
};
```

## 🔧 Configuration

### 1. Provider dans App.tsx
```typescript
{authState === 'dashboard' && user && (
  <TenantProvider>
    <InvoiceConfigProvider value={{ showStatistics: true, allowCreate: true, creationMode: 'modal' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Dashboard user={user} onLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
    </InvoiceConfigProvider>
  </TenantProvider>
)}
```

### 2. Gestion des événements
```typescript
// Déclencher un rechargement
window.dispatchEvent(new Event('authChanged'));

// Le contexte écoute automatiquement
useEffect(() => {
  const handleAuthChange = () => {
    if (token) {
      refreshTenant();
    } else {
      setTenant(null);
    }
  };
  
  window.addEventListener('authChanged', handleAuthChange);
  return () => window.removeEventListener('authChanged', handleAuthChange);
}, []);
```

## 🎯 Composants mis à jour

### ✅ Supprimé le prop `tenant` de :
- `Dashboard.tsx`
- `ClientsPage.tsx`
- `ClientsPanel.tsx`
- `QuickCreateClientForm.tsx`
- `ClientDetailModal.tsx`
- `OpticsSection.tsx`

### ✅ Ajouté `useTenant()` ou `useCapabilities()` dans :
- `ClientsPage.tsx`
- `ClientsPanel.tsx`
- `QuickCreateClientForm.tsx`
- `ClientDetailModal.tsx`
- `OpticsSection.tsx`

## 🔄 Migration

### Avant
```typescript
interface MyComponentProps {
  tenant: Tenant | null;
}

import { ClientType } from './src/common/auth/types';

const MyComponent: React.FC<MyComponentProps> = ({ tenant }) => {
  if (tenant?.clientType === ClientType.Optician) {
    // Logique opticien
  }
};
```

### Après
```typescript
const MyComponent: React.FC = () => {
  const { isOptician } = useCapabilities();
  
  if (isOptician()) {
    // Logique opticien
  }
};
```

## 🚀 Résultat

- **Code plus propre** : Plus de props drilling
- **Maintenance facilitée** : Un seul endroit pour gérer le tenant
- **Performance améliorée** : Pas de re-renders inutiles
- **Type safety** : TypeScript garantit l'utilisation correcte
- **Flexibilité** : Facile d'ajouter de nouvelles capacités

L'architecture est maintenant plus maintenable et évolutive ! 🎉
