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
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] })
    }

    const cookieStore = cookies()
    const supabase = createClient()

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("pharmacy_id", user.pharmacy_id)
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,sku.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error("Product search error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add status based on stock levels
    const productsWithStatus = products.map((product) => ({
      ...product,
      status:
        product.stock_quantity === 0
          ? "out_of_stock"
          : product.stock_quantity <= product.reorder_level
            ? "low_stock"
            : "active",
    }))

    return NextResponse.json({ products: productsWithStatus })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
