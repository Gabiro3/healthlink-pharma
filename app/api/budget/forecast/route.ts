import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const url = new URL(request.url)
    const months = Number.parseInt(url.searchParams.get("months") || "12")

    // Get historical sales data for forecasting
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("total_amount, currency, created_at")
      .order("created_at", { ascending: true })
      .limit(1000)

    if (salesError) {
      console.error("Error fetching sales data:", salesError)
      return NextResponse.json({ error: salesError.message }, { status: 500 })
    }

    // Get historical procurement data
    const { data: procurementData, error: procurementError } = await supabase
      .from("procurement_orders")
      .select("total_amount, currency, created_at")
      .order("created_at", { ascending: true })
      .limit(1000)

    if (procurementError) {
      console.error("Error fetching procurement data:", procurementError)
      return NextResponse.json({ error: procurementError.message }, { status: 500 })
    }

    // Process data for forecasting
    const processedData = processHistoricalData(salesData || [], procurementData || [], months)

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Error generating forecast:", error)
    return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 })
  }
}

function processHistoricalData(salesData: any[], procurementData: any[], months: number) {
  const now = new Date()
  const monthlyData: Record<string, { sales: number; procurement: number; profit: number }> = {}

  // Process sales data
  salesData.forEach((sale) => {
    const date = new Date(sale.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { sales: 0, procurement: 0, profit: 0 }
    }

    monthlyData[monthKey].sales += sale.total_amount || 0
  })

  // Process procurement data
  procurementData.forEach((procurement) => {
    const date = new Date(procurement.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { sales: 0, procurement: 0, profit: 0 }
    }

    monthlyData[monthKey].procurement += procurement.total_amount || 0
  })

  // Calculate profit margins
  Object.keys(monthlyData).forEach((monthKey) => {
    const data = monthlyData[monthKey]
    data.profit = data.sales - data.procurement
  })

  // Generate forecast for next months
  const forecast = []
  const historicalValues = Object.values(monthlyData)
  const avgSales = historicalValues.reduce((sum, data) => sum + data.sales, 0) / historicalValues.length || 0
  const avgProcurement =
    historicalValues.reduce((sum, data) => sum + data.procurement, 0) / historicalValues.length || 0

  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, "0")}`

    // Simple trend-based forecasting with seasonal adjustment
    const seasonalFactor = 1 + Math.sin((forecastDate.getMonth() * Math.PI) / 6) * 0.1
    const trendFactor = 1 + i * 0.02 // 2% growth per month

    const forecastSales = avgSales * seasonalFactor * trendFactor
    const forecastProcurement = avgProcurement * seasonalFactor * trendFactor

    forecast.push({
      month: monthKey,
      date: forecastDate.toISOString(),
      sales: Math.round(forecastSales),
      procurement: Math.round(forecastProcurement),
      profit: Math.round(forecastSales - forecastProcurement),
      confidence: Math.max(0.5, 0.9 - i * 0.05), // Decreasing confidence over time
    })
  }

  return {
    historical: Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    })),
    forecast,
    summary: {
      avgMonthlySales: Math.round(avgSales),
      avgMonthlyProcurement: Math.round(avgProcurement),
      avgMonthlyProfit: Math.round(avgSales - avgProcurement),
      totalHistoricalMonths: historicalValues.length,
    },
  }
}
