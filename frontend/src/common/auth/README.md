# Module d'Authentification

Ce module centralise toute la logique d'authentification de l'application Booklio.

## Structure

```
src/common/auth/
├── components/              # Composants d'authentification
│   ├── LoginForm.tsx        # Formulaire de connexion
│   ├── RegisterForm.tsx     # Formulaire d'inscription
│   ├── AuthFormComponents.tsx # Composants partagés
│   └── index.ts             # Exports des composants
├── hooks/                   # Hooks personnalisés
│   ├── useAuthForm.ts       # Hook pour la gestion des formulaires
│   └── index.ts             # Exports des hooks
├── types/                   # Types TypeScript
│   └── index.ts             # Types d'authentification
├── index.ts                 # Exports principaux
└── README.md               # Documentation
```

## Composants

### LoginForm
Formulaire de connexion avec validation et gestion d'erreurs.

**Props:**
- `onLogin: (authData: AuthResponse) => void` - Callback de succès
- `onSwitchToRegister: () => void` - Callback pour basculer vers l'inscription

### RegisterForm
Formulaire d'inscription avec validation et gestion d'erreurs.

**Props:**
- `onRegister: (authData: AuthResponse) => void` - Callback de succès
- `onSwitchToLogin: () => void` - Callback pour basculer vers la connexion

### Composants Partagés

#### FormField
Champ de formulaire réutilisable avec icône et validation.

**Props:**
- `id: string` - ID du champ
- `name: string` - Nom du champ
- `type: string` - Type d'input
- `label: string` - Label du champ
- `placeholder: string` - Placeholder
- `value: string` - Valeur du champ
- `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void` - Handler de changement
- `icon: string` - Nom de l'icône
- `required?: boolean` - Champ requis
- `autoComplete?: string` - Auto-complétion

#### ErrorMessage
Affichage des messages d'erreur avec icône.

**Props:**
- `error: string` - Message d'erreur

#### SubmitButton
Bouton de soumission avec état de chargement.

**Props:**
- `loading: boolean` - État de chargement
- `loadingText: string` - Texte pendant le chargement
- `buttonText: string` - Texte du bouton
- `icon: string` - Icône du bouton
- `gradientFrom?: string` - Couleur de début du gradient
- `gradientTo?: string` - Couleur de fin du gradient
- `ringColor?: string` - Couleur du ring de focus

#### AuthToggleLink
Lien pour basculer entre login et register.

**Props:**
- `text: string` - Texte principal
- `linkText: string` - Texte du lien
- `onClick: () => void` - Handler de clic
- `linkColor?: string` - Couleur du lien

## Hooks

### useAuthForm
Hook personnalisé pour la gestion des formulaires d'authentification.

**Paramètres:**
- `endpoint: string` - Endpoint API
- `onSuccess: (authData: AuthResponse) => void` - Callback de succès

**Retour:**
- `formData` - Données du formulaire
- `setFormData` - Setter pour les données
- `loading` - État de chargement
- `error` - Message d'erreur
- `handleSubmit` - Handler de soumission
- `handleChange` - Handler de changement
- `resetForm` - Fonction de reset

## Types

### User
Interface utilisateur avec informations de base.

### AuthResponse
Réponse d'authentification contenant l'utilisateur et les tokens.

### LoginRequest
Données de connexion (email, password).

### RegisterRequest
Données d'inscription (tenantId, email, password).

### AuthTokens
Tokens d'authentification (accessToken, refreshToken).

## Utilisation

```typescript
import { LoginForm, RegisterForm, useAuthForm } from '@common/auth';

// Utilisation des composants
<LoginForm 
  onLogin={(authData) => console.log('Connexion réussie', authData)}
  onSwitchToRegister={() => setMode('register')}
/>

// Utilisation du hook
const { formData, loading, error, handleSubmit } = useAuthForm({
  endpoint: '/v1/auth/login',
  onSuccess: (authData) => {
    // Gérer la connexion réussie
  }
});
```

## Internationalisation

Tous les textes sont internationalisés avec les clés suivantes :

- `auth.login` - "Connexion"
- `auth.register` - "Inscription"
- `auth.email` - "Email"
- `auth.password` - "Mot de passe"
- `auth.tenantId` - "ID Tenant"
- `auth.loginButton` - "Se connecter"
- `auth.registerButton` - "S'inscrire"
- `auth.loginError` - "Erreur de connexion"
- `auth.registerError` - "Erreur d'inscription"
- Et bien d'autres...

## Avantages

- **Réutilisabilité** : Composants modulaires et réutilisables
- **Maintenabilité** : Code organisé et bien structuré
- **Type Safety** : Types TypeScript complets
- **Internationalisation** : Support complet de l'i18n
- **Cohérence** : Interface uniforme pour tous les formulaires
- **Performance** : Hooks optimisés et gestion d'état efficace
