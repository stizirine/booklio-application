#!/bin/bash
# Script d'installation pour la production
set -euo pipefail

echo "🔧 Installation des dépendances de production..."

# Installer seulement les dépendances de production
npm ci --omit=dev --ignore-scripts

echo "✅ Installation terminée"
