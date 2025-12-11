import { useCallback, useMemo, useState } from 'react';
import { InvoiceItem } from '../types';

export function useInvoiceEditor(initialItems: InvoiceItem[] = [], defaultTaxRate = 0) {
  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [notes, setNotes] = useState<string>('');

  const addItem = useCallback((item: Omit<InvoiceItem, 'id'>) => {
    setItems(prev => [...prev, { ...item }]);
  }, []);

  const updateItem = useCallback((index: number, updates: Partial<InvoiceItem>) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, ...updates } : it));
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => {
      const qty = Math.max(0, it.quantity || 0);
      const unit = Math.max(0, it.unitPrice || 0);
      const discount = Math.max(0, it.discountAmount || 0);
      return sum + Math.max(0, qty * unit - discount);
    }, 0);

    const tax = items.reduce((sum, it) => {
      const rate = typeof it.taxRate === 'number' ? it.taxRate : defaultTaxRate;
      const base = Math.max(0, (it.quantity || 0) * (it.unitPrice || 0) - (it.discountAmount || 0));
      return sum + base * Math.max(0, rate || 0);
    }, 0);

    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items, defaultTaxRate]);

  return {
    items,
    notes,
    setNotes,
    addItem,
    updateItem,
    removeItem,
    totals,
  };
}


