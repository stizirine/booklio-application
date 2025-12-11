import Icon from '@assets/icons/Icon';
import React, { useCallback, useMemo } from 'react';
import { getClientDetailTabConfigs } from '../config/clientDetailTabs';
import { ClientDetailTabKey, useClientDetail } from '../context/ClientDetailContext';

interface ClientDetailTabsProps {
  topOffset?: string;
}

const ClientDetailTabs: React.FC<ClientDetailTabsProps> = ({ topOffset = '0px' }) => {
  const { activeTab, setActiveTab, isOptician, t, appointmentsCount, invoicesCount } = useClientDetail();

  const orderedTabs = useMemo(() => (
    isOptician() ? [ClientDetailTabKey.Info, ClientDetailTabKey.Appts, ClientDetailTabKey.Invoices, ClientDetailTabKey.Optics] as const : [ClientDetailTabKey.Info, ClientDetailTabKey.Appts, ClientDetailTabKey.Invoices] as const
  ), [isOptician]);

  const tabConfigs = useMemo(() => getClientDetailTabConfigs({
    isOptician: isOptician(),
    appointmentsCount,
    invoicesCount,
  }), [isOptician, appointmentsCount, invoicesCount]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const idx = orderedTabs.indexOf(activeTab as any);
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = (idx + delta + orderedTabs.length) % orderedTabs.length;
    setActiveTab(orderedTabs[next] as any);
  }, [activeTab, orderedTabs, setActiveTab]);

  const stickyClass = `sticky z-20`;
  const topStyle = { top: topOffset } as React.CSSProperties;

  return (
    <div 
      className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 sm:p-5 shadow-card ${stickyClass}`}
      style={topStyle}
      role="tablist" 
      aria-label="Client details tabs" 
      onKeyDown={onKeyDown}
    >
      <div className="flex bg-[var(--color-surface)] p-1 rounded-[var(--radius-md)] border border-[var(--color-border)] gap-1">
        {tabConfigs.map(cfg => {
          const isActive = activeTab === cfg.key;
          return (
            <button
              key={cfg.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(cfg.key)}
              className={`flex-1 py-2.5 px-2 sm:px-3 text-sm font-semibold rounded-[var(--radius-sm)] transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-sm'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
              }`}
            >
              <Icon name={cfg.icon} className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{t(cfg.labelKey, { defaultValue: cfg.labelKey.split('.').pop() })}</span>
              {typeof cfg.count === 'number' ? <span className="flex-shrink-0 text-xs">({cfg.count})</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClientDetailTabs;


