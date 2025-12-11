import React from 'react';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
	variant?: BadgeVariant;
	size?: BadgeSize;
	children: React.ReactNode;
	className?: string;
}

const sizeMap: Record<BadgeSize, string> = {
	xs: 'px-1.5 py-0.5 text-[10px]',
	sm: 'px-2 py-0.5 text-xs',
	md: 'px-2.5 py-1 text-sm',
};

const variantMap: Record<BadgeVariant, string> = {
	neutral: 'bg-gray-100 text-gray-700',
	success: 'bg-green-100 text-green-700',
	warning: 'bg-yellow-100 text-yellow-700',
	danger: 'bg-red-100 text-red-700',
	info: 'bg-indigo-100 text-indigo-700',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', size = 'sm', children, className = '' }) => (
	<span className={`inline-flex items-center rounded-full ${sizeMap[size]} ${variantMap[variant]} ${className}`}>{children}</span>
);

export default Badge;


