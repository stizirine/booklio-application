import React, { useState } from 'react';
import { Icon } from '../assets/icons';

interface DevicePreviewProps {
  children: React.ReactNode;
}

const DevicePreview: React.FC<DevicePreviewProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const deviceSizes = {
    mobile: {
      portrait: { width: '375px', height: '667px' },
      landscape: { width: '667px', height: '375px' }
    },
    tablet: {
      portrait: { width: '768px', height: '1024px' },
      landscape: { width: '1024px', height: '768px' }
    },
    desktop: {
      portrait: { width: '1200px', height: '800px' },
      landscape: { width: '1600px', height: '900px' }
    }
  };

  const currentSize = deviceSizes[deviceType][orientation];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        title="Ouvrir le mode prévisualisation mobile"
      >
        <Icon name="phone" className="w-5 h-5" size="sm" />
        <span className="hidden sm:inline text-sm font-medium">Mobile Preview</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Prévisualisation Mobile</h3>
            <div className="flex items-center gap-2">
              <Icon name="phone" className="w-4 h-4 text-gray-600" size="sm" />
              <span className="text-sm text-gray-600">
                {deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablette' : 'Desktop'} 
                ({orientation === 'portrait' ? 'Portrait' : 'Paysage'})
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="x" className="w-5 h-5" size="sm" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            {/* Device Type */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Appareil:</label>
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                {(['mobile', 'tablet', 'desktop'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setDeviceType(type)}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      deviceType === type
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {type === 'mobile' ? '📱' : type === 'tablet' ? '📱' : '💻'} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Orientation:</label>
              <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                {(['portrait', 'landscape'] as const).map((orient) => (
                  <button
                    key={orient}
                    onClick={() => setOrientation(orient)}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${
                      orientation === orient
                        ? 'bg-green-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {orient === 'portrait' ? '📱' : '🔄'} {orient}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Info */}
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-300">
              {currentSize.width} × {currentSize.height}
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="flex justify-center">
            <div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-300"
              style={{
                width: currentSize.width,
                height: currentSize.height,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <div className="w-full h-full overflow-auto">
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            💡 Conseil: Utilisez les contrôles pour tester différentes tailles d'écran et orientations
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevicePreview;
