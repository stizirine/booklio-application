import React from 'react';
import { MobileTestSuite } from './index';

/**
 * Page dédiée pour les tests mobile
 * Accessible via une route ou un bouton de debug
 */
const MobileTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Suite de Tests Mobile
          </h1>
          <p className="text-gray-600">
            Testez le rendu de l'application sur différentes tailles d'écran
          </p>
        </div>
        
        <MobileTestSuite />
      </div>
    </div>
  );
};

export default MobileTestPage;
