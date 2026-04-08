import { Scissors } from 'lucide-react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'white';
}

const Logo = ({ className = '', size = 'md', variant = 'default' }: LogoProps) => {
    const sizes = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl'
    };

    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const isWhite = variant === 'white';

    // Colors based on variant
    const textColor = isWhite ? 'text-white' : 'text-primary';
    const accentColor = isWhite ? 'text-accent' : 'text-accent';
    const iconBg = isWhite ? 'bg-white' : 'bg-primary';
    const iconColor = isWhite ? 'text-accent' : 'text-accent';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                {/* Barber pole stripes background - fade it out a bit more on white variant if needed, 
                    but actually if we have a white icon bg, the gradient behind might look weird. 
                    Let's keep it subtle or hide it for white variant if it clashes. 
                    For now, keeping it same but with conditional opacity/color if needed. 
                    Actually, if the icon container is bg-white, the gradient behind it (absolute inset-0) won't be seen if z-index is lower? 
                    Wait, previous code had absolute inset-0 for gradient, then relative for icon wrapper. 
                    So the gradient is BEHIND the icon wrapper. 
                    If icon wrapper is opaque bg-white, gradient is hidden behind it? 
                    Let's check the previous code: 
                    <div className="absolute inset-0 bg-gradient ... transform rotate-12"></div>
                    <div className="relative p-1.5 ...">
                    
                    The gradient is "absolute inset-0", rotated. The icon wrapper is "relative".
                    So the gradient is behind.
                    If icon wrapper has bg-barber-navy (default), it covers the center, but rotated gradient sticks out?
                    Ah, "rounded-lg" on both.
                    If they are same size, the rotated one sticks out corners.
                    
                    For white variant:
                    We want a nice logo.
                    If we make the icon wrapper bg-white, and have a Navy/Red gradient behind it on a Navy navbar -> Gradient checks out?
                    Blue on Blue is invisible. Red on Blue is visible.
                    So the red part of gradient will show.
                    
                    Let's try:
                    - Box: bg-white.
                    - Icon: text-barber-red.
                    - Gradient: maybe 'from-white to-red-500' opacity-20? Or keeping it simple.
                */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isWhite ? 'from-white/20 to-accent/30' : 'from-primary to-accent'} opacity-20 rounded-lg transform rotate-12`}></div>

                {/* Scissors icon container */}
                <div className={`relative p-1.5 ${iconBg} rounded-lg shadow-sm`}>
                    <Scissors className={`${iconSizes[size]} ${iconColor}`} />
                </div>
            </div>

            <span className={`${sizes[size]} font-serif font-bold tracking-tight`}>
                <span className={textColor}>Salon</span>
                <span className={accentColor}>y</span>
            </span>
        </div>
    );
};

export default Logo;
