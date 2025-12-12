#!/bin/sh
set -e

# Si MONGO_URI n'est pas fourni, construire depuis MONGO_PASSWORD
if [ -z "$MONGO_URI" ] && [ -n "$MONGO_PASSWORD" ]; then
  # Encoder le mot de passe pour l'URI en utilisant Node.js
  ENCODED_PASSWORD=$(node -p "encodeURIComponent(process.env.MONGO_PASSWORD)" -e "process.env.MONGO_PASSWORD='$MONGO_PASSWORD'")
  # Utiliser une approche plus sûre avec un script Node.js temporaire
  ENCODED_PASSWORD=$(node -e "const pwd = process.argv[1]; console.log(encodeURIComponent(pwd))" "$MONGO_PASSWORD")
  export MONGO_URI="mongodb://booklio:${ENCODED_PASSWORD}@mongo:27017/booklio?authSource=admin"
fi

# Exécuter la commande passée en argument
exec "$@"
