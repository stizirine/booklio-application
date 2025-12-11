import { router as authRouter } from '../src/modules/auth/routes.js';

console.log("🔍 Debug des routes d'authentification...");
console.log('Routes disponibles:');

// Lister toutes les routes
authRouter.stack.forEach((layer: any) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
    const path = layer.route.path;
    console.log(`  ${methods} ${path}`);
  }
});

console.log('\n✅ Debug terminé');
