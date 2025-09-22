export const GHANA_LOCALE = "en-GH"
export const GHANA_CURRENCY = "GHS"
export const GHANA_CURRENCY_SYMBOL = "₵"

// Ghana-specific formatting utilities
export const formatCurrency = (amount: number): string => {
  return `${GHANA_CURRENCY_SYMBOL}${amount.toLocaleString(GHANA_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString(GHANA_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleString(GHANA_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Ghana phone number formatting
export const formatGhanaPhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")

  // Handle Ghana format: +233 XX XXX XXXX
  if (digits.startsWith("233") && digits.length === 12) {
    return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }

  // Handle local format: 0XX XXX XXXX
  if (digits.startsWith("0") && digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }

  return phone // Return original if doesn't match expected formats
}

// Ghana regions for address validation
export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Brong-Ahafo",
  "Western North",
  "Ahafo",
  "Bono",
  "Bono East",
  "Oti",
  "North East",
  "Savannah",
] as const

export type GhanaRegion = (typeof GHANA_REGIONS)[number]

// Property types common in Ghana
export const GHANA_PROPERTY_TYPES = [
  "Bedsitter",
  "Single Room",
  "Chamber & Hall",
  "2 Bedroom Apartment",
  "3 Bedroom Apartment",
  "4+ Bedroom House",
  "Shop/Store",
  "Office Space",
  "Warehouse",
] as const

export type GhanaPropertyType = (typeof GHANA_PROPERTY_TYPES)[number]

// Payment methods common in Ghana
export const GHANA_PAYMENT_METHODS = [
  "Cash",
  "Mobile Money (MTN)",
  "Mobile Money (Vodafone)",
  "Mobile Money (AirtelTigo)",
  "Bank Transfer",
  "Cheque",
] as const

export type GhanaPaymentMethod = (typeof GHANA_PAYMENT_METHODS)[number]
