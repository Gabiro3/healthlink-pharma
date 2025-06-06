"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Shield, Download, Filter, Search } from "lucide-react"
import { toast } from "sonner"

interface InsuranceSale {
  sale_id: string
  customer_name: string
  insurance_provider: string
  insurance_amount: number
  total_amount: number
  created_at: string
  user_email: string
}

interface InsuranceReportsProps {
  initialSales: InsuranceSale[]
}

export function InsuranceReports({ initialSales }: InsuranceReportsProps) {
  const [sales, setSales] = useState<InsuranceSale[]>(initialSales)
  const [filteredSales, setFilteredSales] = useState<InsuranceSale[]>(initialSales)
  const [selectedProvider, setSelectedProvider] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Get unique insurance providers
  const insuranceProviders = [...new Set(sales.map((sale) => sale.insurance_provider))].filter(Boolean)

  const applyFilters = () => {
    let filtered = sales

    if (selectedProvider !== "all") {
      filtered = filtered.filter((sale) =>
        sale.insurance_provider.toLowerCase().includes(selectedProvider.toLowerCase()),
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (startDate) {
      filtered = filtered.filter((sale) => new Date(sale.created_at) >= new Date(startDate))
    }

    if (endDate) {
      filtered = filtered.filter((sale) => new Date(sale.created_at) <= new Date(endDate))
    }

    setFilteredSales(filtered)
  }

  const clearFilters = () => {
    setSelectedProvider("all")
    setSearchTerm("")
    setStartDate("")
    setEndDate("")
    setFilteredSales(sales)
  }

  const generateReport = async (provider?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (provider) params.append("provider", provider)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/reports/insurance?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `insurance-report-${provider || "all"}-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("Report generated successfully!")
      } else {
        toast.error("Failed to generate report")
      }
    } catch (error) {
      console.error("Report generation error:", error)
      toast.error("An error occurred while generating the report")
    } finally {
      setIsLoading(false)
    }
  }

  const totalInsuranceAmount = filteredSales.reduce((sum, sale) => sum + sale.insurance_amount, 0)
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Amount</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {totalInsuranceAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rwf {totalSalesAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insuranceProviders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Customer or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="provider">Insurance Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  {insuranceProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={() => generateReport()} disabled={isLoading}>
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate All Report"}
            </Button>
            {selectedProvider !== "all" && (
              <Button variant="outline" onClick={() => generateReport(selectedProvider)} disabled={isLoading}>
                <Download className="w-4 h-4 mr-2" />
                Generate {selectedProvider} Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insurance Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No Insurance Sales Found"
              description="No insurance transactions match your current filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Transaction ID</th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Customer</th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Insurance Provider</th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Insurance Amount</th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Total Amount</th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Recorded By</th>
                    <th className="text-left py-3 px-2 font-medium text-sm text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.sale_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className="font-mono text-sm">#{sale.sale_id.slice(0, 8)}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm">{sale.customer_name}</span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">{sale.insurance_provider}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm">Rwf {sale.insurance_amount.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm">Rwf {sale.total_amount.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm">{sale.user_email}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          <div>{new Date(sale.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(sale.created_at).toLocaleTimeString()}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
