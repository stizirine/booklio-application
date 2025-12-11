#!/bin/bash

# Script de configuration des variables d'environnement

echo "🔧 Configuration des variables d'environnement pour Booklio App"
echo ""

# Vérifier si .env.local existe déjà
if [ -f ".env.local" ]; then
    echo "⚠️  Le fichier .env.local existe déjà."
    read -p "Voulez-vous le remplacer ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuration annulée."
        exit 1
    fi
fi

# Créer le fichier .env.local
echo "📝 Création du fichier .env.local..."

cat > .env.local << EOF
# Configuration de l'API hybride
# Définir à true pour forcer l'utilisation de l'API mockée
REACT_APP_USE_MOCK_API=false

# Définir à false pour désactiver le fallback vers l'API mockée
REACT_APP_FALLBACK_TO_MOCK=true

# Configuration du serveur backend
REACT_APP_API_BASE_URL=http://localhost:4000

# Configuration de l'authentification (pour les tests)
REACT_APP_DEFAULT_EMAIL=admin@booklio.com
REACT_APP_DEFAULT_PASSWORD=P@ssw0rd123

# Configuration du timeout des requêtes (en millisecondes)
REACT_APP_REQUEST_TIMEOUT=2000

# Mode debug (affiche les logs de configuration)
REACT_APP_DEBUG_MODE=true
EOF

echo "✅ Fichier .env.local créé avec succès !"
echo ""
echo "📋 Configuration par défaut :"
echo "   - API Mockée : Désactivée (utilise le serveur backend)"
echo "   - Fallback Mock : Activé (si le serveur n'est pas disponible)"
echo "   - URL Backend : http://localhost:4000"
echo ""
echo "🔧 Pour modifier la configuration, éditez le fichier .env.local"
echo ""
echo "💡 Commandes utiles :"
echo "   npm start                    # Démarrer avec la configuration par défaut"
echo "   REACT_APP_USE_MOCK_API=true npm start  # Forcer l'API mockée"
echo "   REACT_APP_FALLBACK_TO_MOCK=false npm start  # Désactiver le fallback"
