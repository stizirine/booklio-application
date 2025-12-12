#!/bin/sh
set -e  # Échouer sur les erreurs

echo "Installing dependencies..."
# Installer les dépendances - permettre l'erreur husky mais continuer
npm install --legacy-peer-deps 2>&1 | grep -v "husky" || true

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
  echo "ERROR: node_modules not created"
  exit 1
fi

echo "Installation completed"

echo "Verifying installation..."
echo "Checking node_modules structure..."
ls -la node_modules/ | head -10
echo "Checking @craco directory..."
ls -la node_modules/@craco/ 2>&1 || echo "No @craco directory"

if [ -d "node_modules/@craco/craco" ]; then
  echo "✓ @craco/craco is installed"
elif [ -d "node_modules/craco" ]; then
  echo "✓ craco is installed (without @craco scope)"
else
  echo "✗ @craco/craco is NOT installed"
  echo "Installing @craco/craco manually..."
  npm install @craco/craco@^7.1.0 --legacy-peer-deps --save-dev || {
    echo "Manual install failed, trying npm ci..."
    if [ -f "package-lock.json" ]; then
      npm ci --legacy-peer-deps || exit 1
    else
      echo "ERROR: Cannot install @craco/craco"
      exit 1
    fi
  }
  # Vérifier à nouveau
  if [ -d "node_modules/@craco/craco" ]; then
    echo "✓ @craco/craco installed successfully"
  else
    echo "ERROR: @craco/craco still not installed after retry"
    exit 1
  fi
fi

