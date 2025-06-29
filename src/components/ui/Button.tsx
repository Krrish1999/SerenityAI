import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = "flex items-center justify-center rounded-xl font-medium transition-colors duration-200 focus:outline-none";
  
  const variantClasses = {
    primary: "bg-accent-teal text-white hover:bg-accent-teal/90 focus:ring-2 focus:ring-accent-teal/50",
    secondary: "bg-pastel-teal text-accent-teal hover:bg-pastel-teal/80 hover:text-accent-teal/90 focus:ring-2 focus:ring-pastel-teal/50",
    accent: "bg-accent-coral text-white hover:bg-accent-coral/90 focus:ring-2 focus:ring-accent-coral/50",
    outline: "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 focus:ring-2 focus:ring-accent-teal/50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800 focus:ring-2 focus:ring-accent-teal/50",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500/50"
  };
  
  const sizeClasses = {
    sm: "text-sm py-2 px-3",
    md: "text-base py-2.5 px-5",
    lg: "text-lg py-3 px-7"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = (disabled || isLoading) ? "opacity-60 cursor-not-allowed shadow-none transform-none" : "cursor-pointer";
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;