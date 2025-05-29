import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { generateSARIMAForecast, type TimeSeriesData } from "@/lib/sarima-forecast"

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  try {
    const { medicine_id, period_days = 30, confidence_level = 0.95 } = await request.json()

    if (!medicine_id) {
      return NextResponse.json(
        {
          error: "Medicine ID is required",
        },
        { status: 400 },
      )
    }

    // Get historical sales data
    const { data: salesData, error } = await supabase
      .from("sale_items")
      .select(`
        quantity,
        sales(created_at)
      `)
      .eq("medicine_id", medicine_id)
      .order("sales(created_at)", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Group sales by day
    const dailySales: Record<string, number> = {}

    salesData.forEach((item: any) => {
      const date = new Date(item.sales.created_at).toISOString().split("T")[0]

      if (!dailySales[date]) {
        dailySales[date] = 0
      }

      dailySales[date] += item.quantity
    })

    // Convert to time series format
    const timeSeriesData: TimeSeriesData[] = Object.entries(dailySales).map(([date, value]) => ({ date, value }))

    // If we don't have enough data, return an error
    if (timeSeriesData.length < 7) {
      return NextResponse.json(
        {
          error: "Not enough historical data for forecasting. Need at least 7 days of sales data.",
        },
        { status: 400 },
      )
    }

    // Generate forecast
    const forecastResult = await generateSARIMAForecast(timeSeriesData, period_days, confidence_level)

    // Calculate total forecasted quantity
    const totalForecastedQuantity = forecastResult.forecast.reduce((sum, item) => sum + item.value, 0)

    // Save forecast to database
    const { data: medicine, error: medicineError } = await supabase
      .from("medicines")
      .select("name")
      .eq("id", medicine_id)
      .single()

    if (medicineError) {
      return NextResponse.json({ error: medicineError.message }, { status: 400 })
    }

    const startDate = forecastResult.forecast[0].date
    const endDate = forecastResult.forecast[forecastResult.forecast.length - 1].date

    const { data: forecastData, error: forecastError } = await supabase
      .from("sales_forecasts")
      .insert({
        medicine_id,
        start_date: startDate,
        end_date: endDate,
        forecast_period: `${period_days} days`,
        forecasted_quantity: totalForecastedQuantity,
        confidence_level,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (forecastError) {
      return NextResponse.json({ error: forecastError.message }, { status: 400 })
    }

    return NextResponse.json({
      forecast: forecastResult,
      summary: {
        medicine_id,
        medicine_name: medicine.name,
        period: `${startDate} to ${endDate}`,
        total_forecasted_quantity: totalForecastedQuantity,
        confidence_level,
        forecast_id: forecastData.id,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Error generating forecast",
      },
      { status: 400 },
    )
  }
}
