import React from 'react';

interface InvoiceFooterProps {
  storeName: string;
  ownerName: string;
  npeNumber: string;
}

const InvoiceFooter: React.FC<InvoiceFooterProps> = ({
  storeName,
  ownerName,
  npeNumber
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3 sm:gap-0">
      <div className="text-[10px] sm:text-xs text-gray-500">
        <p>INPE: {npeNumber}</p>
      </div>
      <div className="text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-gray-400 rounded-full flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
          <div className="text-center text-[9px] sm:text-xs">
            <p className="font-bold">{storeName}</p>
            <p className="font-bold">SARLAU</p>
            <p>{ownerName}</p>
            <p>Opticien Optometriste</p>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500">INPE: {npeNumber}</p>
      </div>
    </div>
  );
};

export default InvoiceFooter;
