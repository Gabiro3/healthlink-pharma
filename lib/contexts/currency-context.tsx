"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  type SupportedCurrency,
  getLatestCurrencyRates,
  formatCurrency,
  convertCurrency,
} from "@/lib/services/currency-service"

interface CurrencyContextType {
  currentCurrency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  rates: Record<string, number>
  formatAmount: (amount: number) => string
  convertAmount: (amount: number, fromCurrency: SupportedCurrency) => number
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<SupportedCurrency>("RWF")
  const [rates, setRates] = useState<Record<string, number>>({ RWF: 1, USD: 0.0009, EUR: 0.0008 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadRates() {
      setIsLoading(true)
      try {
        const latestRates = await getLatestCurrencyRates("RWF")
        setRates(latestRates)
      } catch (error) {
        console.error("Error loading currency rates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRates()
  }, [])

  const setCurrency = (currency: SupportedCurrency) => {
    setCurrentCurrency(currency)
  }

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currentCurrency)
  }

  const convertAmount = (amount: number, fromCurrency: SupportedCurrency) => {
    return convertCurrency(amount, fromCurrency, currentCurrency, rates)
  }

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        rates,
        formatAmount,
        convertAmount,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
