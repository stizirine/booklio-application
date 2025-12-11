# Système d'icônes centralisé

## 📋 Vue d'ensemble

Ce système d'icônes centralise tous les SVG utilisés dans l'application, permettant une meilleure réutilisabilité, maintenance et cohérence visuelle.

## 🚀 Utilisation

### Import de base
```tsx
import { Icon } from '../assets/icons';

// Utilisation simple
<Icon name="calendar" />
```

### Avec des props personnalisées
```tsx
<Icon 
  name="user" 
  className="text-blue-600" 
  size="lg" 
  strokeWidth={1.5} 
/>
```

## 📏 Tailles disponibles

- `xs` : 12px (w-3 h-3)
- `sm` : 16px (w-4 h-4) - **Par défaut**
- `md` : 20px (w-5 h-5)
- `lg` : 24px (w-6 h-6)
- `xl` : 32px (w-8 h-8)

## 🎨 Personnalisation

### Classes CSS
```tsx
<Icon 
  name="calendar" 
  className="text-red-500 hover:text-red-700" 
/>
```

### Épaisseur du trait
```tsx
<Icon 
  name="calendar" 
  strokeWidth={1} 
/>
```

## 📚 Icônes disponibles

### Navigation & UI
- `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`
- `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`

### Calendar & Time
- `calendar`, `clock`

### User & Contact
- `user`, `user-circle`, `mail`, `phone`

### Location
- `location-marker`

### Actions
- `eye`, `share`, `edit`, `check-circle`, `x-circle`
- `plus`, `minus`, `x`, `trash`

### Status & Info
- `info`, `warning`, `exclamation`

### Document & Notes
- `document-text`, `clipboard`

### Search & Filter
- `search`, `filter`

### Settings & Configuration
- `cog`, `dots-vertical`, `dots-horizontal`

## 🔧 Ajout d'une nouvelle icône

1. Ajouter le composant SVG dans `Icon.tsx` :
```tsx
'new-icon': ({ className, strokeWidth }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={strokeWidth}>
    <path strokeLinecap="round" strokeLinejoin="round" d="..." />
  </svg>
),
```

2. Documenter l'icône dans ce README

## ✅ Avantages

- **Réutilisabilité** : Une seule définition par icône
- **Cohérence** : Taille et style uniformes
- **Maintenance** : Modifications centralisées
- **Performance** : Optimisation du bundle
- **TypeScript** : Support complet des types
- **Flexibilité** : Personnalisation facile

## 🎯 Exemples d'utilisation

### Dans un bouton
```tsx
<button className="flex items-center gap-2">
  <Icon name="plus" size="sm" />
  Ajouter
</button>
```

### Dans une carte
```tsx
<div className="flex items-center gap-2">
  <Icon name="user" className="text-gray-500" size="sm" />
  <span>John Doe</span>
</div>
```

### Avec état conditionnel
```tsx
<Icon 
  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
  className="transition-transform duration-200" 
/>
```
