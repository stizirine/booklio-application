#!/bin/bash

# Script pour créer une nouvelle branche de fonctionnalité
# Usage: ./scripts/create-feature.sh feature-name

if [ $# -eq 0 ]; then
    echo "Usage: ./scripts/create-feature.sh feature-name"
    echo "Example: ./scripts/create-feature.sh user-authentication"
    exit 1
fi

FEATURE_NAME=$1
BRANCH_NAME="feature/$FEATURE_NAME"

# Vérifier qu'on est sur develop
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "⚠️  Vous n'êtes pas sur la branche develop. Basculement vers develop..."
    git checkout develop
    git pull origin develop
fi

# Créer et basculer vers la nouvelle branche
echo "🚀 Création de la branche: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

echo "✅ Branche créée avec succès!"
echo "📝 Vous pouvez maintenant développer votre fonctionnalité"
echo "🔄 Pour pousser la branche: git push -u origin $BRANCH_NAME"
echo "📋 Pour créer une PR: gh pr create --base develop --title '[FEATURE] $FEATURE_NAME'"
