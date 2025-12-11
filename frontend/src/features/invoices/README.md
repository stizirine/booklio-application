# Module Factures – Configuration UI

Ce dossier documente la configuration d'affichage et de création des factures au niveau UI.

## Objet

Permettre de paramétrer:
- Affichage des statistiques (InvoiceStatistics)
- Affichage de la liste
- Droit/possibilité de créer une facture
- Mode de création (modale vs navigation)
- Règle d'autorisation custom (ex: permissions)
- Devise par défaut

## API

```ts
export type InvoiceCreationMode = 'modal' | 'page';

export interface InvoiceUiConfig {
  showStatistics: boolean;   // Afficher/masquer le bloc statistiques
  showList: boolean;         // Afficher/masquer la liste des factures
  allowCreate: boolean;      // Afficher/masquer le bouton "Créer facture"
  creationMode: InvoiceCreationMode; // 'modal' (par défaut) ou 'page'
  canCreate?: (ctx: { clientId?: string }) => boolean; // Règle additionnelle
  currency?: string;         // Devise forcée (sinon celle des factures)
}

export const defaultInvoiceUiConfig: InvoiceUiConfig;
export function getInvoiceUiConfig(overrides?: Partial<InvoiceUiConfig>): InvoiceUiConfig;
```

## Contexte React

Pour une configuration dynamique/surchargée par page, utilisez le provider:

```tsx
import { InvoiceConfigProvider } from '@features/invoices/InvoiceConfigContext';

<InvoiceConfigProvider value={{
  showStatistics: true,
  allowCreate: true,
  creationMode: 'modal',
  currency: 'EUR',
  canCreate: ({ clientId }) => Boolean(clientId),
}}>
  {/* Votre application/section */}
</InvoiceConfigProvider>
```

Récupération dans un composant:

```tsx
import { useInvoiceUiConfig } from '@features/invoices/InvoiceConfigContext';

const ui = useInvoiceUiConfig();
if (ui.allowCreate) { /* ... */ }
```

## Intégration actuelle

- ClientDetailModal.tsx
  - InvoiceStatistics affiché si `ui.showStatistics` et données présentes
  - Bouton "Créer facture" affiché si `ui.allowCreate`
    - Respecte `ui.canCreate({ clientId })`
    - `ui.creationMode === 'modal'` → ouverture InvoiceFormModal
    - sinon navigation vers `/invoices`
  - Devise prioritaire: `ui.currency` → sinon devise de la facture

## Exemples de configurations

- Production (verrouillage des permissions):
```tsx
<InvoiceConfigProvider value={{
  allowCreate: true,
  canCreate: ({ clientId }) => hasPermission('invoice:create') && Boolean(clientId),
}}>
```

- Démo (tout activé, devise forcée):
```tsx
<InvoiceConfigProvider value={{
  showStatistics: true,
  showList: true,
  allowCreate: true,
  creationMode: 'modal',
  currency: 'EUR',
}}>
```

## Notes

- Sans provider, `defaultInvoiceUiConfig` est appliquée.
- Le backend reste source de vérité des données; cette config ne change que l'UI/comportement client.
