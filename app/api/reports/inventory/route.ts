import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  // Get inventory summary
  const { data: medicines, error: medicinesError } = await supabase
    .from("medicines")
    .select(`
      *,
      medicine_categories(id, name)
    `)
    .order("name", { ascending: true })

  if (medicinesError) {
    return NextResponse.json({ error: medicinesError.message }, { status: 400 })
  }

  // Calculate inventory value
  const totalInventoryValue = medicines.reduce(
    (sum: number, medicine: any) => sum + medicine.stock_quantity * medicine.unit_price,
    0,
  )

  // Group by category
  const categoryMap: Record<
    string,
    {
      id: string
      name: string
      count: number
      value: number
    }
  > = {}

  medicines.forEach((medicine: any) => {
    const categoryId = medicine.category_id
    const categoryName = medicine.medicine_categories?.name || "Uncategorized"

    if (!categoryMap[categoryId]) {
      categoryMap[categoryId] = {
        id: categoryId,
        name: categoryName,
        count: 0,
        value: 0,
      }
    }

    categoryMap[categoryId].count += 1
    categoryMap[categoryId].value += medicine.stock_quantity * medicine.unit_price
  })

  // Convert to array
  const categorySummary = Object.values(categoryMap)

  // Get low stock items
  const lowStockItems = medicines.filter((medicine: any) => medicine.stock_quantity <= medicine.reorder_level)

  // Get expiring items (within 90 days)
  const today = new Date()
  const ninetyDaysLater = new Date()
  ninetyDaysLater.setDate(today.getDate() + 90)

  const expiringItems = medicines.filter((medicine: any) => {
    if (!medicine.expiry_date) return false

    const expiryDate = new Date(medicine.expiry_date)
    return expiryDate <= ninetyDaysLater && expiryDate >= today && medicine.stock_quantity > 0
  })

  // Get recent inventory transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from("inventory_transactions")
    .select(`
      *,
      medicines(name)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  if (transactionsError) {
    return NextResponse.json({ error: transactionsError.message }, { status: 400 })
  }

  return NextResponse.json({
    summary: {
      total_medicines: medicines.length,
      total_inventory_value: totalInventoryValue,
      low_stock_count: lowStockItems.length,
      expiring_soon_count: expiringItems.length,
    },
    category_summary: categorySummary,
    low_stock_items: lowStockItems.slice(0, 10), // Limit to 10 items
    expiring_items: expiringItems.slice(0, 10), // Limit to 10 items
    recent_transactions: transactions,
  })
}
