import React from 'react';
import { Icon } from './index';

/**
 * Exemple d'utilisation du système d'icônes centralisé
 * Ce composant montre comment migrer des SVG inline vers le système d'icônes
 */
const IconExample: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Exemples d'utilisation des icônes</h2>
      
      {/* Exemple 1: Icônes de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Icônes de base</h3>
        <div className="flex items-center gap-4">
          <Icon name="user" size="sm" className="text-blue-600" />
          <Icon name="mail" size="sm" className="text-green-600" />
          <Icon name="phone" size="sm" className="text-purple-600" />
          <Icon name="calendar" size="sm" className="text-orange-600" />
        </div>
      </div>

      {/* Exemple 2: Différentes tailles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Différentes tailles</h3>
        <div className="flex items-center gap-4">
          <Icon name="clock" size="xs" className="text-gray-600" />
          <Icon name="clock" size="sm" className="text-gray-600" />
          <Icon name="clock" size="md" className="text-gray-600" />
          <Icon name="clock" size="lg" className="text-gray-600" />
          <Icon name="clock" size="xl" className="text-gray-600" />
        </div>
      </div>

      {/* Exemple 3: Dans des boutons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Dans des boutons</h3>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Icon name="plus" size="sm" />
            Ajouter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Icon name="edit" size="sm" />
            Modifier
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
            <Icon name="trash" size="sm" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Exemple 4: Avec animations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Avec animations</h3>
        <div className="flex items-center gap-4">
          <Icon 
            name="chevron-down" 
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200" 
          />
          <Icon 
            name="chevron-down" 
            className="text-gray-600 hover:rotate-180 transition-transform duration-200" 
          />
          <Icon 
            name="check-circle" 
            className="text-green-600 hover:scale-110 transition-transform duration-200" 
          />
        </div>
      </div>

      {/* Exemple 5: Migration d'un SVG inline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Migration d'un SVG inline</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Avant (SVG inline) :</p>
          <div className="bg-red-50 p-2 rounded text-xs font-mono">
            {`<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>`}
          </div>
          
          <p className="text-sm text-gray-600 mb-2 mt-4">Après (système d'icônes) :</p>
          <div className="bg-green-50 p-2 rounded text-xs font-mono">
            {`<Icon name="clock" size="sm" />`}
          </div>
        </div>
      </div>

      {/* Exemple 6: Icônes avec états */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Icônes avec états</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="check-circle" className="text-green-600" size="sm" />
            <span className="text-sm">Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="clock" className="text-yellow-600" size="sm" />
            <span className="text-sm">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="x-circle" className="text-red-600" size="sm" />
            <span className="text-sm">Annulé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconExample;
