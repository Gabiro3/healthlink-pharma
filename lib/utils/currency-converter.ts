import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date: string = new Date().toISOString().split("T")[0],
): Promise<number> {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount
  }

  try {
    const supabase = createServerSupabaseClient()

    // Try to find direct conversion rate
    const { data: directRate, error: directError } = await supabase
      .from("currency_rates")
      .select("rate")
      .eq("base_currency", fromCurrency)
      .eq("target_currency", toCurrency)
      .eq("effective_date", date)
      .maybeSingle()

    if (directRate) {
      return amount * directRate.rate
    }

    // Try reverse conversion rate
    const { data: reverseRate, error: reverseError } = await supabase
      .from("currency_rates")
      .select("rate")
      .eq("base_currency", toCurrency)
      .eq("target_currency", fromCurrency)
      .eq("effective_date", date)
      .maybeSingle()

    if (reverseRate) {
      return amount / reverseRate.rate
    }

    // Try conversion through USD as intermediate
    const { data: fromToUsd } = await supabase
      .from("currency_rates")
      .select("rate")
      .eq("base_currency", "USD")
      .eq("target_currency", fromCurrency)
      .eq("effective_date", date)
      .maybeSingle()

    const { data: usdToTarget } = await supabase
      .from("currency_rates")
      .select("rate")
      .eq("base_currency", "USD")
      .eq("target_currency", toCurrency)
      .eq("effective_date", date)
      .maybeSingle()

    if (fromToUsd && usdToTarget) {
      // Convert from source to USD, then from USD to target
      const amountInUsd = amount / fromToUsd.rate
      return amountInUsd * usdToTarget.rate
    }

    // If no conversion path found, return original amount
    console.warn(`No conversion rate found for ${fromCurrency} to ${toCurrency}`)
    return amount
  } catch (error) {
    console.error("Error converting currency:", error)
    return amount
  }
}

export function formatCurrency(amount: number, currency = "RWF", locale = "en-RW"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "RWF" ? 0 : 2,
    maximumFractionDigits: currency === "RWF" ? 0 : 2,
  }).format(amount)
}
