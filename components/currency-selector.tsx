"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/contexts/currency-context"
import { SUPPORTED_CURRENCIES } from "@/lib/services/currency-service"
import { ChevronsUpDown } from "lucide-react"

export function CurrencySelector() {
  const { currentCurrency, setCurrency } = useCurrency()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-24 justify-between">
          {currentCurrency}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_CURRENCIES.map((currency) => (
          <DropdownMenuItem
            key={currency}
            onClick={() => setCurrency(currency)}
            className={currentCurrency === currency ? "bg-gray-100 font-medium" : ""}
          >
            {currency}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
