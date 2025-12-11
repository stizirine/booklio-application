# Common Modules

Ce dossier contient les modules communs partagés dans toute l'application.

## Structure

```
src/common/
├── auth/                    # Module d'authentification
│   ├── components/          # Composants d'authentification
│   │   ├── LoginForm.tsx    # Formulaire de connexion
│   │   ├── RegisterForm.tsx # Formulaire d'inscription
│   │   └── index.ts         # Exports des composants
│   ├── types/               # Types TypeScript
│   │   └── index.ts         # Types d'authentification
│   └── index.ts             # Exports principaux
└── README.md               # Documentation
```

## Modules

### Auth (`src/common/auth/`)

Module d'authentification centralisé contenant :

#### Composants
- **LoginForm** : Formulaire de connexion avec validation
- **RegisterForm** : Formulaire d'inscription avec validation

#### Types
- **User** : Interface utilisateur
- **AuthResponse** : Réponse d'authentification
- **LoginRequest** : Données de connexion
- **RegisterRequest** : Données d'inscription
- **AuthTokens** : Tokens d'authentification
- **GoogleTokens** : Tokens Google OAuth
- **CalendarItem** : Élément de calendrier
- **EventItem** : Élément d'événement

#### Utilisation

```typescript
import { LoginForm, RegisterForm, User, AuthResponse } from '@common/auth';
```

## Avantages

- **Centralisation** : Toute la logique d'authentification au même endroit
- **Réutilisabilité** : Composants et types facilement réutilisables
- **Maintenabilité** : Structure claire et organisée
- **Type Safety** : Types TypeScript centralisés
- **Cohérence** : Interface uniforme pour l'authentification

## Conventions

- Chaque module a sa propre structure `components/`, `types/`, `hooks/`
- Les fichiers `index.ts` exportent les éléments publics
- Les imports utilisent l'alias `@common/*`
- La documentation est maintenue à jour
