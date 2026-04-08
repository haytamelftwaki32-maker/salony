import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    endIcon?: React.ReactNode;
    onEndIconClick?: () => void;
}

export const Input = ({ label, error, icon, endIcon, onEndIconClick, className = '', ...props }: InputProps) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        w-full px-4 py-3 rounded-lg border border-gray-200 
                        focus:border-[#1E1B4B] focus:ring-2 focus:ring-[#1E1B4B]/10 
                        transition-all duration-200 outline-none
                        bg-gray-50 focus:bg-white
                        placeholder:text-gray-400
                        ${icon ? 'ltr:pl-10 rtl:pr-10' : ''}
                        ${endIcon ? 'ltr:pr-10 rtl:pl-10' : ''}
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}
                        ${className}
                    `}
                    {...props}
                />
                {endIcon && (
                    <button
                        type="button"
                        onClick={onEndIconClick}
                        className={`absolute inset-y-0 right-0 rtl:left-0 rtl:right-auto pr-3 rtl:pl-3 rtl:pr-0 flex items-center transition-colors ${onEndIconClick ? 'cursor-pointer text-indigo-500 hover:text-indigo-700' : 'pointer-events-none text-gray-400'}`}
                    >
                        {endIcon}
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};
