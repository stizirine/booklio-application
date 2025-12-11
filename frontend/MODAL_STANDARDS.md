# Standards pour les Modales

## Structure de base

Toutes les modales doivent utiliser cette structure pour un centrage correct :

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  {/* Overlay */}
  <div 
    className="fixed inset-0 bg-black/50 transition-opacity"
    onClick={onClose}
  />
  
  {/* Modal Content */}
  <div className="bg-white w-full max-w-[SIZE] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
    {/* Contenu de la modal */}
  </div>
</div>
```

## Classes CSS importantes

- **Container principal** : `fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`
- **Overlay** : `fixed inset-0 bg-black/50 transition-opacity`
- **Contenu modal** : `bg-white w-full max-w-[SIZE] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`

## Tailles recommandées

- **Petite modal** : `max-w-md` (448px)
- **Modal moyenne** : `max-w-lg` (512px) 
- **Modal large** : `max-w-2xl` (672px)
- **Modal très large** : `max-w-4xl` (896px)

## Z-index

- **Modales normales** : `z-50`
- **Modales de confirmation** : `z-60`
- **Modales de paiement** : `z-70`

## Composant ModalWrapper

Utilisez le composant `ModalWrapper` pour standardiser le centrage :

```tsx
import ModalWrapper from '@components/ModalWrapper';

<ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-md">
  <div className="p-6">
    {/* Contenu de la modal */}
  </div>
</ModalWrapper>
```

## ❌ À éviter

```tsx
// MAUVAIS - Ne centre pas correctement
<div className="flex items-end justify-center min-h-screen">
```

## ✅ Correct

```tsx
// BON - Centre correctement
<div className="flex items-center justify-center min-h-screen">
```

