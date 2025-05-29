import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get query parameters
  const url = new URL(request.url)
  const startDate = url.searchParams.get("start_date")
  const endDate = url.searchParams.get("end_date")
  const groupBy = url.searchParams.get("group_by") || "day"

  if (!startDate || !endDate) {
    return NextResponse.json(
      {
        error: "Start date and end date are required",
      },
      { status: 400 },
    )
  }

  // Validate groupBy parameter
  if (!["day", "week", "month"].includes(groupBy)) {
    return NextResponse.json(
      {
        error: "Group by must be one of: day, week, month",
      },
      { status: 400 },
    )
  }

  // Get sales data
  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select(`
      id,
      created_at,
      total_amount,
      payment_method,
      payment_status
    `)
    .gte("created_at", startDate)
    .lte("created_at", `${endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: true })

  if (salesError) {
    return NextResponse.json({ error: salesError.message }, { status: 400 })
  }

  // Group sales by the specified period
  const groupedSales: Record<string, { total: number; count: number }> = {}

  salesData.forEach((sale: any) => {
    const date = new Date(sale.created_at)
    let groupKey: string

    if (groupBy === "day") {
      groupKey = date.toISOString().split("T")[0]
    } else if (groupBy === "week") {
      // Get the week number
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      groupKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`
    } else if (groupBy === "month") {
      groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
    } else {
      groupKey = date.toISOString().split("T")[0]
    }

    if (!groupedSales[groupKey]) {
      groupedSales[groupKey] = { total: 0, count: 0 }
    }

    groupedSales[groupKey].total += sale.total_amount
    groupedSales[groupKey].count += 1
  })

  // Convert to array for easier consumption by charts
  const salesReport = Object.entries(groupedSales).map(([period, data]) => ({
    period,
    total_sales: data.total,
    transaction_count: data.count,
    average_transaction: data.total / data.count,
  }))

  // Get top selling medicines
  const { data: topMedicines, error: medicinesError } = await supabase
    .from("sale_items")
    .select(`
      medicine_id,
      medicines(name),
      quantity,
      total_price,
      sales(created_at)
    `)
    .gte("sales.created_at", startDate)
    .lte("sales.created_at", `${endDate}T23:59:59.999Z`)

  if (medicinesError) {
    return NextResponse.json({ error: medicinesError.message }, { status: 400 })
  }

  // Group by medicine
  const medicineMap: Record<
    string,
    {
      id: string
      name: string
      quantity: number
      revenue: number
    }
  > = {}

  topMedicines.forEach((item: any) => {
    const id = item.medicine_id

    if (!medicineMap[id]) {
      medicineMap[id] = {
        id,
        name: item.medicines.name,
        quantity: 0,
        revenue: 0,
      }
    }

    medicineMap[id].quantity += item.quantity
    medicineMap[id].revenue += item.total_price
  })

  // Convert to array and sort by quantity
  const topSellingMedicines = Object.values(medicineMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  // Calculate summary statistics
  const totalSales = salesData.reduce((sum: number, sale: any) => sum + sale.total_amount, 0)
  const totalTransactions = salesData.length

  // Payment method breakdown
  const paymentMethods: Record<string, { count: number; amount: number }> = {}

  salesData.forEach((sale: any) => {
    const method = sale.payment_method || "unknown"

    if (!paymentMethods[method]) {
      paymentMethods[method] = { count: 0, amount: 0 }
    }

    paymentMethods[method].count += 1
    paymentMethods[method].amount += sale.total_amount
  })

  return NextResponse.json({
    summary: {
      total_sales: totalSales,
      total_transactions: totalTransactions,
      average_transaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
    },
    sales_over_time: salesReport,
    top_selling_medicines: topSellingMedicines,
    payment_methods: Object.entries(paymentMethods).map(([method, data]) => ({
      method,
      transaction_count: data.count,
      total_amount: data.amount,
      percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0,
    })),
  })
}
