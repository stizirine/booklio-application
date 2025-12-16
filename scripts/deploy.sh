#!/usr/bin/env bash
set -euo pipefail

# Déploiement docker-compose selon l'environnement (dev/rec/prod) et le service.
# Usage :
#   ./scripts/deploy.sh [service] [env]
#   ./scripts/deploy.sh frontend dev
#   ./scripts/deploy.sh backend dev
#   ./scripts/deploy.sh all dev      # ou simplement ./scripts/deploy.sh dev
#   ./scripts/deploy.sh mongo dev
#   ./scripts/deploy.sh redis dev
#
# Services disponibles :
#   - frontend      : Déploie uniquement le frontend
#   - backend       : Déploie uniquement le backend (booklio-backend)
#   - mongo         : Déploie uniquement MongoDB
#   - redis         : Déploie uniquement Redis
#   - prometheus    : Déploie uniquement Prometheus
#   - grafana       : Déploie uniquement Grafana
#   - all           : Déploie tous les services (par défaut)
#
# Environnements :
#   - dev           : Développement (par défaut)
#   - rec           : Recette/staging
#   - prod          : Production
#
# Prérequis :
#   - docker compose disponible (v2+)
#   - fichiers .env.dev / .env.rec / .env.prod présents à la racine
#
# Le script copie automatiquement le fichier d'environnement approprié vers .env
# avant de lancer le déploiement avec docker-compose

# Parse les arguments
SERVICE_INPUT="${1:-all}"
ENV_INPUT="${2:-dev}"

# Si le premier argument est un environnement (dev/rec/prod), on déploie tout
case "${SERVICE_INPUT}" in
  dev|development|rec|recette|staging|prod|production)
    ENV_INPUT="${SERVICE_INPUT}"
    SERVICE_INPUT="all"
    ;;
esac

# Détermine l'environnement et le fichier source
case "${ENV_INPUT}" in
  dev|development)
    ENV=dev
    SOURCE_ENV_FILE=".env.dev"
    ;;
  rec|recette|staging)
    ENV=rec
    SOURCE_ENV_FILE=".env.rec"
    ;;
  prod|production)
    ENV=prod
    SOURCE_ENV_FILE=".env.prod"
    ;;
  *)
    echo "❌ Environnement invalide: ${ENV_INPUT}"
    echo "Usage: $0 [service] [env]"
    echo "   ou: $0 [env]"
    exit 1
    ;;
esac

# Fichier .env cible (toujours le même)
ENV_FILE=".env"

# Mappe le nom du service au nom dans docker-compose
case "${SERVICE_INPUT}" in
  frontend)
    COMPOSE_SERVICE="frontend"
    ;;
  backend|api)
    COMPOSE_SERVICE="booklio-backend"
    ;;
  mongo|mongodb)
    COMPOSE_SERVICE="mongo"
    ;;
  redis)
    COMPOSE_SERVICE="redis"
    ;;
  prometheus)
    COMPOSE_SERVICE="prometheus"
    ;;
  grafana)
    COMPOSE_SERVICE="grafana"
    ;;
  all|*)
    COMPOSE_SERVICE=""
    ;;
esac

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="booklio-${ENV}"

# Vérifie que le fichier source existe
if [ ! -f "${SOURCE_ENV_FILE}" ]; then
  echo "❌ Fichier d'environnement manquant: ${SOURCE_ENV_FILE}"
  echo "   Crée-le à partir de env.${ENV}.example"
  exit 1
fi

# Copie le fichier source vers .env
echo "📋 Copie ${SOURCE_ENV_FILE} → ${ENV_FILE}"
cp "${SOURCE_ENV_FILE}" "${ENV_FILE}"

if [ -n "${COMPOSE_SERVICE}" ]; then
  echo "🚀 Déploiement ${ENV}: service '${COMPOSE_SERVICE}'"
  echo "   Fichier: ${COMPOSE_FILE}, projet=${PROJECT_NAME}"
else
  echo "🚀 Déploiement ${ENV}: tous les services"
  echo "   Fichier: ${COMPOSE_FILE}, projet=${PROJECT_NAME}"
fi

# Pull optionnel (ignore les erreurs pour permettre le build local)
if [ -n "${COMPOSE_SERVICE}" ]; then
  docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" pull "${COMPOSE_SERVICE}" || true
else
  docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" pull || true
fi

# Build & up
if [ -n "${COMPOSE_SERVICE}" ]; then
  docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" up -d --build --remove-orphans "${COMPOSE_SERVICE}"
else
  docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" up -d --build --remove-orphans
fi

# Affiche l'état final
if [ -n "${COMPOSE_SERVICE}" ]; then
  echo ""
  echo "✅ Service '${COMPOSE_SERVICE}' déployé avec succès"
  docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps "${COMPOSE_SERVICE}"
else
  echo ""
  echo "✅ Tous les services déployés avec succès"
  docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps
fi

