import React, { forwardRef } from 'react';

type TextAreaProps = {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, helperText, error, fullWidth = false, rows = 4, className = '', ...props }, ref) => {
    const baseTextAreaClasses = "block rounded-lg border py-2.5 px-3 shadow-sm focus:outline-none focus:ring-1 bg-white border-gray-300 text-gray-700 placeholder-gray-400 focus:border-accent-teal focus:ring-accent-teal";
    const errorTextAreaClasses = "border-red-400 focus:border-red-400 focus:ring-red-400";
    const widthClass = fullWidth ? "w-full" : "";
    
    return (
      <div className={`${widthClass}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseTextAreaClasses} ${error ? errorTextAreaClasses : ''} ${widthClass} ${className}`}
          {...props}
        />
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';