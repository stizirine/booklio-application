#!/usr/bin/env bash
set -euo pipefail

# Arrête les services docker-compose déployés par deploy.sh
# Usage :
#   ./scripts/stop.sh                           # Arrête tous les services
#   ./scripts/stop.sh frontend                  # Arrête uniquement le frontend
#   ./scripts/stop.sh backend                   # Arrête uniquement le backend
#   ./scripts/stop.sh --volumes                 # Arrête et supprime les volumes
#   ./scripts/stop.sh --skip mongo              # Arrête tout sauf MongoDB
#   ./scripts/stop.sh --skip mongo,redis        # Arrête tout sauf MongoDB et Redis
#   ./scripts/stop.sh frontend --skip mongo     # Arrête frontend, skip n'a pas d'effet ici

SERVICE_INPUT="${1:-all}"
REMOVE_VOLUMES=false
SKIP_SERVICES=""

# Parse les arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --volumes)
      REMOVE_VOLUMES=true
      shift
      ;;
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
  echo "⚠️  Fichier ${ENV_FILE} non trouvé"
  echo "   Les services seront arrêtés sans variables d'environnement"
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

# Arrête les services
if [ -n "${COMPOSE_SERVICE}" ]; then
  # Arrêt d'un service spécifique
  if should_skip "${COMPOSE_SERVICE}"; then
    echo "⏭️  Service '${COMPOSE_SERVICE}' ignoré (--skip)"
  else
    echo "🛑 Arrêt du service '${COMPOSE_SERVICE}'..."
    docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" stop "${COMPOSE_SERVICE}"
    docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" rm -f "${COMPOSE_SERVICE}"
    echo "✅ Service '${COMPOSE_SERVICE}' arrêté"
  fi
else
  # Arrêt de tous les services (avec possibilité de skip)
  if [ -n "${SKIP_SERVICES}" ]; then
    echo "🛑 Arrêt des services (sauf: ${SKIP_SERVICES})..."
    
    # Liste de tous les services possibles
    ALL_SERVICES=("frontend" "backend" "mongo" "redis" "prometheus" "grafana")
    
    for service in "${ALL_SERVICES[@]}"; do
      if should_skip "${service}"; then
        echo "⏭️  Service '${service}' ignoré"
      else
        # Vérifier si le service existe et est en cours d'exécution
        if docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps -q "${service}" 2>/dev/null | grep -q .; then
          echo "   → Arrêt de '${service}'..."
          docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" stop "${service}"
          docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" rm -f "${service}"
        fi
      fi
    done
    
    echo "✅ Services arrêtés (${SKIP_SERVICES} toujours actifs)"
  else
    # Arrêt de tous les services sans exception
    echo "🛑 Arrêt de tous les services..."
    if [ "${REMOVE_VOLUMES}" = true ]; then
      docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" down -v
      echo "✅ Tous les services arrêtés et volumes supprimés"
    else
      docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" down
      echo "✅ Tous les services arrêtés"
    fi
  fi
fi

