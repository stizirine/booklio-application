# Configuration du Menu Sidebar

Ce système permet de configurer dynamiquement quels éléments du menu sidebar sont affichés ou masqués.

## 🎯 Utilisation

### Configuration automatique par environnement

```typescript
import { getMenuConfig } from '../config/menuConfig';

const Dashboard = () => {
  const menuConfig = getMenuConfig(); // Configuration automatique selon NODE_ENV
  
  return (
    <DashboardSidebar
      variant="drawer"
      menuConfig={menuConfig}
      onLogout={handleLogout}
      onLinkClick={handleLinkClick}
    />
  );
};
```

### Configuration personnalisée

```typescript
import { getCustomMenuConfig } from '../config/menuConfig';

const customConfig = {
  appointments: true,
  clients: true,
  invoices: false,  // Masquer les factures
  mobileTest: false, // Masquer les tests mobile
  responsiveTest: true // Garder les tests responsive
};

const menuConfig = getCustomMenuConfig(customConfig);
```

## 📋 Configurations prédéfinies

### `defaultMenuConfig`
- **Utilisation** : Développement local
- **Éléments** : Tous affichés
- **Appointments** : ✅
- **Clients** : ✅
- **Invoices** : ✅
- **Mobile Test** : ✅
- **Responsive Test** : ✅

### `productionMenuConfig`
- **Utilisation** : Environnement de production
- **Éléments** : Fonctionnalités principales uniquement
- **Appointments** : ✅
- **Clients** : ✅
- **Invoices** : ✅
- **Mobile Test** : ❌
- **Responsive Test** : ❌

### `minimalMenuConfig`
- **Utilisation** : Interface simplifiée
- **Éléments** : Fonctionnalités essentielles
- **Appointments** : ✅
- **Clients** : ✅
- **Invoices** : ❌
- **Mobile Test** : ❌
- **Responsive Test** : ❌

### `testMenuConfig`
- **Utilisation** : Tests et développement
- **Éléments** : Tests uniquement
- **Appointments** : ❌
- **Clients** : ❌
- **Invoices** : ❌
- **Mobile Test** : ✅
- **Responsive Test** : ✅

## 🔧 Interface MenuConfig

```typescript
interface MenuConfig {
  appointments?: boolean;    // Afficher le menu Rendez-vous
  clients?: boolean;         // Afficher le menu Clients
  invoices?: boolean;        // Afficher le menu Factures
  mobileTest?: boolean;      // Afficher le menu Mobile Test
  responsiveTest?: boolean;  // Afficher le menu Responsive Test
}
```

## 🚀 Exemples d'utilisation avancés

### Configuration dynamique

```typescript
import { createDynamicMenuConfig } from './menuConfig.example';

const config = createDynamicMenuConfig({
  showInvoices: false,
  showTests: true,
  showMobileTests: true,
  showResponsiveTests: false,
});
```

### Configuration basée sur les permissions utilisateur

```typescript
const getUserMenuConfig = (userRole: string): MenuConfig => {
  switch (userRole) {
    case 'admin':
      return defaultMenuConfig;
    case 'user':
      return minimalMenuConfig;
    case 'tester':
      return testMenuConfig;
    default:
      return productionMenuConfig;
  }
};
```

### Configuration basée sur des paramètres d'URL

```typescript
const getConfigFromURL = (searchParams: URLSearchParams): MenuConfig => {
  return {
    appointments: searchParams.get('appointments') !== 'false',
    clients: searchParams.get('clients') !== 'false',
    invoices: searchParams.get('invoices') === 'true',
    mobileTest: searchParams.get('mobileTest') === 'true',
    responsiveTest: searchParams.get('responsiveTest') === 'true',
  };
};
```

## 📁 Structure des fichiers

```
src/config/
├── menuConfig.ts           # Configuration principale
├── menuConfig.example.ts   # Exemples d'utilisation
└── README.md              # Cette documentation
```

## 🔄 Mise à jour de la configuration

Pour ajouter un nouvel élément au menu :

1. **Ajouter la propriété à l'interface** :
```typescript
interface MenuConfig {
  // ... propriétés existantes
  newFeature?: boolean;
}
```

2. **Mettre à jour les configurations par défaut** :
```typescript
export const defaultMenuConfig: MenuConfig = {
  // ... propriétés existantes
  newFeature: true,
};
```

3. **Ajouter la logique conditionnelle dans DashboardSidebar** :
```tsx
{config.newFeature && (
  <Link to="/new-feature" onClick={handleLinkClick}>
    {/* Contenu du lien */}
  </Link>
)}
```

## 🎨 Avantages

- ✅ **Flexibilité** : Configuration dynamique selon l'environnement
- ✅ **Maintenabilité** : Configuration centralisée
- ✅ **Sécurité** : Masquer les fonctionnalités sensibles en production
- ✅ **Personnalisation** : Adaptation selon les besoins utilisateur
- ✅ **Performance** : Éviter le rendu d'éléments inutiles
