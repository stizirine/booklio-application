# Git Hooks et CI/CD

Ce projet utilise des hooks Git et des outils de CI/CD pour maintenir la qualité du code.

## Hooks Git

### Pre-commit Hook

Exécuté automatiquement avant chaque commit :

- **Lint-staged** : Lint et formatage des fichiers modifiés
- **Build** : Vérification que le projet se compile
- **Typecheck** : Vérification des types TypeScript

### Pre-push Hook

Exécuté automatiquement avant chaque push :

- **Tests de smoke** : Tests end-to-end des fonctionnalités critiques
  - `smoke:auth` : Test d'authentification
  - `smoke:register` : Test d'inscription
  - `smoke:appointments` : Test des rendez-vous

## Scripts Disponibles

### Validation Manuelle

```bash
# Validation complète (recommandé avant push)
npm run validate

# Validation sans tests de smoke (si pas de DB)
SKIP_SMOKE_TESTS=true npm run validate
```

### Scripts Individuels

```bash
# Linting
npm run lint          # Vérifier
npm run lint:fix      # Corriger automatiquement

# Formatage
npm run format        # Vérifier
npm run format:fix    # Corriger automatiquement

# Type checking
npm run typecheck

# Build
npm run build

# Tests de smoke
npm run smoke:auth
npm run smoke:register
npm run smoke:appointments
```

## GitHub Actions

Le workflow CI est configuré dans `.github/workflows/ci.yml` et s'exécute sur :

- Push vers `main` ou `develop`
- Pull requests vers `main` ou `develop`

**Tests effectués :**

- Node.js 18.x et 20.x
- TypeScript type checking
- ESLint
- Prettier
- Build
- Tests de smoke

## Configuration

### Husky

- **Pre-commit** : `.husky/pre-commit`
- **Pre-push** : `.husky/pre-push`

### Lint-staged

Configuration dans `package.json` :

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

## Dépannage

### Désactiver temporairement les hooks

```bash
# Pour un commit spécifique
git commit --no-verify -m "message"

# Pour un push spécifique
git push --no-verify
```

### Problèmes courants

1. **Tests de smoke échouent** : Vérifier que MongoDB est démarré
2. **Lint échoue** : Exécuter `npm run lint:fix`
3. **Format échoue** : Exécuter `npm run format:fix`
4. **Build échoue** : Vérifier les erreurs TypeScript avec `npm run typecheck`

## Variables d'Environnement

Pour les tests de smoke :

- `MONGO_URI` : URI de connexion MongoDB
- `JWT_ACCESS_SECRET` : Secret pour les tokens JWT
- `JWT_REFRESH_SECRET` : Secret pour les refresh tokens
- `PORT` : Port du serveur (défaut: 4000)
