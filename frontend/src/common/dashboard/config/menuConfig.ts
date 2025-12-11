/**
 * Configuration du menu sidebar
 * Permet d'afficher ou masquer les éléments du menu selon l'environnement ou les préférences
 */

export interface MenuItem {
  id: string;
  path: string;
  icon: string;
  labelKey: string;
  isActive: (path: string) => boolean;
  className?: string;
}

export interface MenuConfig {
  appointments?: boolean;
  clients?: boolean;
  invoices?: boolean;
  opticsInvoices?: boolean;
  profile?: boolean;
  mobileTest?: boolean;
  responsiveTest?: boolean;
}

/**
 * Configuration des éléments de menu
 */
export const menuItems: MenuItem[] = [
  {
    id: 'appointments',
    path: '/appointments',
    icon: 'calendar-days',
    labelKey: 'dashboard.menuAppointments',
    isActive: (path) => path === '/' || path.startsWith('/appointments'),
  },
  {
    id: 'clients',
    path: '/clients',
    icon: 'users',
    labelKey: 'dashboard.menuClients',
    isActive: (path) => path.startsWith('/clients'),
  },
  {
    id: 'invoices',
    path: '/invoices',
    icon: 'receipt',
    labelKey: 'invoices.title',
    isActive: (path) => path.startsWith('/invoices'),
  },
  {
    id: 'opticsInvoices',
    path: '/optics-invoices',
    icon: 'glasses',
    labelKey: 'invoices.opticsInvoices',
    isActive: (path) => path.startsWith('/optics-invoices'),
    className: 'text-blue-600',
  },
  {
    id: 'profile',
    path: '/profile',
    icon: 'user-circle',
    labelKey: 'profile.title',
    isActive: (path) => path.startsWith('/profile'),
    className: 'text-purple-600',
  },
  {
    id: 'mobileTest',
    path: '/mobile-test',
    icon: 'phone',
    labelKey: 'dashboard.mobileTest',
    isActive: (path) => path.startsWith('/mobile-test'),
    className: 'text-green-600',
  },
  {
    id: 'responsiveTest',
    path: '/mobile-responsive-test',
    icon: 'monitor',
    labelKey: 'dashboard.responsiveTest',
    isActive: (path) => path.startsWith('/mobile-responsive-test'),
    className: 'text-blue-600',
  },
];

/**
 * Configuration par défaut - tous les éléments affichés
 */
export const defaultMenuConfig: MenuConfig = {
  appointments: true,
  clients: true,
  invoices: false,
  opticsInvoices: true,
  profile: true,
  mobileTest: false,
  responsiveTest: false,
};

/**
 * Configuration pour la production - masquer les éléments de test
 */
export const productionMenuConfig: MenuConfig = {
  appointments: true,
  clients: true,
  invoices: true,
  opticsInvoices: false,
  mobileTest: false,
  responsiveTest: false,
};

/**
 * Configuration minimale - seulement les fonctionnalités essentielles
 */
export const minimalMenuConfig: MenuConfig = {
  appointments: true,
  clients: true,
  invoices: false,
  mobileTest: false,
  responsiveTest: false,
};

/**
 * Configuration pour les tests - seulement les éléments de test
 */
export const testMenuConfig: MenuConfig = {
  appointments: false,
  clients: false,
  invoices: false,
  mobileTest: true,
  responsiveTest: true,
};

/**
 * Obtenir la configuration du menu selon l'environnement
 */
export const getMenuConfig = (): MenuConfig => {
  // En production, masquer les éléments de test
  if (process.env.NODE_ENV === 'production') {
    return productionMenuConfig;
  }
  
  // En développement, afficher tous les éléments
  return defaultMenuConfig;
};

/**
 * Obtenir la configuration du menu selon un paramètre personnalisé
 */
export const getCustomMenuConfig = (config: MenuConfig): MenuConfig => {
  return { ...defaultMenuConfig, ...config };
};
