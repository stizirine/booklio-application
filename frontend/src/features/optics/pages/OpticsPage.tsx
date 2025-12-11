import { useCapabilities } from '@contexts/TenantContext';
import React from 'react';
import OpticsSection from '../components/OpticsSection';

const OpticsPage: React.FC = () => {
  const { canAccessOptics } = useCapabilities();
  if (!canAccessOptics()) {
    return <div className="p-6 text-sm text-gray-500">Module Optique non accessible.</div>;
  }
  return (
    <div className="p-6">
      <OpticsSection />
    </div>
  );
};

export default OpticsPage;

