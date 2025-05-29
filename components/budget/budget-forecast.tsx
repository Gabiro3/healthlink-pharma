"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/lib/contexts/currency-context"
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, BarChart3 } from "lucide-react"

interface BudgetForecastProps {
  budgetData: {
    total_budget: number
    allocations: any[]
    start_date: string
    end_date: string
  }
  forecastData: any
}

export function BudgetForecast({ budgetData, forecastData }: BudgetForecastProps) {
  const { formatAmount } = useCurrency()
  const [forecastPeriod, setForecastPeriod] = useState("12")
  const [localForecastData, setLocalForecastData] = useState(forecastData)

  useEffect(() => {
    if (forecastData) {
      setLocalForecastData(forecastData)
    }
  }, [forecastData])

  const generateForecast = async () => {
    try {
      const response = await fetch(`/api/budget/forecast?months=${forecastPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setLocalForecastData(data)
      }
    } catch (error) {
      console.error("Error generating forecast:", error)
    }
  }

  if (!localForecastData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget Forecast
          </CardTitle>
          <CardDescription>AI-powered financial forecasting and trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Loading forecast data...</p>
            <Button onClick={generateForecast} className="mt-4">
              Generate Forecast
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { historical = [], forecast = [], summary = {} } = localForecastData

  // Prepare chart data
  const chartData = [
    ...historical.map((item: any) => ({
      month: item.month,
      sales: item.sales || 0,
      procurement: item.procurement || 0,
      profit: item.profit || 0,
      type: "historical",
    })),
    ...forecast.map((item: any) => ({
      month: item.month,
      sales: item.sales || 0,
      procurement: item.procurement || 0,
      profit: item.profit || 0,
      confidence: item.confidence || 0,
      type: "forecast",
    })),
  ]

  // Calculate trends
  const salesTrend =
    forecast.length > 1
      ? (((forecast[forecast.length - 1]?.sales || 0) - (forecast[0]?.sales || 0)) / (forecast[0]?.sales || 1)) * 100
      : 0

  const profitTrend =
    forecast.length > 1
      ? (((forecast[forecast.length - 1]?.profit || 0) - (forecast[0]?.profit || 0)) /
          Math.abs(forecast[0]?.profit || 1)) *
        100
      : 0

  return (
    <div className="space-y-6">
      {/* Forecast Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget Forecast & Analytics
          </CardTitle>
          <CardDescription>AI-powered financial forecasting based on historical data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Forecast Period:</span>
            </div>
            <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateForecast} size="sm">
              Update Forecast
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Monthly Sales</p>
                    <p className="text-lg font-bold">{formatAmount(summary.avgMonthlySales || 0)}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Monthly Costs</p>
                    <p className="text-lg font-bold">{formatAmount(summary.avgMonthlyProcurement || 0)}</p>
                  </div>
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Monthly Profit</p>
                    <p className="text-lg font-bold">{formatAmount(summary.avgMonthlyProfit || 0)}</p>
                  </div>
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Data Points</p>
                    <p className="text-lg font-bold">{summary.totalHistoricalMonths || 0}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Trend Analysis</CardTitle>
          <CardDescription>Historical data and future projections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatAmount(value)} />
                <Tooltip
                  formatter={(value, name) => [formatAmount(Number(value)), name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Sales"
                />
                <Area
                  type="monotone"
                  dataKey="procurement"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Procurement"
                />
                <Line type="monotone" dataKey="profit" stroke="#ff7300" strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">
                {salesTrend > 0 ? "+" : ""}
                {salesTrend.toFixed(1)}%
              </span>
              <Badge variant={salesTrend > 0 ? "default" : "destructive"}>
                {salesTrend > 0 ? "Growing" : "Declining"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Projected sales trend over the next {forecastPeriod} months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Profit Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">
                {profitTrend > 0 ? "+" : ""}
                {profitTrend.toFixed(1)}%
              </span>
              <Badge variant={profitTrend > 0 ? "default" : "destructive"}>
                {profitTrend > 0 ? "Improving" : "Declining"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Projected profit margin trend over the next {forecastPeriod} months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Forecast Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {salesTrend < -10 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Sales Decline Alert</span>
              </div>
              <p className="text-sm text-red-700">
                Sales are projected to decline by {Math.abs(salesTrend).toFixed(1)}%. Consider reviewing your marketing
                strategy and product mix.
              </p>
            </div>
          )}

          {profitTrend < -15 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Profit Margin Warning</span>
              </div>
              <p className="text-sm text-yellow-700">
                Profit margins are projected to decrease. Review procurement costs and pricing strategies.
              </p>
            </div>
          )}

          {salesTrend > 15 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Growth Opportunity</span>
              </div>
              <p className="text-sm text-green-700">
                Strong sales growth projected ({salesTrend.toFixed(1)}%). Consider increasing inventory and expanding
                product lines.
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Budget Recommendation</span>
            </div>
            <p className="text-sm text-blue-700">
              Based on forecast data, consider allocating {formatAmount(summary.avgMonthlySales * 0.7)} monthly for
              procurement to maintain optimal inventory levels.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
