# Guide de Développement - Booklio App

## 🚀 Workflow de Développement

### Prérequis
- Node.js (v16+)
- npm ou yarn
- Git

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd booklio-app

# Installer les dépendances
npm install --legacy-peer-deps

# Démarrer le serveur de développement
npm start
```

## 📝 Workflow de Commit

### 1. Développement
```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer vos modifications
# ... éditer les fichiers ...
```

### 2. Commit avec Pré-commit (Recommandé)
```bash
# Vérifier le statut
git status

# Ajouter les fichiers modifiés
git add .

# Commiter (pré-commit s'exécute automatiquement)
git commit -m "feat: description de vos changements"
```

**Ce qui se passe automatiquement :**
- ✅ **Lint** : Vérification et correction automatique des erreurs de style
- ✅ **Tests** : Exécution des tests pour vérifier que rien n'est cassé
- ✅ **Commit** : Si tout passe, le commit est validé

### 3. Push Sécurisé
```bash
# Option 1: Script automatique (recommandé)
npm run safe:push

# Option 2: Push manuel
git push origin develop
```

## 🛠️ Scripts Disponibles

### Scripts de Base
```bash
npm start          # Démarrer le serveur de développement
npm run build      # Build de production
npm test           # Lancer les tests
npm run lint       # Vérifier le code avec ESLint
```

### Scripts de Développement
```bash
npm run safe:push  # Push sécurisé (lint + tests + build + push)
```

### Scripts de CI
```bash
# Le script safe:push exécute automatiquement :
# 1. npm ci --legacy-peer-deps
# 2. npm run lint
# 3. npm test -- --watchAll=false --ci
# 4. npm run build
# 5. git push origin <branch>
```

## 🔧 Configuration Pré-commit

### Hooks Git (Husky)
- **Pré-commit** : Lance automatiquement lint + tests avant chaque commit
- **Configuration** : `.husky/pre-commit`

### Lint-staged
- **Fichiers** : `src/**/*.{ts,tsx,js,jsx}`
- **Actions** : `eslint --fix` (correction automatique)
- **Configuration** : `package.json` → `lint-staged`

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── index.ts        # Barrel exports
│   ├── AppointmentCard.tsx
│   ├── AppointmentActions.tsx
│   └── ...
├── hooks/              # Hooks personnalisés
│   ├── index.ts        # Barrel exports
│   └── ...
├── types/              # Types TypeScript
│   ├── index.ts        # Barrel exports
│   └── ...
├── services/           # Services API
├── utils/              # Utilitaires
└── i18n/               # Internationalisation
```

## 🎯 Règles de Commit

### Format des Messages
```bash
# Types de commit
feat:     nouvelle fonctionnalité
fix:      correction de bug
docs:     documentation
style:    formatage, point-virgules manquants, etc.
refactor: refactoring du code
test:     ajout de tests
chore:    maintenance, configuration

# Exemples
git commit -m "feat: ajout gestion des statuts de rendez-vous"
git commit -m "fix: correction bug mise à jour statut"
git commit -m "refactor: factorisation composant AppointmentActions"
```

## 🚨 Résolution de Problèmes

### Commit Bloqué par le Pré-commit

#### Erreur de Lint
```bash
# Le hook affiche les erreurs, corrigez-les puis :
git add .
git commit -m "votre message"
```

#### Erreur de Tests
```bash
# Corrigez les tests, puis :
git add .
git commit -m "votre message"
```

### Conflits de Dépendances
```bash
# Utiliser --legacy-peer-deps pour les installations
npm install --legacy-peer-deps
```

### Reset du Pré-commit
```bash
# Si vous voulez bypasser temporairement (non recommandé)
git commit -m "votre message" --no-verify
```

## 🔍 Vérifications Qualité

### Avant de Pousser
1. **Lint** : `npm run lint`
2. **Tests** : `npm test`
3. **Build** : `npm run build`

### Automatique
- **Pré-commit** : Lint + Tests
- **safe:push** : Lint + Tests + Build + Push

## 📚 Ressources

- [ESLint Configuration](https://eslint.org/)
- [Husky Hooks](https://typicode.github.io/husky/)
- [Lint-staged](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Contribution

1. Créer une branche feature
2. Développer avec les bonnes pratiques
3. Tester localement
4. Commiter avec le pré-commit
5. Pousser avec `safe:push`
6. Créer une Pull Request

---

**Note** : Le pré-commit garantit la qualité du code à chaque commit. Utilisez `npm run safe:push` pour un push sécurisé avec toutes les vérifications CI.
