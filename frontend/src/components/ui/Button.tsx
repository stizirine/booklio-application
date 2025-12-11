import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'gradient';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const baseBySize: Record<ButtonSize, string> = {
	sm: 'px-2.5 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)]',
	md: 'px-4 py-2.5 text-sm font-semibold rounded-[var(--radius-sm)]',
};

const variantClasses: Record<ButtonVariant, string> = {
	primary: 'text-white bg-[var(--color-primary)] hover:shadow-card hover:-translate-y-0.5',
	secondary: 'bg-[var(--color-card)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]',
	danger: 'text-white bg-[var(--color-danger)] hover:opacity-90',
	warning: 'text-white bg-[var(--color-warning)] hover:opacity-90',
	ghost: 'bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-surface)]',
	gradient: 'text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:shadow-card hover:-translate-y-0.5',
};

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'sm',
	leftIcon,
	rightIcon,
	children,
	className = '',
	...props
}) => {
	return (
		<button
			className={`inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition transform ${baseBySize[size]} ${variantClasses[variant]} ${className}`}
			{...props}
		>
			{leftIcon}
			{children && <span className="whitespace-nowrap">{children}</span>}
			{rightIcon}
		</button>
	);
};

export default Button;


