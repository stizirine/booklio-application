# API Hybride - Serveur Backend + Fallback Mock

## 🚀 Utilisation

L'application utilise maintenant une approche hybride intelligente :
1. **Essaie d'abord de se connecter au serveur backend** (`http://localhost:4000`)
2. **Utilise l'API mockée en fallback** si le serveur n'est pas disponible
3. **Permet de forcer l'utilisation de l'API mockée** si nécessaire

## 🔑 Identifiants de test

### Connexion
- **Email :** `admin@booklio.com`
- **Mot de passe :** `P@ssw0rd123`

### Inscription
Vous pouvez créer un nouveau compte avec n'importe quel email et mot de passe.

## 📊 Données mockées

### Clients
- **Jean Dupont** - jean.dupont@email.com
- **Marie Martin** - marie.martin@email.com  
- **Pierre Durand** - pierre.durand@email.com

### Rendez-vous
- **Consultation dentaire** (Jean Dupont) - À venir
- **Nettoyage** (Marie Martin) - À venir
- **Extraction dentaire** (Pierre Durand) - Terminé

## 🛠️ Configuration

### Mode automatique (recommandé)
```bash
# L'application détecte automatiquement si le serveur backend est disponible
npm start
```

**Comportement :**
- ✅ **Serveur backend disponible** → Utilise l'API réelle
- ❌ **Serveur backend indisponible** → Utilise l'API mockée automatiquement

### Démarrer avec un serveur backend de test
```bash
# Démarrer uniquement le serveur backend de test
npm run start:backend

# Démarrer les deux (backend + frontend) en parallèle
npm run start:both
```

**Serveur de test :**
- **Port :** `4000`
- **Health check :** `http://localhost:4000/health`
- **Identifiants :** `admin@booklio.com` / `P@ssw0rd123`

### Configuration via variables d'environnement

#### Variables disponibles :
- `REACT_APP_USE_MOCK_API` : Force l'utilisation de l'API mockée (`true`/`false`)
- `REACT_APP_FALLBACK_TO_MOCK` : Active/désactive le fallback vers l'API mockée (`true`/`false`)
- `REACT_APP_API_BASE_URL` : URL du serveur backend (défaut: `http://localhost:4000`)

#### Configuration rapide :
```bash
# Créer le fichier de configuration
./scripts/setup-env.sh

# Démarrer avec la configuration par défaut
npm start
```

#### Forcer l'utilisation de l'API mockée
```bash
# Via variable d'environnement
REACT_APP_USE_MOCK_API=true npm start

# Via fichier .env.local
echo "REACT_APP_USE_MOCK_API=true" > .env.local
npm start
```

#### Désactiver le fallback vers l'API mockée
```bash
# Via variable d'environnement
REACT_APP_FALLBACK_TO_MOCK=false npm start

# Via fichier .env.local
echo "REACT_APP_FALLBACK_TO_MOCK=false" > .env.local
npm start
```

#### Ancienne variable (maintenue pour compatibilité)
```bash
# Ancienne méthode (toujours supportée)
REACT_APP_USE_REAL_API=true npm start
```

## 🔍 Détection du serveur

L'application vérifie la disponibilité du serveur backend via un endpoint `/health` :
- **Timeout :** 2 secondes
- **Cache :** Le résultat est mis en cache pour éviter les vérifications répétées
- **Logs :** Les tentatives de connexion sont loggées dans la console

## 📝 Fonctionnalités testables

✅ **Authentification**
- Connexion avec identifiants de test
- Inscription de nouveaux utilisateurs
- Gestion des tokens

✅ **Gestion des clients**
- Affichage de la liste des clients
- Création de nouveaux clients
- Modification des informations client
- Suppression de clients

✅ **Gestion des rendez-vous**
- Affichage des rendez-vous par client
- Création de nouveaux rendez-vous
- Modification des rendez-vous existants
- Suppression de rendez-vous
- Changement de statut des rendez-vous

✅ **Interface utilisateur**
- Modal de détail client
- Formulaire de création/modification
- Système de confirmation
- Recherche et filtres
- Design responsive

## 🔄 Persistance des données

Les données mockées sont stockées en mémoire et seront perdues lors du rechargement de la page. Pour une persistance réelle, il faudrait implémenter un serveur backend.

## 🐛 Debug

Les appels API sont loggés dans la console du navigateur avec des préfixes clairs :

- `[REAL API]` → Appels vers le serveur backend réel
- `[MOCK API]` → Appels vers l'API mockée (mode forcé)
- `[FALLBACK MOCK]` → Appels vers l'API mockée (fallback automatique)
- `[API]` → Messages de détection du serveur

## 🔄 Avantages de cette approche

✅ **Développement flexible** : Fonctionne avec ou sans serveur backend
✅ **Détection automatique** : Pas de configuration manuelle nécessaire
✅ **Fallback intelligent** : Bascule automatiquement vers l'API mockée
✅ **Performance optimisée** : Cache de la détection du serveur
✅ **Debug facilité** : Logs clairs pour identifier la source des données
