#!/usr/bin/env bash
set -euo pipefail

# Démarre les services docker-compose sans rebuild
# Usage :
#   ./scripts/start.sh              # Démarre tous les services
#   ./scripts/start.sh frontend     # Démarre uniquement le frontend
#   ./scripts/start.sh backend      # Démarre uniquement le backend
#   ./scripts/start.sh --skip mongo # Démarre tout sauf MongoDB

SERVICE_INPUT="${1:-all}"
SKIP_SERVICES=""

# Parse les arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip)
      SKIP_SERVICES="$2"
      shift 2
      ;;
    *)
      if [[ -z "${SERVICE_INPUT_SET:-}" ]]; then
        SERVICE_INPUT="$1"
        SERVICE_INPUT_SET=true
      fi
      shift
      ;;
  esac
done

# Mappe le nom du service au nom dans docker-compose
case "${SERVICE_INPUT}" in
  frontend)
    COMPOSE_SERVICE="frontend"
    ;;
  backend|api)
    COMPOSE_SERVICE="backend"
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
PROJECT_NAME="booklio"
ENV_FILE=".env"

# Vérifier que .env existe
if [ ! -f "${ENV_FILE}" ]; then
  echo "❌ Fichier ${ENV_FILE} manquant"
  echo "   Exécutez d'abord: ./scripts/deploy.sh dev"
  exit 1
fi

# Fonction pour vérifier si un service doit être skippé
should_skip() {
  local service=$1
  if [ -z "${SKIP_SERVICES}" ]; then
    return 1  # Ne pas skip
  fi
  
  # Convertir la liste séparée par virgules en tableau
  IFS=',' read -ra SKIP_ARRAY <<< "${SKIP_SERVICES}"
  for skip_svc in "${SKIP_ARRAY[@]}"; do
    # Normaliser les noms de services
    case "${skip_svc}" in
      mongo|mongodb) skip_svc="mongo" ;;
      backend|api) skip_svc="backend" ;;
    esac
    
    if [ "${service}" = "${skip_svc}" ]; then
      return 0  # Skip ce service
    fi
  done
  return 1  # Ne pas skip
}

# Démarre les services
if [ -n "${COMPOSE_SERVICE}" ]; then
  # Démarrage d'un service spécifique
  if should_skip "${COMPOSE_SERVICE}"; then
    echo "⏭️  Service '${COMPOSE_SERVICE}' ignoré (--skip)"
  else
    echo "▶️  Démarrage du service '${COMPOSE_SERVICE}'..."
    docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" start "${COMPOSE_SERVICE}"
    echo "✅ Service '${COMPOSE_SERVICE}' démarré"
  fi
else
  # Démarrage de tous les services (avec possibilité de skip)
  if [ -n "${SKIP_SERVICES}" ]; then
    echo "▶️  Démarrage des services (sauf: ${SKIP_SERVICES})..."
    
    # Liste de tous les services possibles
    ALL_SERVICES=("frontend" "backend" "mongo" "redis" "prometheus" "grafana")
    
    for service in "${ALL_SERVICES[@]}"; do
      if should_skip "${service}"; then
        echo "⏭️  Service '${service}' ignoré"
      else
        # Vérifier si le conteneur existe
        if docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps -a -q "${service}" 2>/dev/null | grep -q .; then
          echo "   → Démarrage de '${service}'..."
          docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" start "${service}"
        fi
      fi
    done
    
    echo "✅ Services démarrés"
  else
    # Démarrage de tous les services sans exception
    echo "▶️  Démarrage de tous les services..."
    docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" start
    echo "✅ Tous les services démarrés"
  fi
  
  # Affiche l'état final
  echo ""
  docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps
fi

