// Utility functions for the Smart Deal Cost Calculator

/**
 * Format a number as currency (ZAR)
 * @param amount Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return 'R0.00';
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate the number of months between two dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of months
 */
export const monthsBetween = (startDate: Date, endDate: Date): number => {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  return years * 12 + months;
};

/**
 * Get the appropriate installation scale based on number of extensions
 * @param extensions Number of extensions
 * @param scales Installation scales object
 * @returns The appropriate scale value
 */
export const getInstallationScale = (
  extensions: number,
  scales: Record<string, number>
): number => {
  if (extensions <= 4) return scales['0-4'];
  if (extensions <= 8) return scales['5-8'];
  if (extensions <= 16) return scales['9-16'];
  if (extensions <= 32) return scales['17-32'];
  return scales['33+'];
};

/**
 * Get the appropriate finance fee based on finance amount
 * @param amount Finance amount
 * @param scales Finance fee scales object
 * @returns The appropriate finance fee
 */
export const getFinanceFee = (
  amount: number,
  scales: Record<string, number>
): number => {
  if (amount <= 20000) return scales['0-20000'];
  if (amount <= 50000) return scales['20001-50000'];
  if (amount <= 100000) return scales['50001-100000'];
  return scales['100001+'];
};

/**
 * Get the appropriate gross profit based on number of extensions
 * @param extensions Number of extensions
 * @param scales Gross profit scales object
 * @returns The appropriate gross profit value
 */
export const getGrossProfit = (
  extensions: number,
  scales: Record<string, number>
): number => {
  if (extensions <= 4) return scales['0-4'];
  if (extensions <= 8) return scales['5-8'];
  if (extensions <= 16) return scales['9-16'];
  if (extensions <= 32) return scales['17-32'];
  return scales['33+'];
};

/**
 * Calculate the rental factor based on term and escalation
 * @param term Term in months
 * @param escalation Escalation percentage
 * @returns The rental factor
 */
export const calculateRentalFactor = (
  term: number,
  escalation: number
): number => {
  // These are approximate rental factors
  const factorMap: Record<string, Record<string, number>> = {
    '36': {
      '0': 0.0333,
      '5': 0.0342,
      '10': 0.0351,
      '15': 0.0361
    },
    '48': {
      '0': 0.0261,
      '5': 0.0271,
      '10': 0.0282,
      '15': 0.0293
    },
    '60': {
      '0': 0.0218,
      '5': 0.0229,
      '10': 0.0241,
      '15': 0.0254
    }
  };
  
  const termKey = term.toString();
  const escalationKey = escalation.toString();
  
  if (factorMap[termKey] && factorMap[termKey][escalationKey]) {
    return factorMap[termKey][escalationKey];
  }
  
  // Default factor if not found
  return 0.03;
};

/**
 * Check if the application is online
 * @returns Boolean indicating online status
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Debounce a function call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
