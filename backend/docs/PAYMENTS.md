# Système de Paiements Multiples

## Vue d'ensemble

Le système de paiements multiples permet de gérer les factures avec des paiements échelonnés tout en conservant un historique complet de chaque transaction.

## Fonctionnalités

### 🔄 Automatismes

- **Calcul automatique** : Le montant `advanceAmount` est automatiquement calculé à partir de la somme des paiements
- **Mise à jour du statut** : Le statut de la facture (`draft`, `partial`, `paid`) est mis à jour automatiquement
- **Historique complet** : Chaque paiement est horodaté avec ses métadonnées

### 📊 Structure d'un paiement

```typescript
{
  amount: number;        // Montant du paiement (requis)
  method?: string;       // Méthode: 'cash', 'card', 'transfer', 'check', etc.
  reference?: string;    // Numéro de chèque, référence de virement, etc.
  paidAt: Date;         // Date du paiement (auto si non fourni)
  notes?: string;       // Notes supplémentaires
  _id: string;          // ID unique du paiement (auto-généré)
  createdAt: Date;      // Date de création dans le système
  updatedAt: Date;      // Date de dernière modification
}
```

## Endpoints API

### 1. Ajouter un paiement

```http
POST /v1/invoices/:id/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 300,
  "method": "cash",
  "reference": "CHQ-12345",
  "paidAt": "2025-09-30T10:00:00.000Z",
  "notes": "Premier acompte"
}
```

**Réponse:**

```json
{
  "invoice": {
    "_id": "...",
    "totalAmount": 1000,
    "advanceAmount": 300,
    "creditAmount": 0,
    "status": "partial",
    "remainingAmount": 700,
    "payments": [
      {
        "_id": "...",
        "amount": 300,
        "method": "cash",
        "reference": "CHQ-12345",
        "paidAt": "2025-09-30T10:00:00.000Z",
        "notes": "Premier acompte",
        "createdAt": "2025-09-30T10:05:00.000Z",
        "updatedAt": "2025-09-30T10:05:00.000Z"
      }
    ],
    ...
  },
  "invoiceSummary": {
    "totalAmount": 1000,
    "dueAmount": 700,
    "invoiceCount": 1,
    "lastInvoiceAt": "2025-09-30T10:00:00.000Z"
  }
}
```

**Validations:**

- Le montant du paiement doit être > 0
- Le paiement ne peut pas dépasser le montant restant dû
- La date est optionnelle (par défaut: maintenant)

### 2. Supprimer un paiement

```http
DELETE /v1/invoices/:id/payments/:paymentId
Authorization: Bearer {token}
```

**Réponse:**

```json
{
  "invoice": {
    "_id": "...",
    "advanceAmount": 300,
    "status": "partial",
    "remainingAmount": 700,
    "payments": [
      // Paiements restants
    ],
    ...
  },
  "invoiceSummary": {
    "totalAmount": 1000,
    "dueAmount": 700,
    "invoiceCount": 1,
    "lastInvoiceAt": "2025-09-30T10:00:00.000Z"
  }
}
```

**Use case:** Correction d'une erreur de saisie

### 3. Récupérer l'historique

L'historique des paiements est automatiquement inclus dans toutes les réponses GET:

```http
GET /v1/invoices/:id
Authorization: Bearer {token}
```

```http
GET /v1/invoices?clientId=...
Authorization: Bearer {token}
```

## Exemples d'utilisation

### Scénario 1: Paiement en 3 fois

```typescript
// Facture de 1500€
const invoice = await createInvoice({ totalAmount: 1500 });

// 1er paiement: 500€ à la création
await addPayment(invoice._id, {
  amount: 500,
  method: 'card',
  notes: '1/3',
});
// Status: partial, remainingAmount: 1000€

// 2ème paiement: 500€ après 1 mois
await addPayment(invoice._id, {
  amount: 500,
  method: 'card',
  notes: '2/3',
  paidAt: '2025-10-30T10:00:00.000Z',
});
// Status: partial, remainingAmount: 500€

// 3ème paiement: 500€ après 2 mois
await addPayment(invoice._id, {
  amount: 500,
  method: 'card',
  notes: '3/3',
  paidAt: '2025-11-30T10:00:00.000Z',
});
// Status: paid, remainingAmount: 0€
```

