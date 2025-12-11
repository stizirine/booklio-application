#!/bin/bash

# Script de validation complète avant push
set -e

echo "🔍 Validation du code avant push..."

# Vérifier que nous sommes dans un repo git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Ce script doit être exécuté dans un repository Git"
    exit 1
fi

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Vérifier le type checking
echo "🔍 Vérification des types TypeScript..."
npm run typecheck

# Vérifier le linting
echo "🔍 Vérification du linting..."
npm run lint

# Vérifier le formatage
echo "🔍 Vérification du formatage..."
npm run format

# Build du projet
echo "🔨 Build du projet..."
npm run build

# Tests de smoke (optionnel, peut être désactivé si pas de DB)
if [ "${SKIP_SMOKE_TESTS:-false}" != "true" ]; then
    echo "🧪 Tests de smoke..."
    npm run smoke:auth
    npm run smoke:register
    npm run smoke:appointments
else
    echo "⏭️ Tests de smoke ignorés (SKIP_SMOKE_TESTS=true)"
fi

echo "✅ Validation complète réussie !"
