import { getSupabaseClient } from "@/lib/supabase-client"
import type { CurrencyRate } from "@/lib/types"

// Supported currencies
export const SUPPORTED_CURRENCIES = ["RWF", "USD", "EUR"] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

// Get latest currency rates
export async function getLatestCurrencyRates(baseCurrency: SupportedCurrency = "RWF"): Promise<Record<string, number>> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("currency_rates")
    .select("*")
    .eq("base_currency", baseCurrency)
    .order("effective_date", { ascending: false })

  if (error) {
    console.error("Error fetching currency rates:", error)
    return { RWF: 1, USD: 0.0009, EUR: 0.0008 } // Fallback rates
  }

  // Convert to record
  const rates: Record<string, number> = { [baseCurrency]: 1 }

  data.forEach((rate: CurrencyRate) => {
    rates[rate.target_currency] = rate.rate
  })

  // Ensure all supported currencies have a rate
  SUPPORTED_CURRENCIES.forEach((currency) => {
    if (!rates[currency]) {
      if (currency === "RWF") rates[currency] = 1
      else if (currency === "USD") rates[currency] = 0.0009
      else if (currency === "EUR") rates[currency] = 0.0008
    }
  })

  return rates
}

// Convert amount between currencies
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount

  // Convert to base currency (RWF) first if needed
  let inBaseCurrency = amount
  if (fromCurrency !== "RWF") {
    inBaseCurrency = amount / rates[fromCurrency]
  }

  // Convert from base currency to target
  if (toCurrency === "RWF") {
    return inBaseCurrency
  }

  return inBaseCurrency * rates[toCurrency]
}

// Format currency for display
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "RWF" ? 0 : 2,
    maximumFractionDigits: currency === "RWF" ? 0 : 2,
  })

  return formatter.format(amount)
}

// Update currency rates
export async function updateCurrencyRate(
  baseCurrency: SupportedCurrency,
  targetCurrency: SupportedCurrency,
  rate: number,
): Promise<boolean> {
  const supabase = getSupabaseClient()

  const today = new Date().toISOString().split("T")[0]

  const { error } = await supabase.from("currency_rates").upsert(
    {
      base_currency: baseCurrency,
      target_currency: targetCurrency,
      rate,
      effective_date: today,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "base_currency,target_currency,effective_date",
    },
  )

  if (error) {
    console.error("Error updating currency rate:", error)
    return false
  }

  return true
}
