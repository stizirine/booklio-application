import React from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice } from '../types';

interface InvoiceItemsTableProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({ 
  invoice, 
  formatCurrency 
}) => {
  const { t } = useTranslation();
  
  // Calculer les totaux
  const subtotal = invoice.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
  const taxRate = 0.00; // 20% TVA par défaut
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <div className="mb-4 sm:mb-6 overflow-x-auto">
      <table className="w-full border-collapse border border-gray-400 text-[10px] sm:text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-left font-semibold">
              {t('invoices.description', { defaultValue: 'Désignation' })}
            </th>
            <th className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center font-semibold">
              {t('invoices.unitPriceTTC', { defaultValue: 'P.U.TTC' })}
            </th>
            <th className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center font-semibold">
              {t('invoices.quantityShort', { defaultValue: 'Qté' })}
            </th>
            <th className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center font-semibold hidden sm:table-cell">
              {t('invoices.discount', { defaultValue: 'Remise' })}
            </th>
            <th className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center font-semibold">
              {t('invoices.totalNetTTC', { defaultValue: 'Tot Net TTC' })}
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, index) => {
              const itemTotal = (item.unitPrice * item.quantity) - (item.discountAmount || 0);
              const itemTax = itemTotal * (item.taxRate || taxRate);
              const itemTotalTTC = itemTotal + itemTax;

              return (
                <tr key={item.id || index}>
                  <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center">
                    {formatCurrency(item.unitPrice * (1 + (item.taxRate || taxRate)))}
                  </td>
                  <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center hidden sm:table-cell">
                    {item.discountAmount ? formatCurrency(item.discountAmount) : '—'}
                  </td>
                  <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center font-semibold">
                    {formatCurrency(itemTotalTTC)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="border border-gray-400 px-3 sm:px-4 py-3 sm:py-4 text-center text-gray-500">
                {t('invoices.noItems', { defaultValue: 'Aucun article' })}
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-semibold">
            <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-right">
              {t('invoices.total', { defaultValue: 'Total' })}
            </td>
            <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center">
              {formatCurrency(total)}
            </td>
            <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center">
              {invoice.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
            </td>
            <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center hidden sm:table-cell">—</td>
            <td className="border border-gray-400 px-1.5 sm:px-2 py-1 sm:py-1.5 text-center">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default InvoiceItemsTable;