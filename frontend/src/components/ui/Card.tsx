import React from 'react';

interface CardProps {
	className?: string;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', header, footer, children }) => (
	<div className={`bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-card ${className}`}>
		{header && <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--color-border)] bg-[var(--color-card)]">{header}</div>}
		<div className="p-4 sm:p-6">{children}</div>
		{footer && <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--color-border)] bg-[var(--color-card)]">{footer}</div>}
	</div>
);

export default Card;


