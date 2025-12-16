# 📜 Scripts de déploiement

Ce dossier contient les scripts pour gérer le déploiement de l'application Booklio avec Docker Compose.

## 🚀 Scripts disponibles

### `deploy.sh` - Déploiement des services (avec build)

Déploie l'application selon l'environnement (dev/rec/prod) et le service choisi. **Reconstruit les images Docker à chaque fois.**

#### Utilisation

```bash
# Déployer tous les services
./scripts/deploy.sh dev
./scripts/deploy.sh rec
./scripts/deploy.sh prod

# Déployer un service spécifique
./scripts/deploy.sh frontend dev
./scripts/deploy.sh backend dev
./scripts/deploy.sh mongo dev
./scripts/deploy.sh redis dev
./scripts/deploy.sh prometheus dev
./scripts/deploy.sh grafana dev

# Avec service et environnement
./scripts/deploy.sh backend rec
./scripts/deploy.sh all prod
```

#### Fonctionnement

1. Copie le fichier `.env.{env}` vers `.env`
2. Lance `docker compose up -d --build` avec les bons paramètres
3. Affiche l'état des services déployés

#### Services disponibles

| Service | Description |
|---------|-------------|
| `frontend` | Application React (Nginx) |
| `backend` | API Node.js/Express |
| `mongo` | Base de données MongoDB |
| `redis` | Cache Redis |
| `prometheus` | Monitoring Prometheus |
| `grafana` | Dashboards Grafana |
| `all` | Tous les services (par défaut) |

### `start.sh` - Redémarrage des services (sans build)

Redémarre les services arrêtés **sans rebuild**. Plus rapide que `deploy.sh`.

#### Utilisation

```bash
# Redémarrer tous les services
./scripts/start.sh

# Redémarrer un service spécifique
./scripts/start.sh frontend
./scripts/start.sh backend

# Redémarrer tous les services SAUF certains
./scripts/start.sh --skip mongo,redis
```

💡 **Cas d'usage** : Après un `stop.sh`, utilisez `start.sh` pour redémarrer rapidement sans rebuild.

### `stop.sh` - Arrêt des services

Arrête les services déployés par `deploy.sh`.

#### Utilisation

```bash
# Arrêter tous les services
./scripts/stop.sh

# Arrêter un service spécifique
./scripts/stop.sh frontend
./scripts/stop.sh backend
./scripts/stop.sh mongo

# Arrêter tous les services ET supprimer les volumes (⚠️ perte de données)
./scripts/stop.sh --volumes

# Arrêter tous les services SAUF certains (pour garder les données)
./scripts/stop.sh --skip mongo              # Garde MongoDB actif
./scripts/stop.sh --skip mongo,redis        # Garde MongoDB et Redis actifs
./scripts/stop.sh --skip mongo --volumes    # Garde MongoDB, supprime les autres volumes
```

#### Option `--skip` (Recommandé pour le développement)

L'option `--skip` permet de garder certains services actifs, particulièrement utile pour :
- 🔒 **Préserver les données** : Garder MongoDB actif évite de perdre les données
- ⚡ **Redémarrage rapide** : Pas besoin de réinitialiser la base de données
- 💾 **Cache persistant** : Garder Redis actif préserve le cache

**Exemple typique** : Redémarrer le backend sans toucher aux données
```bash
./scripts/stop.sh --skip mongo,redis  # Arrête tout sauf DB et cache
./scripts/deploy.sh backend dev        # Redéploie uniquement le backend
```

## 🔄 Workflows typiques

### Développement quotidien (garder les données)

```bash
# 1. Premier déploiement (avec build)
./scripts/deploy.sh dev

# 2. Arrêter l'app en gardant MongoDB et Redis
./scripts/stop.sh --skip mongo,redis

# 3. Redémarrer rapidement (sans rebuild)
./scripts/start.sh

# 4. Redéployer le backend après modifications
./scripts/deploy.sh backend dev
```

### Reset complet (perte de données)

```bash
# Arrêter tout et supprimer les volumes
./scripts/stop.sh --volumes

# Redéployer from scratch
./scripts/deploy.sh dev
```

### Différence entre les scripts

| Script | Action | Build | Données préservées | Vitesse |
|--------|--------|-------|-------------------|---------|
| `deploy.sh` | Déploie/Redéploie | ✅ Oui | ✅ Oui (si pas `--volumes`) | 🐢 Lent |
| `start.sh` | Redémarre | ❌ Non | ✅ Oui | ⚡ Rapide |
| `stop.sh` | Arrête | ❌ Non | ✅ Oui (par défaut) | ⚡ Rapide |
| `stop.sh --volumes` | Arrête + Nettoie | ❌ Non | ❌ Non | ⚡ Rapide |

## 📋 Environnements

### Fichiers d'environnement

| Fichier | Description | Commité |
|---------|-------------|---------|
| `.env.dev` | Configuration développement | ❌ Non (secrets) |
| `.env.rec` | Configuration recette | ❌ Non (secrets) |
| `.env.prod` | Configuration production | ❌ Non (secrets) |
| `.env.local` | Surcharge locale (scripts) | ❌ Non (local) |
| `.env` | Fichier utilisé par Docker | ❌ Non (généré) |
| `env.dev.example` | Template pour dev | ✅ Oui |
| `env.rec.example` | Template pour rec | ✅ Oui |
| `env.prod.example` | Template pour prod | ✅ Oui |

### Configuration MongoDB

**Pour Docker (backend dans conteneur)** :
- `MONGO_HOST=mongo` (nom du service Docker)

**Pour scripts locaux (hors Docker)** :
- `MONGO_URI=mongodb://booklio:password@localhost:27017/booklio?authSource=admin`
- Utiliser `.env.local` pour surcharger localement

## 🔧 Prérequis

- Docker et Docker Compose v2+
- Fichiers `.env.dev`, `.env.rec`, `.env.prod` configurés

## 🐛 Dépannage

### "Fichier d'environnement manquant"

Créez le fichier à partir du template :
```bash
cp env.dev.example .env.dev
# Puis éditez .env.dev avec vos valeurs
```

### "docker compose down ne fonctionne pas"

Utilisez `./scripts/stop.sh` au lieu de `docker compose down` car le script utilise des paramètres spécifiques.

### Les services ne s'arrêtent pas

```bash
# Arrêt forcé
docker stop $(docker ps -aq -f name=booklio)
docker rm $(docker ps -aq -f name=booklio)
```

## 📊 Images Docker générées

| Image | Description | Tag |
|-------|-------------|-----|
| `booklio-backend` | API Backend | latest |
| `booklio-frontend` | Application Frontend | latest |

Nom du projet Docker : `booklio`

## 🔐 Sécurité

- Les fichiers `.env.*` contiennent des secrets et ne doivent **jamais** être commités
- `.env.local` est automatiquement ignoré par Git et Docker
- Utilisez des mots de passe forts en production
- Changez les secrets JWT en production

## 📚 Plus d'informations

- [Documentation Backend](../backend/README.md)
- [Documentation Frontend](../frontend/README.md)
- [Scripts Backend](../backend/scripts/README.md)

