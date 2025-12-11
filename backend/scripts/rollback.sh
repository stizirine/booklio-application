#!/bin/bash
# Script de rollback pour Booklio
# Usage: ./scripts/rollback.sh [backup_file]

set -euo pipefail

BACKUP_FILE=${1:-""}
WORKDIR="${DEPLOY_DIR:-/opt/booklio}"

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Veuillez spécifier un fichier de backup"
    echo "Usage: $0 <backup_file>"
    echo "Fichiers disponibles:"
    ls -la "$WORKDIR"/docker-compose.prod.yml.backup.* 2>/dev/null || echo "Aucun backup trouvé"
    exit 1
fi

if [ ! -f "$WORKDIR/$BACKUP_FILE" ]; then
    echo "❌ Fichier de backup non trouvé: $WORKDIR/$BACKUP_FILE"
    exit 1
fi

echo "🔄 Rollback vers $BACKUP_FILE..."

cd "$WORKDIR"

# Arrêter l'application actuelle
echo "⏹️  Arrêt de l'application..."
docker compose -f docker-compose.prod.yml down || true

# Restaurer le backup
echo "📦 Restauration du backup..."
cp "$BACKUP_FILE" docker-compose.prod.yml

# Redémarrer l'application
echo "🚀 Redémarrage de l'application..."
docker compose -f docker-compose.prod.yml up -d

# Vérification de santé
echo "🔍 Vérification de santé..."
sleep 30
if curl -f http://localhost:4000/health; then
    echo "✅ Rollback réussi - Application en ligne"
else
    echo "❌ Échec du rollback - Application non accessible"
    exit 1
fi
