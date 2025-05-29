"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, CreditCard, DollarSign, Download, Filter, Search, TrendingUp, Wallet } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import { CurrencySelector } from "@/components/currency-selector"
import { TableSkeleton } from "@/components/loading-skeleton"
import { EmptyState } from "@/components/emtpy-state"
import { useCurrency } from "@/lib/contexts/currency-context"
import { getSupabaseClient } from "@/lib/supabase-client"

interface PaymentData {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  payment_method: string
  payment_status: string
  currency: string
  created_at: string
  patients?: {
    name: string
  }
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  pendingAmount: number
  completedPayments: number
}

export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedPayments: 0,
  })
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to?: Date | undefined
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { currentCurrency, formatAmount, convertAmount } = useCurrency()
  const supabase = getSupabaseClient()

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const startDate = dateRange.from?.toISOString().split("T")[0]
      const endDate = dateRange.to?.toISOString().split("T")[0]

      let query = supabase
        .from("sales")
        .select(`
          id,
          invoice_number,
          customer_name,
          total_amount,
          payment_method,
          payment_status,
          currency,
          created_at,
          patients(name)
        `)
        .order("created_at", { ascending: false })

      if (startDate) {
        query = query.gte("created_at", startDate)
      }

      if (endDate) {
        const nextDay = new Date(endDate)
        nextDay.setDate(nextDay.getDate() + 1)
        query = query.lt("created_at", nextDay.toISOString().split("T")[0])
      }

      const { data, error } = await query

      if (error) throw error

      const paymentsData = (data || []).map((payment: any) => ({
        ...payment,
        patients: payment.patients && Array.isArray(payment.patients) ? payment.patients[0] : payment.patients,
      }))
      setPayments(paymentsData)

      // Calculate stats
      const totalPayments = paymentsData.length
      const totalAmount = paymentsData.reduce(
        (sum, payment) => sum + convertAmount(payment.total_amount, payment.currency as any),
        0,
      )
      const pendingAmount = paymentsData
        .filter((p) => p.payment_status === "pending")
        .reduce((sum, payment) => sum + convertAmount(payment.total_amount, payment.currency as any), 0)
      const completedPayments = paymentsData.filter((p) => p.payment_status === "paid").length

      setStats({
        totalPayments,
        totalAmount,
        pendingAmount,
        completedPayments,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [dateRange, currentCurrency])

  const filteredPayments = payments.filter(
    (payment) =>
      payment.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.patients?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <Wallet className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout title="Payments" subtitle="Track and manage payment transactions" onRefresh={fetchPayments}>
      <div className="grid gap-6">
        {/* Filters and Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DateRangePicker
              date={dateRange}
              onDateChange={(date) => setDateRange(date ?? { from: undefined, to: undefined })}
            />
          </div>
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-[#004d40] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <div className="rounded-full bg-white/10 p-2">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</div>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-white/80">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  5.2%
                </span>
                <span className="ml-1 text-white/60">Since last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-green-500">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  3.1%
                </span>
                <span className="ml-1 text-muted-foreground">Since last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                <CreditCard className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedPayments}</div>
              <div className="text-xs text-muted-foreground">
                {((stats.completedPayments / stats.totalPayments) * 100 || 0).toFixed(1)}% completion rate
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <div className="rounded-full bg-yellow-100 p-2">
                <Wallet className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.pendingAmount)}</div>
              <div className="text-xs text-muted-foreground">
                {((stats.pendingAmount / stats.totalAmount) * 100 || 0).toFixed(1)}% of total
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton rows={10} columns={7} />
            ) : filteredPayments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No payments found"
                description="No payment transactions match your current filters."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        #{payment.invoice_number?.slice(-6) || payment.id.slice(0, 6)}
                      </TableCell>
                      <TableCell>{payment.customer_name || payment.patients?.name || "Walk-in Customer"}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(convertAmount(payment.total_amount, payment.currency as any))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="capitalize">{payment.payment_method.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.payment_status)}</TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
