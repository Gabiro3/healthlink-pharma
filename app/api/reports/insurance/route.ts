import { createClient } from "@/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const cookieStore = cookies()
    const supabase = createClient()

    // Get insurance sales data
    const { data, error } = await supabase.rpc("get_insurance_sales_report", {
      p_pharmacy_id: user.pharmacy_id,
      p_insurance_provider: provider,
      p_start_date: startDate,
      p_end_date: endDate,
    })

    if (error) {
      console.error("Error fetching insurance report:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generate PDF report (simplified - you would use a PDF library like jsPDF or Puppeteer)
    const reportData = {
      pharmacy_name: user.pharmacy_name,
      generated_at: new Date().toISOString(),
      provider: provider || "All Providers",
      start_date: startDate,
      end_date: endDate,
      transactions: data,
      total_amount: data.reduce((sum: number, item: any) => sum + item.total_amount, 0),
      total_insurance_amount: data.reduce((sum: number, item: any) => sum + item.insurance_amount, 0),
    }

    // For now, return JSON data - in production, generate actual PDF
    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Insurance report error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
