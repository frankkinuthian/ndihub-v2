/**
 * Currency conversion utilities
 * 
 * This module provides currency conversion functions for the payment system.
 * In production, consider using a real-time currency API like:
 * - ExchangeRate-API
 * - Fixer.io
 * - CurrencyAPI
 */

// Exchange rates (approximate, to be fetched from a real API in production)
const EXCHANGE_RATES = {
  USD_TO_KES: 130,
  EUR_TO_KES: 140,
  GBP_TO_KES: 160,
  KES_TO_USD: 0.0077,
  KES_TO_EUR: 0.0071,
  KES_TO_GBP: 0.0063,
} as const;

export type SupportedCurrency = "KES" | "USD" | "EUR" | "GBP";

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to KES first, then to target currency if needed
  let amountInKes: number;

  switch (fromCurrency) {
    case "USD":
      amountInKes = amount * EXCHANGE_RATES.USD_TO_KES;
      break;
    case "EUR":
      amountInKes = amount * EXCHANGE_RATES.EUR_TO_KES;
      break;
    case "GBP":
      amountInKes = amount * EXCHANGE_RATES.GBP_TO_KES;
      break;
    case "KES":
      amountInKes = amount;
      break;
    default:
      throw new Error(`Unsupported source currency: ${fromCurrency}`);
  }

  // Convert from KES to target currency
  switch (toCurrency) {
    case "KES":
      return Math.round(amountInKes);
    case "USD":
      return Math.round(amountInKes * EXCHANGE_RATES.KES_TO_USD * 100) / 100;
    case "EUR":
      return Math.round(amountInKes * EXCHANGE_RATES.KES_TO_EUR * 100) / 100;
    case "GBP":
      return Math.round(amountInKes * EXCHANGE_RATES.KES_TO_GBP * 100) / 100;
    default:
      throw new Error(`Unsupported target currency: ${toCurrency}`);
  }
}

/**
 * Convert any supported currency to KES (for IntaSend payments)
 */
export function convertToKes(amount: number, fromCurrency: SupportedCurrency): number {
  return convertCurrency(amount, fromCurrency, "KES");
}

/**
 * Convert KES to any supported currency
 */
export function convertFromKes(amount: number, toCurrency: SupportedCurrency): number {
  return convertCurrency(amount, "KES", toCurrency);
}

/**
 * Convert any currency to USD cents (for Stripe payments)
 */
export function convertToUsdCents(amount: number, fromCurrency: SupportedCurrency): number {
  const usdAmount = convertCurrency(amount, fromCurrency, "USD");
  return Math.round(usdAmount * 100); // Convert to cents
}

/**
 * Format currency amount with proper symbol and formatting
 */
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const formatters = {
    KES: new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    USD: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    EUR: new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    GBP: new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  };

  return formatters[currency].format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  const symbols = {
    KES: "KSh",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  return symbols[currency];
}

/**
 * Get the default currency for the application
 */
export function getDefaultCurrency(): SupportedCurrency {
  return "KES";
}

/**
 * Check if a currency is supported
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return ["KES", "USD", "EUR", "GBP"].includes(currency);
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  if (fromCurrency === toCurrency) return 1;

  // Calculate rate by converting 1 unit
  return convertCurrency(1, fromCurrency, toCurrency);
}

/**
 * Update exchange rates (for future real-time API integration)
 */
export async function updateExchangeRates(): Promise<void> {
  // TODO: Implement real-time exchange rate fetching
  // This would fetch from a currency API and update the EXCHANGE_RATES object
  console.log("Exchange rates update not implemented yet");
}
