"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { LineChart } from "@/components/charts/line-chart"
import { Loader2 } from "lucide-react"

interface SalesForecastDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: any
}

export function SalesForecastDialog({ open, onOpenChange, medicine }: SalesForecastDialogProps) {
  const [forecastPeriod, setForecastPeriod] = useState("30")
  const [isLoading, setIsLoading] = useState(false)
  const [forecastData, setForecastData] = useState<any>(null)
  const { toast } = useToast()

  const generateForecast = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/forecast/sarima", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicine_id: medicine.id,
          period_days: Number.parseInt(forecastPeriod),
          confidence_level: 0.95,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate forecast")
      }

      // Process forecast data for chart
      const chartData = result.forecast.forecast.map((item: any) => ({
        name: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        total: item.value,
      }))

      setForecastData({
        chart: chartData,
        summary: result.summary,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate forecast",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sales Forecast - {medicine.name}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={forecastPeriod} onValueChange={setForecastPeriod} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select forecast period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateForecast} disabled={isLoading} className="bg-[#004d40] hover:bg-[#00695c]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Forecast"
              )}
            </Button>
          </div>

          {forecastData ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium">Forecast Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium">{forecastData.summary.period}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Forecasted Quantity</p>
                    <p className="font-medium">{forecastData.summary.total_forecasted_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confidence Level</p>
                    <p className="font-medium">{forecastData.summary.confidence_level * 100}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Medicine</p>
                    <p className="font-medium">{forecastData.summary.medicine_name}</p>
                  </div>
                </div>
              </div>

              <div className="h-[300px]">
                <LineChart data={forecastData.chart} />
              </div>

              <div className="rounded-lg border bg-gray-50 p-4 text-sm">
                <h3 className="mb-2 font-medium">Forecast Insights</h3>
                <p className="text-muted-foreground">
                  Based on historical sales data, we predict that {medicine.name} will sell approximately{" "}
                  {forecastData.summary.total_forecasted_quantity} units over the next {forecastPeriod} days. This
                  forecast has a confidence level of {forecastData.summary.confidence_level * 100}%.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Consider adjusting your inventory levels to ensure adequate stock is available to meet the forecasted
                  demand.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center text-muted-foreground">
                <p>Select a forecast period and click "Generate Forecast"</p>
                <p className="text-sm">The forecast will be generated using SARIMA/SARIMAX time series analysis</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
