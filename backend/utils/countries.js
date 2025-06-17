// Country codes and related utilities for global shipping

export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", phonePrefix: "+1" },
  { code: "KE", name: "Kenya", currency: "KES", phonePrefix: "+254" },
  { code: "GB", name: "United Kingdom", currency: "GBP", phonePrefix: "+44" },
  { code: "CA", name: "Canada", currency: "CAD", phonePrefix: "+1" },
  { code: "AU", name: "Australia", currency: "AUD", phonePrefix: "+61" },
  { code: "DE", name: "Germany", currency: "EUR", phonePrefix: "+49" },
  { code: "FR", name: "France", currency: "EUR", phonePrefix: "+33" },
  { code: "IT", name: "Italy", currency: "EUR", phonePrefix: "+39" },
  { code: "ES", name: "Spain", currency: "EUR", phonePrefix: "+34" },
  { code: "NL", name: "Netherlands", currency: "EUR", phonePrefix: "+31" },
  { code: "BE", name: "Belgium", currency: "EUR", phonePrefix: "+32" },
  { code: "CH", name: "Switzerland", currency: "CHF", phonePrefix: "+41" },
  { code: "AT", name: "Austria", currency: "EUR", phonePrefix: "+43" },
  { code: "SE", name: "Sweden", currency: "SEK", phonePrefix: "+46" },
  { code: "NO", name: "Norway", currency: "NOK", phonePrefix: "+47" },
  { code: "DK", name: "Denmark", currency: "DKK", phonePrefix: "+45" },
  { code: "FI", name: "Finland", currency: "EUR", phonePrefix: "+358" },
  { code: "IE", name: "Ireland", currency: "EUR", phonePrefix: "+353" },
  { code: "PT", name: "Portugal", currency: "EUR", phonePrefix: "+351" },
  { code: "GR", name: "Greece", currency: "EUR", phonePrefix: "+30" },
  { code: "PL", name: "Poland", currency: "PLN", phonePrefix: "+48" },
  { code: "CZ", name: "Czech Republic", currency: "CZK", phonePrefix: "+420" },
  { code: "HU", name: "Hungary", currency: "HUF", phonePrefix: "+36" },
  { code: "SK", name: "Slovakia", currency: "EUR", phonePrefix: "+421" },
  { code: "SI", name: "Slovenia", currency: "EUR", phonePrefix: "+386" },
  { code: "HR", name: "Croatia", currency: "EUR", phonePrefix: "+385" },
  { code: "BG", name: "Bulgaria", currency: "BGN", phonePrefix: "+359" },
  { code: "RO", name: "Romania", currency: "RON", phonePrefix: "+40" },
  { code: "LT", name: "Lithuania", currency: "EUR", phonePrefix: "+370" },
  { code: "LV", name: "Latvia", currency: "EUR", phonePrefix: "+371" },
  { code: "EE", name: "Estonia", currency: "EUR", phonePrefix: "+372" },
  { code: "MT", name: "Malta", currency: "EUR", phonePrefix: "+356" },
  { code: "CY", name: "Cyprus", currency: "EUR", phonePrefix: "+357" },
  { code: "LU", name: "Luxembourg", currency: "EUR", phonePrefix: "+352" },
  { code: "IS", name: "Iceland", currency: "ISK", phonePrefix: "+354" },
  { code: "LI", name: "Liechtenstein", currency: "CHF", phonePrefix: "+423" },
  { code: "MC", name: "Monaco", currency: "EUR", phonePrefix: "+377" },
  { code: "AD", name: "Andorra", currency: "EUR", phonePrefix: "+376" },
  { code: "SM", name: "San Marino", currency: "EUR", phonePrefix: "+378" },
  { code: "VA", name: "Vatican City", currency: "EUR", phonePrefix: "+39" },
  
  // African countries
  { code: "ZA", name: "South Africa", currency: "ZAR", phonePrefix: "+27" },
  { code: "NG", name: "Nigeria", currency: "NGN", phonePrefix: "+234" },
  { code: "EG", name: "Egypt", currency: "EGP", phonePrefix: "+20" },
  { code: "MA", name: "Morocco", currency: "MAD", phonePrefix: "+212" },
  { code: "TN", name: "Tunisia", currency: "TND", phonePrefix: "+216" },
  { code: "GH", name: "Ghana", currency: "GHS", phonePrefix: "+233" },
  { code: "UG", name: "Uganda", currency: "UGX", phonePrefix: "+256" },
  { code: "TZ", name: "Tanzania", currency: "TZS", phonePrefix: "+255" },
  { code: "RW", name: "Rwanda", currency: "RWF", phonePrefix: "+250" },
  { code: "ET", name: "Ethiopia", currency: "ETB", phonePrefix: "+251" },
  
  // Asian countries
  { code: "JP", name: "Japan", currency: "JPY", phonePrefix: "+81" },
  { code: "CN", name: "China", currency: "CNY", phonePrefix: "+86" },
  { code: "IN", name: "India", currency: "INR", phonePrefix: "+91" },
  { code: "SG", name: "Singapore", currency: "SGD", phonePrefix: "+65" },
  { code: "HK", name: "Hong Kong", currency: "HKD", phonePrefix: "+852" },
  { code: "KR", name: "South Korea", currency: "KRW", phonePrefix: "+82" },
  { code: "TH", name: "Thailand", currency: "THB", phonePrefix: "+66" },
  { code: "MY", name: "Malaysia", currency: "MYR", phonePrefix: "+60" },
  { code: "ID", name: "Indonesia", currency: "IDR", phonePrefix: "+62" },
  { code: "PH", name: "Philippines", currency: "PHP", phonePrefix: "+63" },
  { code: "VN", name: "Vietnam", currency: "VND", phonePrefix: "+84" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", phonePrefix: "+971" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", phonePrefix: "+966" },
  { code: "IL", name: "Israel", currency: "ILS", phonePrefix: "+972" },
  { code: "TR", name: "Turkey", currency: "TRY", phonePrefix: "+90" },
  
  // Americas
  { code: "MX", name: "Mexico", currency: "MXN", phonePrefix: "+52" },
  { code: "BR", name: "Brazil", currency: "BRL", phonePrefix: "+55" },
  { code: "AR", name: "Argentina", currency: "ARS", phonePrefix: "+54" },
  { code: "CL", name: "Chile", currency: "CLP", phonePrefix: "+56" },
  { code: "CO", name: "Colombia", currency: "COP", phonePrefix: "+57" },
  { code: "PE", name: "Peru", currency: "PEN", phonePrefix: "+51" },
  { code: "UY", name: "Uruguay", currency: "UYU", phonePrefix: "+598" },
  { code: "PY", name: "Paraguay", currency: "PYG", phonePrefix: "+595" },
  { code: "BO", name: "Bolivia", currency: "BOB", phonePrefix: "+591" },
  { code: "EC", name: "Ecuador", currency: "USD", phonePrefix: "+593" },
  { code: "VE", name: "Venezuela", currency: "VES", phonePrefix: "+58" },
  { code: "CR", name: "Costa Rica", currency: "CRC", phonePrefix: "+506" },
  { code: "PA", name: "Panama", currency: "PAB", phonePrefix: "+507" },
  { code: "GT", name: "Guatemala", currency: "GTQ", phonePrefix: "+502" },
  { code: "HN", name: "Honduras", currency: "HNL", phonePrefix: "+504" },
  { code: "SV", name: "El Salvador", currency: "USD", phonePrefix: "+503" },
  { code: "NI", name: "Nicaragua", currency: "NIO", phonePrefix: "+505" },
  { code: "BZ", name: "Belize", currency: "BZD", phonePrefix: "+501" },
  { code: "JM", name: "Jamaica", currency: "JMD", phonePrefix: "+1876" },
  { code: "TT", name: "Trinidad and Tobago", currency: "TTD", phonePrefix: "+1868" },
  { code: "BB", name: "Barbados", currency: "BBD", phonePrefix: "+1246" },
  
  // Oceania
  { code: "NZ", name: "New Zealand", currency: "NZD", phonePrefix: "+64" },
  { code: "FJ", name: "Fiji", currency: "FJD", phonePrefix: "+679" },
  { code: "PG", name: "Papua New Guinea", currency: "PGK", phonePrefix: "+675" },
];

