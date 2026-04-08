import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    isLoading,
    fullWidth,
    className = '',
    ...props
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-light focus:ring-primary shadow-lg shadow-primary/20",
        secondary: "bg-accent text-white hover:bg-accent-light focus:ring-accent shadow-lg shadow-accent/20",
        outline: "border-2 border-primary text-primary hover:bg-gray-50",
        ghost: "text-primary hover:bg-gray-100",
    };

    const width = fullWidth ? "w-full" : "";
    const opacity = isLoading ? "opacity-75 cursor-wait" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${width} ${opacity} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};
