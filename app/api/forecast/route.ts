import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get query parameters
  const url = new URL(request.url)
  const medicineId = url.searchParams.get("medicine_id")

  if (!medicineId) {
    return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 })
  }

  // Get the latest forecast for the medicine
  const { data, error } = await supabase
    .from("sales_forecasts")
    .select("*")
    .eq("medicine_id", medicineId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "No rows returned" error
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // If no forecast exists, return empty data
  if (!data) {
    return NextResponse.json({ data: null })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    const { medicine_id, period } = await request.json()

    if (!medicine_id || !period) {
      return NextResponse.json(
        {
          error: "Medicine ID and forecast period are required",
        },
        { status: 400 },
      )
    }

    // Call the forecast function (this would be implemented as a server-side function)
    const forecastData = await generateForecast(supabase, medicine_id, period)

    // Save the forecast to the database
    const { data, error } = await supabase.from("sales_forecasts").insert(forecastData).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid request data" }, { status: 400 })
  }
}

// This function would be implemented with a proper time series forecasting library
// For now, we'll create a simple mock implementation
async function generateForecast(supabase: any, medicineId: string, period: string) {
  // Get historical sales data
  const { data: salesData, error } = await supabase
    .from("sale_items")
    .select(`
      sale_id,
      quantity,
      sales(created_at)
    `)
    .eq("medicine_id", medicineId)
    .order("sales(created_at)", { ascending: true })

  if (error) {
    throw new Error(`Error fetching sales data: ${error.message}`)
  }

  // Group sales by month
  const monthlySales: Record<string, number> = {}

  salesData.forEach((item: any) => {
    const date = new Date(item.sales.created_at)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`

    if (!monthlySales[monthKey]) {
      monthlySales[monthKey] = 0
    }

    monthlySales[monthKey] += item.quantity
  })

  // Convert to array for calculations
  const salesArray = Object.values(monthlySales)

  // Simple forecasting logic (in a real app, this would use SARIMA/SARIMAX)
  // For now, we'll use a simple moving average
  let forecastedQuantity = 0

  if (salesArray.length > 0) {
    const sum = salesArray.reduce((a, b) => a + b, 0)
    const avg = sum / salesArray.length

    // Add some randomness to simulate a forecast
    const randomFactor = 0.8 + Math.random() * 0.4 // Random factor between 0.8 and 1.2
    forecastedQuantity = Math.round(avg * randomFactor)
  } else {
    // No historical data, set a default value
    forecastedQuantity = 10
  }

  // Calculate date range for the forecast
  const today = new Date()
  const startDate = today.toISOString().split("T")[0]

  const endDate = new Date()
  if (period === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1)
  } else if (period === "quarterly") {
    endDate.setMonth(endDate.getMonth() + 3)
  } else if (period === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1)
  }

  return {
    medicine_id: medicineId,
    start_date: startDate,
    end_date: endDate.toISOString().split("T")[0],
    forecast_period: period,
    forecasted_quantity: forecastedQuantity,
    confidence_level: 0.85, // Mock confidence level
    created_at: new Date().toISOString(),
  }
}
