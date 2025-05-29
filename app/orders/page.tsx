"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUp, Download, Eye, Filter, MoreHorizontal, Plus, Search, ShoppingCart } from "lucide-react"
import { AddOrderDialog } from "@/components/orders/add-order-dialog"
import { ViewOrderDialog } from "@/components/orders/view-order-dialog"

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Fetch orders
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          patients(id, name),
          sale_items(
            id,
            medicine_id,
            quantity,
            unit_price,
            total_price,
            medicines(id, name)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Calculate stats
      const totalOrders = data?.length || 0
      const completedOrders = data?.filter((o) => o.payment_status === "paid").length || 0
      const pendingOrders = data?.filter((o) => o.payment_status === "pending").length || 0
      const cancelledOrders = data?.filter((o) => o.payment_status === "cancelled").length || 0
      const totalRevenue = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      setOrders(data || [])
      setStats({
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleAddOrder = async (orderData: any) => {
    try {
      // Create the sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          customer_name: orderData.customer_name,
          patient_id: orderData.patient_id,
          prescription_id: orderData.prescription_id,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          created_by: orderData.created_by,
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = orderData.items.map((item: any) => ({
        sale_id: saleData.id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

      if (itemsError) throw itemsError

      // Update medicine stock quantities
      for (const item of orderData.items) {
        const { data: medicine, error: medicineError } = await supabase
          .from("medicines")
          .select("stock_quantity")
          .eq("id", item.medicine_id)
          .single()

        if (medicineError) continue

        const newQuantity = medicine.stock_quantity - item.quantity

        await supabase.from("medicines").update({ stock_quantity: newQuantity }).eq("id", item.medicine_id)
      }

      toast({
        title: "Success",
        description: "Order added successfully",
      })

      fetchOrders()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add order",
        variant: "destructive",
      })
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patients?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <DashboardLayout title="Order List" subtitle="Let's check your pharmacy today" onRefresh={fetchOrders}>
      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-[#004d40] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <div className="rounded-full bg-white/10 p-2">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
              <div className="mt-1 flex items-center text-xs">
                <span className="flex items-center text-white/80">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  2.3%
                </span>
                <span className="ml-1 text-white/60">Since last week</span>
              </div>
              <div className="mt-2 text-xs text-white/80">
                Revenue Generated: ${stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <ShoppingCart className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
              <div className="mt-1 flex items-center text-xs">
                <span className="flex items-center text-green-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  4.7%
                </span>
                <span className="ml-1 text-muted-foreground">Since last week</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Revenue: ${(stats.totalRevenue * 0.8).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <div className="rounded-full bg-yellow-100 p-2">
                <ShoppingCart className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <div className="mt-1 flex items-center text-xs">
                <span className="flex items-center text-green-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  2.1%
                </span>
                <span className="ml-1 text-muted-foreground">Since last week</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Approx. Revenue: ${(stats.totalRevenue * 0.2).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
              <div className="rounded-full bg-red-100 p-2">
                <ShoppingCart className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelledOrders}</div>
              <div className="mt-1 flex items-center text-xs">
                <span className="flex items-center text-red-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  0.3%
                </span>
                <span className="ml-1 text-muted-foreground">Since last week</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Lost Revenue: ${(stats.totalRevenue * 0.05).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1 bg-[#004d40] hover:bg-[#00695c]"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Order</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Products Ordered</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.invoice_number || order.id.slice(0, 6)}</TableCell>
                    <TableCell>{order.customer_name || order.patients?.name || "Unknown"}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      {order.sale_items?.map((item: any, index: number) => (
                        <div key={item.id} className="text-xs">
                          {item.medicines?.name} ({item.quantity}){index < order.sale_items.length - 1 && ", "}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.payment_status === "paid"
                          ? "Completed"
                          : order.payment_status === "pending"
                            ? "Processing"
                            : "Cancelled"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddOrderDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSubmit={handleAddOrder} />

      {selectedOrder && (
        <ViewOrderDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} order={selectedOrder} />
      )}
    </DashboardLayout>
  )
}
