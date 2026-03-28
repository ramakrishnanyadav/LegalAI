import { motion } from 'framer-motion';
import { ReactNode, useState, useRef } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

// Professional ease-out timing
const easeOut = [0.25, 0.46, 0.45, 0.94];

const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon,
}: AnimatedButtonProps) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 400);

    onClick?.();
  };

  const baseClasses = 'relative overflow-hidden font-semibold rounded-xl transition-shadow duration-300';
  
  const variantClasses = {
    primary: 'text-primary-foreground hover:shadow-lg hover:shadow-primary/20',
    secondary: 'text-foreground hover:bg-white/10',
    ghost: 'bg-transparent text-foreground hover:bg-white/5',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      style={{
        background: variant === 'primary' 
          ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))'
          : variant === 'secondary'
            ? 'rgba(255, 255, 255, 0.05)'
            : undefined,
        border: variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.1)' : undefined,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        duration: 0.15, 
        ease: easeOut 
      }}
      disabled={disabled || loading}
    >
      {/* Subtle ripple effect */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/20 rounded-full pointer-events-none"
          initial={{ width: 0, height: 0, opacity: 0.4 }}
          animate={{ width: 200, height: 200, opacity: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          style={{
            left: ripple.x - 100,
            top: ripple.y - 100,
          }}
        />
      ))}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-5 h-5"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </motion.div>
        ) : (
          <>
            {icon && <span>{icon}</span>}
            {children}
          </>
        )}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;