// Get country by code
export const getCountryByCode = (code) => {
  return COUNTRIES.find(country => country.code === code);
};

// Get country by name
export const getCountryByName = (name) => {
  return COUNTRIES.find(country => 
    country.name.toLowerCase() === name.toLowerCase()
  );
};

// Get countries by currency
export const getCountriesByCurrency = (currency) => {
  return COUNTRIES.filter(country => country.currency === currency);
};

// Validate country code
export const isValidCountryCode = (code) => {
  return COUNTRIES.some(country => country.code === code);
};

// Get phone prefix for country
export const getPhonePrefix = (countryCode) => {
  const country = getCountryByCode(countryCode);
  return country ? country.phonePrefix : null;
};

// Get currency for country
export const getCurrencyForCountry = (countryCode) => {
  const country = getCountryByCode(countryCode);
  return country ? country.currency : "USD"; // Default to USD
};

// Format phone number based on country
export const formatPhoneNumber = (phone, countryCode) => {
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

// Validate phone number format for country
export const validatePhoneNumber = (phone, countryCode) => {
  const prefix = getPhonePrefix(countryCode);
  if (!prefix) return false;
  
  // Basic validation - starts with country prefix and has reasonable length
  const phoneRegex = new RegExp(`^\\${prefix}\\d{7,15}$`);
  return phoneRegex.test(phone);
};

// Get supported countries (you can customize this based on your shipping capabilities)
export const getSupportedCountries = () => {
  // Return all countries for now, but you can filter based on your shipping zones
  return COUNTRIES;
};

// Get default country (can be based on user's location or business location)
export const getDefaultCountry = () => {
  return getCountryByCode("US"); // Default to US since you're using USD
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
  getSupportedCountries,
  getDefaultCountry,
};
