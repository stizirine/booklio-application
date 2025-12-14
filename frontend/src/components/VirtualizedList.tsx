import { useVirtualizer } from '@tanstack/react-virtual';
import React from 'react';

type VirtualizedListProps<T> = {
  items: T[];
  rowHeight?: number;
  overscan?: number;
  className?: string;
  density?: 'default' | 'compact';
  renderRow: (item: T, index: number) => React.ReactNode;
};

export function VirtualizedList<T>({ items, rowHeight = 88, overscan = 8, className = '', density = 'default', renderRow }: VirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const effectiveRowHeight = React.useMemo(() => {
    // Densité compacte: réduction ~30% de la hauteur des lignes
    return density === 'compact' ? Math.max(32, Math.round(rowHeight * 0.7)) : rowHeight;
  }, [rowHeight, density]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => effectiveRowHeight,
    // Permet des hauteurs de lignes dynamiques (expansions/collapses)
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div 
      ref={parentRef} 
      className={`relative overflow-auto ${className}`}
    >
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: '100%' }}>
        {virtualItems.map((vi) => {
          const item = items[vi.index];
          if (!item) return null;
          return (
            <div
              key={vi.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vi.start}px)`
              }}
              ref={virtualizer.measureElement}
              data-index={vi.index}
            >
              {renderRow(item, vi.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualizedList;


