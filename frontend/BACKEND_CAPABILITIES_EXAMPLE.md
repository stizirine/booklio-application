# Exemple d'implémentation Backend - Capabilities et Feature Flags

## 🎯 Configuration des tenants

### Exemple de configuration pour un opticien
```json
{
  "user": {
    "id": "68ca6b15203bb6ac8918c52c",
    "email": "opticien@booklio.com",
    "tenantId": "opticien-premium",
    "roles": ["admin"]
  },
  "tenant": {
    "tenantId": "opticien-premium",
    "clientType": "optician",
    "capabilities": [
      "dashboard",
      "clients", 
      "appointments",
      "invoices",
      "optics_prescriptions",
      "optics_measurements",
      "optics_print"
    ],
    "featureFlags": {
      "optics.advanced_measurements": true,
      "optics.auto_calculation": true,
      "optics.photo_upload": true,
      "optics.prescription_templates": true,
      "invoices.auto_reminder": true,
      "appointments.sms_notifications": false,
      "dashboard.analytics": true
    }
  }
}
```

### Exemple de configuration pour un client générique
```json
{
  "user": {
    "id": "68ca6b15203bb6ac8918c52c",
    "email": "client@booklio.com",
    "tenantId": "client-basic",
    "roles": ["user"]
  },
  "tenant": {
    "tenantId": "client-basic",
    "clientType": "generic",
    "capabilities": [
      "dashboard",
      "clients",
      "appointments", 
      "invoices"
    ],
    "featureFlags": {
      "invoices.auto_reminder": true,
      "appointments.sms_notifications": true,
      "dashboard.analytics": false
    }
  }
}
```

---

## 🔧 Implémentation Backend

### 1. Middleware de vérification des capabilities
```javascript
// middleware/capabilities.js
const checkCapability = (requiredCapability) => {
  return (req, res, next) => {
    const tenant = req.tenant; // Injecté par le middleware tenant
    
    if (!tenant) {
      return res.status(500).json({ error: 'Tenant not found' });
    }
    
    if (!tenant.capabilities.includes(requiredCapability)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredCapability,
        available: tenant.capabilities
      });
    }
    
    next();
  };
};

module.exports = { checkCapability };
```

### 2. Middleware de vérification des feature flags
```javascript
// middleware/featureFlags.js
const checkFeatureFlag = (requiredFlag) => {
  return (req, res, next) => {
    const tenant = req.tenant;
    
    if (!tenant) {
      return res.status(500).json({ error: 'Tenant not found' });
    }
    
    if (!tenant.featureFlags[requiredFlag]) {
      return res.status(403).json({ 
        error: 'Feature not enabled',
        required: requiredFlag,
        available: Object.keys(tenant.featureFlags).filter(flag => tenant.featureFlags[flag])
      });
    }
    
    next();
  };
};

module.exports = { checkFeatureFlag };
```

### 3. Routes protégées par capabilities
```javascript
// routes/optics.js
const express = require('express');
const { checkCapability } = require('../middleware/capabilities');
const { checkFeatureFlag } = require('../middleware/featureFlags');

const router = express.Router();

// Route protégée par capability
router.get('/prescriptions', 
  checkCapability('optics_prescriptions'), 
  (req, res) => {
    // Logique pour lister les prescriptions
    res.json({ prescriptions: [] });
  }
);

// Route avec feature flag
router.post('/prescriptions/upload-photo',
  checkCapability('optics_prescriptions'),
  checkFeatureFlag('optics.photo_upload'),
  (req, res) => {
    // Logique pour upload de photo d'ordonnance
    res.json({ message: 'Photo uploaded successfully' });
  }
);

// Route avec mesures avancées
router.post('/measurements/advanced',
  checkCapability('optics_measurements'),
  checkFeatureFlag('optics.advanced_measurements'),
  (req, res) => {
    // Logique pour mesures avancées (prisme, etc.)
    res.json({ message: 'Advanced measurements saved' });
  }
);

module.exports = router;
```

### 4. Configuration des tenants
```javascript
// config/tenants.js
const TENANT_CONFIGS = {
  'opticien-premium': {
    tenantId: 'opticien-premium',
    clientType: 'optician',
    capabilities: [
      'dashboard',
      'clients',
      'appointments',
      'invoices',
      'optics_prescriptions',
      'optics_measurements',
      'optics_print'
    ],
    featureFlags: {
      'optics.advanced_measurements': true,
      'optics.auto_calculation': true,
      'optics.photo_upload': true,
      'optics.prescription_templates': true,
      'invoices.auto_reminder': true,
      'appointments.sms_notifications': false,
      'dashboard.analytics': true
    }
  },
  'client-basic': {
    tenantId: 'client-basic',
    clientType: 'generic',
    capabilities: [
      'dashboard',
      'clients',
      'appointments',
      'invoices'
    ],
    featureFlags: {
      'invoices.auto_reminder': true,
      'appointments.sms_notifications': true,
      'dashboard.analytics': false
    }
  }
};

const getTenantConfig = (tenantId) => {
  return TENANT_CONFIGS[tenantId] || TENANT_CONFIGS['client-basic'];
};

module.exports = { getTenantConfig, TENANT_CONFIGS };
```

---

## 🚀 Avantages de cette approche

1. **Sécurité renforcée** : Chaque endpoint est protégé par les capabilities appropriées
2. **Configuration flexible** : Les feature flags permettent d'activer/désactiver des fonctionnalités sans redéploiement
3. **Évolutivité** : Facile d'ajouter de nouvelles capabilities et feature flags
4. **A/B Testing** : Possibilité de tester de nouvelles fonctionnalités sur certains tenants
5. **Rollout progressif** : Déploiement progressif des fonctionnalités
6. **Monitoring** : Possibilité de tracker l'utilisation des capabilities et feature flags

---

## 📊 Monitoring et Analytics

### Logs des capabilities
```javascript
// middleware/logging.js
const logCapabilityUsage = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    console.log(`[CAPABILITY] ${req.method} ${req.path} - Tenant: ${req.tenant?.tenantId} - Capabilities: ${req.tenant?.capabilities.join(',')}`);
    originalSend.call(this, data);
  };
  
  next();
};
```

### Métriques des feature flags
```javascript
// middleware/metrics.js
const trackFeatureFlagUsage = (flag) => {
  return (req, res, next) => {
    // Envoyer des métriques à votre système de monitoring
    console.log(`[FEATURE_FLAG] ${flag} used by tenant: ${req.tenant?.tenantId}`);
    next();
  };
};
```

Cette architecture permet une gestion fine et sécurisée des permissions tout en gardant la flexibilité nécessaire pour l'évolution de l'application.
