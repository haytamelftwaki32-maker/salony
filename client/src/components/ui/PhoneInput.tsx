import React from 'react';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

export const PhoneInput = ({ label, error, className = '', ...props }: PhoneInputProps) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div 
                className={`flex items-center border border-gray-200 rounded-lg overflow-hidden h-[50px] bg-gray-50 focus-within:bg-white focus-within:border-[#1E1B4B] focus-within:ring-2 focus-within:ring-[#1E1B4B]/10 transition-all duration-200 ${error ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100' : ''} ${className}`}
                dir="ltr"
            >
                <div className="px-3 bg-slate-100 font-medium text-slate-900 border-r border-gray-200 h-full flex items-center gap-2">
                    <span className="text-lg leading-none tracking-tighter">🇲🇦</span>
                    <span className="tracking-wider">+212</span>
                </div>
                <input
                    type="tel"
                    className="flex-1 w-full border-none outline-none px-4 text-base h-full bg-transparent placeholder:text-slate-400 text-left"
                    {...props}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};
