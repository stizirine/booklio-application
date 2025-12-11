/**
 * Exemples d'utilisation de la configuration du menu sidebar
 */

import {
    defaultMenuConfig,
    getCustomMenuConfig,
    getMenuConfig,
    MenuConfig,
    minimalMenuConfig,
    productionMenuConfig,
    testMenuConfig
} from './menuConfig';

// ===== EXEMPLES D'UTILISATION =====

// 1. Configuration par défaut (tous les éléments affichés)
const _config1 = defaultMenuConfig;
// Résultat: appointments: true, clients: true, invoices: true, mobileTest: true, responsiveTest: true

// 2. Configuration pour la production (masquer les tests)
const _config2 = productionMenuConfig;
// Résultat: appointments: true, clients: true, invoices: true, mobileTest: false, responsiveTest: false

// 3. Configuration minimale (seulement les fonctionnalités essentielles)
const _config3 = minimalMenuConfig;
// Résultat: appointments: true, clients: true, invoices: false, mobileTest: false, responsiveTest: false

// 4. Configuration pour les tests (seulement les éléments de test)
const _config4 = testMenuConfig;
// Résultat: appointments: false, clients: false, invoices: false, mobileTest: true, responsiveTest: true

// 5. Configuration automatique selon l'environnement
const _config5 = getMenuConfig();
// En développement: tous les éléments affichés
// En production: masquer les éléments de test

// 6. Configuration personnalisée
const customConfig: MenuConfig = {
  appointments: true,
  clients: true,
  invoices: false,  // Masquer les factures
  mobileTest: false, // Masquer les tests mobile
  responsiveTest: true // Garder les tests responsive
};
const _config6 = getCustomMenuConfig(customConfig);

// ===== UTILISATION DANS UN COMPOSANT =====

// Dans Dashboard.tsx:
/*
import { getMenuConfig } from '../config/menuConfig';

const Dashboard = () => {
  const menuConfig = getMenuConfig();
  
  return (
    <DashboardSidebar
      variant="drawer"
      menuConfig={menuConfig}
      onLogout={handleLogout}
      onLinkClick={handleLinkClick}
    />
  );
};
*/

// ===== CONFIGURATIONS PRÉDÉFINIES =====

// Configuration pour un environnement de démonstration
export const demoMenuConfig: MenuConfig = {
  appointments: true,
  clients: true,
  invoices: true,
  mobileTest: false,
  responsiveTest: false,
};

// Configuration pour un environnement de développement
export const devMenuConfig: MenuConfig = {
  appointments: true,
  clients: true,
  invoices: true,
  mobileTest: true,
  responsiveTest: true,
};

// Configuration pour un environnement de staging
export const stagingMenuConfig: MenuConfig = {
  appointments: true,
  clients: true,
  invoices: true,
  mobileTest: false,
  responsiveTest: true,
};

// ===== FONCTION UTILITAIRE POUR CHANGER LA CONFIGURATION DYNAMIQUEMENT =====

/**
 * Créer une configuration dynamique basée sur des paramètres
 */
export const createDynamicMenuConfig = (options: {
  showInvoices?: boolean;
  showTests?: boolean;
  showMobileTests?: boolean;
  showResponsiveTests?: boolean;
}): MenuConfig => {
  return {
    appointments: true, // Toujours affiché
    clients: true, // Toujours affiché
    invoices: options.showInvoices ?? true,
    mobileTest: options.showTests && options.showMobileTests ? true : false,
    responsiveTest: options.showTests && options.showResponsiveTests ? true : false,
  };
};

// Exemple d'utilisation de la configuration dynamique:
const _dynamicConfig = createDynamicMenuConfig({
  showInvoices: false,
  showTests: true,
  showMobileTests: true,
  showResponsiveTests: false,
});
// Résultat: appointments: true, clients: true, invoices: false, mobileTest: true, responsiveTest: false