### Scénario 2: Méthodes mixtes

```typescript
// Facture de 800€
const invoice = await createInvoice({ totalAmount: 800 });

// Acompte en espèces
await addPayment(invoice._id, {
  amount: 200,
  method: 'cash',
});

// Chèque
await addPayment(invoice._id, {
  amount: 300,
  method: 'check',
  reference: 'CHQ-2025-001',
});

// Virement bancaire
await addPayment(invoice._id, {
  amount: 300,
  method: 'transfer',
  reference: 'VIR-XYZ-123',
});
// Status: paid
```

### Scénario 3: Correction d'erreur

```typescript
// Erreur de saisie
const { invoice } = await addPayment(invoiceId, {
  amount: 500, // Erreur: c'était 50€ !
  method: 'cash',
});

// Récupérer l'ID du paiement erroné
const paymentId = invoice.payments[invoice.payments.length - 1]._id;

// Supprimer le paiement erroné
await deletePayment(invoiceId, paymentId);

// Ajouter le bon montant
await addPayment(invoiceId, {
  amount: 50,
  method: 'cash',
});
```

## Intégration Frontend

### État recommandé

```typescript
interface InvoiceState {
  invoice: Invoice;
  payments: PaymentEntry[];
  summary: {
    totalAmount: number;
    advanceAmount: number;
    creditAmount: number;
    remainingAmount: number;
  };
}
```

### Après mutation

Après chaque ajout ou suppression de paiement, le backend retourne :

1. La facture mise à jour avec tous les paiements
2. Le `invoiceSummary` recalculé pour le client

Le frontend peut donc mettre à jour directement son état local sans refaire de requête GET.

```typescript
// Ajout d'un paiement
const response = await addPayment(invoiceId, paymentData);

// Mise à jour locale
setInvoice(response.invoice);
setClientSummary(response.invoiceSummary);
```

## Migration des données existantes

Les factures existantes avec `advanceAmount` fixe continuent de fonctionner normalement. Pour migrer vers le système de paiements:

```typescript
// Option 1: Créer un paiement unique pour l'avance existante
if (invoice.advanceAmount > 0 && !invoice.payments?.length) {
  await addPayment(invoice._id, {
    amount: invoice.advanceAmount,
    method: 'unknown',
    notes: 'Paiement historique (avant système de paiements multiples)',
  });
}

// Option 2: Laisser advanceAmount tel quel
// Le système reste rétrocompatible
```

## Tests

Exécuter le script de test complet:

```bash
npm run test:payments
```

Ce script teste:

- ✅ Création d'une facture
- ✅ Ajout de 3 paiements successifs
- ✅ Calcul automatique du statut (draft → partial → paid)
- ✅ Récupération de l'historique complet
- ✅ Mise à jour du résumé client
- ✅ Suppression d'un paiement
- ✅ Recalcul après suppression

## Bonnes pratiques

### ✅ À faire

- Toujours spécifier la méthode de paiement pour la traçabilité
- Ajouter une référence pour les chèques/virements
- Utiliser des notes descriptives pour les paiements complexes
- Vérifier `remainingAmount` avant d'ajouter un paiement côté frontend

### ❌ À éviter

- Ne jamais modifier `advanceAmount` manuellement (calculé automatiquement)
- Ne pas dépasser le montant restant dû
- Éviter de supprimer des paiements sauf en cas d'erreur de saisie

## Méthodes de paiement recommandées

```typescript
const paymentMethods = {
  cash: 'Espèces',
  card: 'Carte bancaire',
  transfer: 'Virement',
  check: 'Chèque',
  direct_debit: 'Prélèvement automatique',
  paypal: 'PayPal',
  stripe: 'Stripe',
  other: 'Autre',
};
```

## Sécurité

- ✅ Authentification requise pour tous les endpoints
- ✅ Validation côté serveur (montants, limites)
- ✅ Vérification de l'appartenance (tenantId)
- ✅ Timestamps automatiques pour l'audit

## Support

Pour toute question ou problème:

1. Consulter les tests: `npm run test:payments`
2. Vérifier les logs de validation
3. Examiner le résumé de la facture via `GET /v1/invoices/:id`
