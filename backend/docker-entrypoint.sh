#!/bin/sh
set -e

# Construire dynamiquement l'URI Mongo si non fourni
if [ -z "$MONGO_URI" ]; then
  if [ -z "$MONGO_PASSWORD" ]; then
    echo "ERROR: MONGO_URI ou MONGO_PASSWORD doit être défini pour se connecter à MongoDB."
    exit 1
  fi

  MONGO_HOST=${MONGO_HOST:-mongo}
  MONGO_PORT=${MONGO_PORT:-27017}
  MONGO_USER=${MONGO_USER:-booklio}
  MONGO_DB=${MONGO_DB:-booklio}
  MONGO_AUTH_SOURCE=${MONGO_AUTH_SOURCE:-admin}

  # Encodage sécurisé du mot de passe
  ENCODED_PASSWORD=$(node -e "const pwd = process.argv[1] || ''; console.log(encodeURIComponent(pwd))" "$MONGO_PASSWORD")

  export MONGO_URI="mongodb://${MONGO_USER}:${ENCODED_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_AUTH_SOURCE}"
  echo "MONGO_URI construit pour ${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB} (authSource=${MONGO_AUTH_SOURCE})"
else
  echo "MONGO_URI déjà fourni, utilisation directe."
fi

# Exécuter la commande passée en argument
exec "$@"
