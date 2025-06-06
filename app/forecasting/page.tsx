import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { SalesForecast } from "@/components/forecasting/sales-forecast"
import { redirect } from "next/navigation"

export default async function ForecastingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Mock SARIMA forecast data - in a real app, this would come from a machine learning service
  const forecastData = [
    { period: "Week 1", predicted: 15000, confidence_lower: 13500, confidence_upper: 16500, actual: 14800 },
    { period: "Week 2", predicted: 16200, confidence_lower: 14580, confidence_upper: 17820, actual: 15900 },
    { period: "Week 3", predicted: 14800, confidence_lower: 13320, confidence_upper: 16280, actual: 15100 },
    { period: "Week 4", predicted: 17500, confidence_lower: 15750, confidence_upper: 19250 },
    { period: "Week 5", predicted: 18200, confidence_lower: 16380, confidence_upper: 20020 },
    { period: "Week 6", predicted: 16800, confidence_lower: 15120, confidence_upper: 18480 },
    { period: "Week 7", predicted: 19000, confidence_lower: 17100, confidence_upper: 20900 },
    { period: "Week 8", predicted: 17200, confidence_lower: 15480, confidence_upper: 18920 },
    { period: "Week 9", predicted: 18500, confidence_lower: 16650, confidence_upper: 20350 },
    { period: "Week 10", predicted: 19800, confidence_lower: 17820, confidence_upper: 21780 },
    { period: "Week 11", predicted: 21000, confidence_lower: 18900, confidence_upper: 23100 },
    { period: "Week 12", predicted: 22500, confidence_lower: 20250, confidence_upper: 24750 },
  ]

  const seasonalPatterns = [
    { month: "January", seasonal_factor: 0.85, trend: "down" as const },
    { month: "February", seasonal_factor: 0.78, trend: "down" as const },
    { month: "March", seasonal_factor: 0.92, trend: "up" as const },
    { month: "April", seasonal_factor: 0.88, trend: "stable" as const },
    { month: "May", seasonal_factor: 1.05, trend: "up" as const },
    { month: "June", seasonal_factor: 1.12, trend: "up" as const },
    { month: "July", seasonal_factor: 1.08, trend: "stable" as const },
    { month: "August", seasonal_factor: 1.15, trend: "up" as const },
    { month: "September", seasonal_factor: 1.22, trend: "up" as const },
    { month: "October", seasonal_factor: 1.35, trend: "up" as const },
    { month: "November", seasonal_factor: 1.45, trend: "up" as const },
    { month: "December", seasonal_factor: 1.78, trend: "up" as const },
  ]

  return (
    <div className="space-y-6">
      <Header
        title="Sales Forecasting"
        subtitle="SARIMA-based sales predictions and seasonal analysis"
        user={{
          email: user.email,
          pharmacy_name: user.pharmacy_name,
          role: user.role,
        }}
      />

      <div className="px-6">
        <SalesForecast
          forecastData={forecastData}
          seasonalPatterns={seasonalPatterns}
          modelAccuracy={92.3}
          lastUpdated={new Date().toISOString()}
        />
      </div>
    </div>
  )
}
