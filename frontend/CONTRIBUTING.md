# Guide de Contribution - Booklio App

## Workflow de Développement

### Branches
- `master` : Branche de production (déploiement automatique)
- `develop` : Branche de développement principale
- `feature/*` : Branches de fonctionnalités

### Créer une Nouvelle Fonctionnalité

1. **Basculer sur develop**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Créer une branche de fonctionnalité**
   ```bash
   # Option 1: Script automatique
   ./scripts/create-feature.sh nom-de-la-fonctionnalite
   
   # Option 2: Manuel
   git checkout -b feature/nom-de-la-fonctionnalite
   ```

3. **Développer et committer**
   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalité"
   git push -u origin feature/nom-de-la-fonctionnalite
   ```

4. **Créer une Pull Request**
   ```bash
   gh pr create --base develop --title "[FEATURE] nom-de-la-fonctionnalite"
   ```

### Convention de Commits
- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage, point-virgules manquants, etc.
- `refactor:` : Refactoring du code
- `test:` : Ajout de tests
- `chore:` : Maintenance, dépendances, etc.

### Processus de Review
1. Créer une PR vers `develop`
2. Attendre la validation des tests CI
3. Demander une review
4. Une fois approuvée, merger vers `develop`
5. Pour la production, merger `develop` vers `master`

### Déploiement
- `develop` : Tests et développement
- `master` : Déploiement automatique sur GitHub Pages
