# Capabilities et Feature Flags

## 🎯 Vue d'ensemble

Le système de permissions de Booklio utilise deux concepts distincts pour gérer l'accès et la configuration des fonctionnalités :

- **Capabilities** : Autorisations d'accès aux modules
- **Feature Flags** : Configuration fine des fonctionnalités

---

## 🔐 Capabilities - Autorisation d'accès

### Rôle
Les **Capabilities** contrôlent quels endpoints/modules le tenant peut utiliser. Elles définissent les permissions de base pour accéder aux fonctionnalités.

### Types de Capabilities

```typescript
export enum Capability {
  Dashboard = 'dashboard',
  Clients = 'clients',
  Appointments = 'appointments',
  Invoices = 'invoices',
  Optics = 'optics',
}
```

### Utilisation
```typescript
// Vérifier si le tenant peut accéder à un module
if (hasCapability(tenant, Capability.Optics)) {
  // Afficher les fonctionnalités de prescriptions
}

// Utilitaires combinés
if (canAccessOptics(tenant)) {
  // Afficher la section optique complète
}
```

---

## 🎛️ Feature Flags - Configuration fine

### Rôle
Les **Feature Flags** permettent d'activer/désactiver des options spécifiques dans les modules. Elles contrôlent l'affichage et le comportement des fonctionnalités.

### Types de Feature Flags

```typescript
export enum FeatureFlag {
  OpticsPrescriptions = 'optics_prescriptions',
  OpticsMeasurements = 'optics_measurements',
  OpticsPrint = 'optics_print',
  OpticsAdvancedMeasurements = 'optics.advanced_measurements',
  OpticsAutoCalculation = 'optics.auto_calculation',
  OpticsPhotoUpload = 'optics.photo_upload',
  InvoicesAutoReminder = 'invoices.auto_reminder',
  AppointmentsSmsNotifications = 'appointments.sms_notifications',
  ClientsBulkImport = 'clients.bulk_import',
  DashboardAnalytics = 'dashboard.analytics',
  OpticsPrescriptionTemplates = 'optics.prescription_templates',
}
```

### Utilisation
```typescript
// Vérifier si une fonctionnalité spécifique est activée
if (hasFeatureFlag(tenant, FeatureFlag.OpticsPhotoUpload)) {
  // Afficher le bouton d'upload de photo
}

// Exemple d'utilisation combinée
if (canTakeMeasurements(tenant) && hasFeatureFlag(tenant, FeatureFlag.OpticsAdvancedMeasurements)) {
  // Afficher les options de mesures avancées
}
```

---

## 🔄 Différence entre Capabilities et Feature Flags

| Aspect | Capabilities | Feature Flags |
|--------|-------------|---------------|
| **Rôle** | Autorisation d'accès | Configuration fine |
| **Niveau** | Module/Fonctionnalité | Option/Comportement |
| **Exemple** | "Peut gérer les prescriptions" | "Upload de photos activé" |
| **Granularité** | Grossière | Fine |
| **Changement** | Rare (changement de plan) | Fréquent (A/B testing, rollouts) |

---

## 🏗️ Architecture

### Structure de données
```typescript
interface Tenant {
  tenantId: string;
  clientType: ClientType;
  capabilities: Capability[];        // Liste des capacités
  featureFlags: Record<FeatureFlag, boolean>; // Flags activés/désactivés
}
```

### Utilitaires disponibles

#### Vérification des capacités
```typescript
hasCapability(tenant, capability: Capability): boolean
canAccessOptics(tenant): boolean
canManagePrescriptions(tenant): boolean
canTakeMeasurements(tenant): boolean
canPrintOptics(tenant): boolean
```

#### Vérification des feature flags
```typescript
hasFeatureFlag(tenant, flag: FeatureFlag): boolean
```

#### Vérification du type de client
```typescript
isOptician(tenant): boolean
isGeneric(tenant): boolean
```

---

## 📝 Exemples d'utilisation

### 1. Affichage conditionnel d'un module
```typescript
// Seulement si l'utilisateur peut accéder aux optiques
if (canAccessOptics(tenant)) {
  return <OpticsSection tenant={tenant} />;
}
```

### 2. Fonctionnalité avancée
```typescript
// Bouton de mesures avancées seulement si activé
{hasFeatureFlag(tenant, FeatureFlag.OpticsAdvancedMeasurements) && (
  <button>Mesures avancées (prisme)</button>
)}
```

### 3. Configuration complète
```typescript
// Section complète avec toutes les vérifications
{canManagePrescriptions(tenant) && (
  <div>
    <h3>Prescriptions</h3>
    <button>Nouvelle prescription</button>
    {hasFeatureFlag(tenant, FeatureFlag.OpticsPrescriptionTemplates) && (
      <button>Modèles d'ordonnances</button>
    )}
  </div>
)}
```

---

## 🚀 Avantages

1. **Sécurité** : Les capabilities protègent l'accès aux modules
2. **Flexibilité** : Les feature flags permettent des configurations fines
3. **Évolutivité** : Facile d'ajouter de nouvelles capacités et flags
4. **A/B Testing** : Les feature flags permettent de tester de nouvelles fonctionnalités
5. **Rollout progressif** : Déploiement progressif des fonctionnalités
6. **Configuration par tenant** : Chaque tenant peut avoir sa propre configuration
