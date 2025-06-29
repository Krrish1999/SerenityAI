import React, { useState, useEffect } from 'react';
import { Phone, Check, AlertCircle } from 'lucide-react';

type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

type PhoneNumberInputProps = {
  value?: string;
  onChange: (phoneNumber: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
};

// Popular countries list with their dial codes
const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
];

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = '',
  onChange,
  error,
  disabled = false,
  label = 'Phone Number',
  placeholder,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Parse existing value on mount
  useEffect(() => {
    if (value) {
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.dialCode.length).trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  // Format phone number as user types
  const formatPhoneNumber = (input: string, countryCode: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format based on country
    if (countryCode === 'US' || countryCode === 'CA') {
      // North American format: (555) 123-4567
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (countryCode === 'GB') {
      // UK format: 020 1234 5678
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
    } else {
      // Generic international format with spaces every 3-4 digits
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
  };

  // Validate phone number
  const validatePhoneNumber = (number: string, country: Country): { isValid: boolean; error?: string } => {
    const digits = number.replace(/\D/g, '');
    
    if (!digits) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Country-specific validation
    if (country.code === 'US' || country.code === 'CA') {
      if (digits.length !== 10) {
        return { isValid: false, error: 'US/Canada numbers must be 10 digits' };
      }
      if (digits[0] === '0' || digits[0] === '1') {
        return { isValid: false, error: 'Area code cannot start with 0 or 1' };
      }
    } else if (country.code === 'GB') {
      if (digits.length < 10 || digits.length > 11) {
        return { isValid: false, error: 'UK numbers must be 10-11 digits' };
      }
    } else {
      // Generic international validation
      if (digits.length < 7 || digits.length > 15) {
        return { isValid: false, error: 'Phone number must be 7-15 digits' };
      }
    }

    return { isValid: true };
  };

  const handlePhoneNumberChange = (input: string) => {
    const formatted = formatPhoneNumber(input, selectedCountry.code);
    setPhoneNumber(formatted);

    const validation = validatePhoneNumber(formatted, selectedCountry);
    setIsValid(validation.isValid);
    setValidationError(validation.error || null);

    // Call parent onChange with full international format
    const fullNumber = `${selectedCountry.dialCode} ${formatted}`.trim();
    onChange(validation.isValid ? fullNumber : '');
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    
    // Re-validate with new country
    if (phoneNumber) {
      const validation = validatePhoneNumber(phoneNumber, country);
      setIsValid(validation.isValid);
      setValidationError(validation.error || null);      
      const fullNumber = `${country.dialCode} ${phoneNumber}`.trim();
      onChange(validation.isValid ? fullNumber : '');
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (selectedCountry.code) {
      case 'US':
      case 'CA':
        return '(555) 123-4567';
      case 'GB':
        return '020 1234 5678';
      case 'DE':
        return '030 12345678';
      case 'FR':
        return '01 23 45 67 89';
      default:
        return '123 456 7890';
    }
  };

  const displayError = error || validationError;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className={`flex rounded-md border ${
          displayError 
            ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400' 
            : 'border-gray-300 focus-within:border-accent-teal focus-within:ring-accent-teal'
        } bg-white focus-within:ring-1`}>          
          {/* Country Code Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center px-3 py-2 border-r border-gray-300 bg-white hover:bg-gray-50 rounded-l-md transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={disabled}
            >
              <span className="mr-2">{selectedCountry.flag}</span>
              <span className="text-gray-700 text-sm">{selectedCountry.dialCode}</span>
              <svg className="ml-1 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 z-50 w-80 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center text-gray-700 text-sm"
                    onClick={() => handleCountryChange(country)}
                  >
                    <span className="mr-3">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="text-gray-400">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="flex-1 relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={disabled}
              className="w-full px-3 py-2 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none rounded-r-md"
            />
            
            {/* Validation Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {phoneNumber && (
                isValid ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )
              )}
            </div>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {displayError}
        </p>
      )}

      {/* Helper Text */}
      {!displayError && phoneNumber && isValid && (
        <p className="mt-1 text-sm text-green-500 flex items-center">
          <Check className="w-4 h-4 mr-1" />
          Valid phone number
        </p>
      )}
    </div>
  );
};