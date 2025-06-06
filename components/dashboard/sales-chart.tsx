"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SalesChartProps {
  data: Array<{
    period: string
    sales: number
  }>
  totalRevenue: number
  revenueChange: number
}

export function SalesChart({ data, totalRevenue, revenueChange }: SalesChartProps) {
  const maxSales = Math.max(...data.map((d) => d.sales))

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales Analytics</CardTitle>
          <Badge variant="outline">This Month</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">Rwf {totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <Badge variant={revenueChange >= 0 ? "default" : "destructive"} className="text-xs">
                  {revenueChange > 0 ? "+" : ""}
                  {revenueChange}%
                </Badge>
                <span className="text-xs text-gray-500 ml-2">Since last week</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end space-x-2 h-32">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-teal-600 rounded-t-sm transition-all duration-300 hover:bg-teal-700"
                  style={{
                    height: `${(item.sales / maxSales) * 100}%`,
                    minHeight: "4px",
                  }}
                />
                <span className="text-xs text-gray-500 mt-2">{item.period}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
