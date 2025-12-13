#!/usr/bin/env bash
set -euo pipefail

# Déploiement docker-compose selon l'environnement (dev/rec/prod).
# Usage :
#   ./scripts/deploy.sh dev
#   ./scripts/deploy.sh rec   # alias: staging, recette
#   ./scripts/deploy.sh prod  # alias: production
#
# Prérequis :
#   - docker compose disponible (v2+)
#   - fichiers .env.dev / .env.rec / .env.prod présents à la racine

ENV_INPUT="${1:-dev}"

case "${ENV_INPUT}" in
  dev|development)
    ENV=dev
    ENV_FILE=".env.dev"
    ;;
  rec|recette|staging)
    ENV=rec
    ENV_FILE=".env.rec"
    ;;
  prod|production)
    ENV=prod
    ENV_FILE=".env.prod"
    ;;
  *)
    echo "Usage: $0 {dev|rec|prod}"
    exit 1
    ;;
esac

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="booklio-${ENV}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Fichier d'environnement manquant: ${ENV_FILE}"
  echo "Crée-le à partir de ${ENV_FILE}.example"
  exit 1
fi

echo "Déploiement ${ENV} avec ${COMPOSE_FILE}, env=${ENV_FILE}, projet=${PROJECT_NAME}"

# Pull optionnel (ignore les erreurs pour permettre le build local)
docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" pull || true

# Build & up
docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" up -d --build --remove-orphans

# Affiche l'état final
docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps

