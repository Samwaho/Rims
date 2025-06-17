// Country data and utilities for frontend

export interface Country {
  code: string;
  name: string;
  currency: string;
  phonePrefix: string;
  flag?: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", currency: "USD", phonePrefix: "+1", flag: "🇺🇸" },
  { code: "KE", name: "Kenya", currency: "KES", phonePrefix: "+254", flag: "🇰🇪" },
  { code: "GB", name: "United Kingdom", currency: "GBP", phonePrefix: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", currency: "CAD", phonePrefix: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", currency: "AUD", phonePrefix: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", currency: "EUR", phonePrefix: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", currency: "EUR", phonePrefix: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", currency: "EUR", phonePrefix: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", currency: "EUR", phonePrefix: "+34", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", currency: "EUR", phonePrefix: "+31", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", currency: "EUR", phonePrefix: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", currency: "CHF", phonePrefix: "+41", flag: "🇨🇭" },
  { code: "AT", name: "Austria", currency: "EUR", phonePrefix: "+43", flag: "🇦🇹" },
  { code: "SE", name: "Sweden", currency: "SEK", phonePrefix: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", currency: "NOK", phonePrefix: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", currency: "DKK", phonePrefix: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", currency: "EUR", phonePrefix: "+358", flag: "🇫🇮" },
  { code: "IE", name: "Ireland", currency: "EUR", phonePrefix: "+353", flag: "🇮🇪" },
  { code: "PT", name: "Portugal", currency: "EUR", phonePrefix: "+351", flag: "🇵🇹" },
  { code: "GR", name: "Greece", currency: "EUR", phonePrefix: "+30", flag: "🇬🇷" },
  { code: "PL", name: "Poland", currency: "PLN", phonePrefix: "+48", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", currency: "CZK", phonePrefix: "+420", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", currency: "HUF", phonePrefix: "+36", flag: "🇭🇺" },
  { code: "SK", name: "Slovakia", currency: "EUR", phonePrefix: "+421", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", currency: "EUR", phonePrefix: "+386", flag: "🇸🇮" },
  { code: "HR", name: "Croatia", currency: "EUR", phonePrefix: "+385", flag: "🇭🇷" },
  { code: "BG", name: "Bulgaria", currency: "BGN", phonePrefix: "+359", flag: "🇧🇬" },
  { code: "RO", name: "Romania", currency: "RON", phonePrefix: "+40", flag: "🇷🇴" },
  { code: "LT", name: "Lithuania", currency: "EUR", phonePrefix: "+370", flag: "🇱🇹" },
  { code: "LV", name: "Latvia", currency: "EUR", phonePrefix: "+371", flag: "🇱🇻" },
  { code: "EE", name: "Estonia", currency: "EUR", phonePrefix: "+372", flag: "🇪🇪" },
  
  // African countries
  { code: "ZA", name: "South Africa", currency: "ZAR", phonePrefix: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", currency: "NGN", phonePrefix: "+234", flag: "🇳🇬" },
  { code: "EG", name: "Egypt", currency: "EGP", phonePrefix: "+20", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", currency: "MAD", phonePrefix: "+212", flag: "🇲🇦" },
  { code: "TN", name: "Tunisia", currency: "TND", phonePrefix: "+216", flag: "🇹🇳" },
  { code: "GH", name: "Ghana", currency: "GHS", phonePrefix: "+233", flag: "🇬🇭" },
  { code: "UG", name: "Uganda", currency: "UGX", phonePrefix: "+256", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", currency: "TZS", phonePrefix: "+255", flag: "🇹🇿" },
  { code: "RW", name: "Rwanda", currency: "RWF", phonePrefix: "+250", flag: "🇷🇼" },
  { code: "ET", name: "Ethiopia", currency: "ETB", phonePrefix: "+251", flag: "🇪🇹" },
  
  // Asian countries
  { code: "JP", name: "Japan", currency: "JPY", phonePrefix: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", currency: "CNY", phonePrefix: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", currency: "INR", phonePrefix: "+91", flag: "🇮🇳" },
  { code: "SG", name: "Singapore", currency: "SGD", phonePrefix: "+65", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", currency: "HKD", phonePrefix: "+852", flag: "🇭🇰" },
  { code: "KR", name: "South Korea", currency: "KRW", phonePrefix: "+82", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", currency: "THB", phonePrefix: "+66", flag: "🇹🇭" },
  { code: "MY", name: "Malaysia", currency: "MYR", phonePrefix: "+60", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", currency: "IDR", phonePrefix: "+62", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", currency: "PHP", phonePrefix: "+63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", currency: "VND", phonePrefix: "+84", flag: "🇻🇳" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", phonePrefix: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", phonePrefix: "+966", flag: "🇸🇦" },
  { code: "IL", name: "Israel", currency: "ILS", phonePrefix: "+972", flag: "🇮🇱" },
  { code: "TR", name: "Turkey", currency: "TRY", phonePrefix: "+90", flag: "🇹🇷" },
  
  // Americas
  { code: "MX", name: "Mexico", currency: "MXN", phonePrefix: "+52", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", currency: "BRL", phonePrefix: "+55", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", currency: "ARS", phonePrefix: "+54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", currency: "CLP", phonePrefix: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", currency: "COP", phonePrefix: "+57", flag: "🇨🇴" },
  { code: "PE", name: "Peru", currency: "PEN", phonePrefix: "+51", flag: "🇵🇪" },
  { code: "UY", name: "Uruguay", currency: "UYU", phonePrefix: "+598", flag: "🇺🇾" },
  { code: "PY", name: "Paraguay", currency: "PYG", phonePrefix: "+595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", currency: "BOB", phonePrefix: "+591", flag: "🇧🇴" },
  { code: "EC", name: "Ecuador", currency: "USD", phonePrefix: "+593", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela", currency: "VES", phonePrefix: "+58", flag: "🇻🇪" },
  { code: "CR", name: "Costa Rica", currency: "CRC", phonePrefix: "+506", flag: "🇨🇷" },
  { code: "PA", name: "Panama", currency: "PAB", phonePrefix: "+507", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", currency: "GTQ", phonePrefix: "+502", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", currency: "HNL", phonePrefix: "+504", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", currency: "USD", phonePrefix: "+503", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", currency: "NIO", phonePrefix: "+505", flag: "🇳🇮" },
  { code: "BZ", name: "Belize", currency: "BZD", phonePrefix: "+501", flag: "🇧🇿" },
  { code: "JM", name: "Jamaica", currency: "JMD", phonePrefix: "+1876", flag: "🇯🇲" },
  { code: "TT", name: "Trinidad and Tobago", currency: "TTD", phonePrefix: "+1868", flag: "🇹🇹" },
  { code: "BB", name: "Barbados", currency: "BBD", phonePrefix: "+1246", flag: "🇧🇧" },
  
  // Oceania
  { code: "NZ", name: "New Zealand", currency: "NZD", phonePrefix: "+64", flag: "🇳🇿" },
  { code: "FJ", name: "Fiji", currency: "FJD", phonePrefix: "+679", flag: "🇫🇯" },
  { code: "PG", name: "Papua New Guinea", currency: "PGK", phonePrefix: "+675", flag: "🇵🇬" },
];

// Utility functions
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return COUNTRIES.find(country => 
    country.name.toLowerCase() === name.toLowerCase()
  );
};

export const getCountriesByCurrency = (currency: string): Country[] => {
  return COUNTRIES.filter(country => country.currency === currency);
};

export const isValidCountryCode = (code: string): boolean => {
  return COUNTRIES.some(country => country.code === code);
};

export const getPhonePrefix = (countryCode: string): string | null => {
  const country = getCountryByCode(countryCode);
  return country ? country.phonePrefix : null;
};

export const getCurrencyForCountry = (countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  return country ? country.currency : "USD"; // Default to USD
};

export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  const prefix = getPhonePrefix(countryCode);
  if (!prefix || !phone) return phone;
  
  // Remove any existing prefix or special characters
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Add the country prefix if not already present
  if (!phone.startsWith(prefix)) {
    return `${prefix}${cleanPhone}`;
  }
  
  return phone;
};

export const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  const prefix = getPhonePrefix(countryCode);
  if (!prefix) return false;
  
  // Basic validation - starts with country prefix and has reasonable length
  const phoneRegex = new RegExp(`^\\${prefix.replace('+', '\\+')}\\d{7,15}$`);
  return phoneRegex.test(phone);
};

// Get popular/supported countries (customize based on your shipping capabilities)
export const getPopularCountries = (): Country[] => {
  const popularCodes = ['US', 'KE', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL'];
  return popularCodes.map(code => getCountryByCode(code)).filter(Boolean) as Country[];
};

// Get default country
export const getDefaultCountry = (): Country => {
  return getCountryByCode("US") || COUNTRIES[0]; // Default to US
};

// Search countries by name
export const searchCountries = (query: string): Country[] => {
  const lowercaseQuery = query.toLowerCase();
  return COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(lowercaseQuery) ||
    country.code.toLowerCase().includes(lowercaseQuery)
  );
};

export default {
  COUNTRIES,
  getCountryByCode,
  getCountryByName,
  getCountriesByCurrency,
  isValidCountryCode,
  getPhonePrefix,
  getCurrencyForCountry,
  formatPhoneNumber,
  validatePhoneNumber,
  getPopularCountries,
  getDefaultCountry,
  searchCountries,
};
