"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface ForecastData {
  period: string
  actual?: number
  predicted: number
  confidence_lower: number
  confidence_upper: number
  accuracy?: number
}

interface SeasonalPattern {
  month: string
  seasonal_factor: number
  trend: "up" | "down" | "stable"
}

interface SalesForecastProps {
  forecastData: ForecastData[]
  seasonalPatterns: SeasonalPattern[]
  modelAccuracy: number
  lastUpdated: string
}

export function SalesForecast({ forecastData, seasonalPatterns, modelAccuracy, lastUpdated }: SalesForecastProps) {
  const [forecastPeriod, setForecastPeriod] = useState("3months")
  const [activeTab, setActiveTab] = useState("forecast")

  const filteredForecast = forecastData.filter((_, index) => {
    switch (forecastPeriod) {
      case "1month":
        return index < 4
      case "3months":
        return index < 12
      case "6months":
        return index < 24
      case "1year":
        return index < 52
      default:
        return true
    }
  })

  const totalPredicted = filteredForecast.reduce((sum, item) => sum + item.predicted, 0)
  const avgConfidence =
    filteredForecast.reduce((sum, item) => sum + (item.confidence_upper - item.confidence_lower) / item.predicted, 0) /
    filteredForecast.length

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "bg-green-100 text-green-800"
    if (accuracy >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return TrendingUp
      case "down":
        return TrendingDown
      default:
        return BarChart3
    }
  }

  const maxValue = Math.max(...filteredForecast.map((d) => Math.max(d.predicted, d.confidence_upper)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Forecasting</h2>
          <p className="text-gray-600">SARIMA-based sales predictions and seasonal analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Model
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelAccuracy.toFixed(1)}%</div>
            <Badge className={getAccuracyColor(modelAccuracy)} variant="secondary">
              {modelAccuracy >= 90 ? "Excellent" : modelAccuracy >= 80 ? "Good" : "Needs Improvement"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPredicted.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Next {forecastPeriod.replace(/\d+/, (match) => match + " ")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((1 - avgConfidence) * 100).toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Average prediction confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="w-4 h-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{new Date(lastUpdated).toLocaleDateString()}</div>
            <p className="text-xs text-gray-500">Model training date</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Forecast Chart</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Forecast with Confidence Intervals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chart Legend */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span>Predicted Sales</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
                    <span>Confidence Interval</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span>Actual Sales</span>
                  </div>
                </div>

                {/* Simple Bar Chart */}
                <div className="space-y-3">
                  {filteredForecast.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.period}</span>
                        <span>${item.predicted.toLocaleString()}</span>
                      </div>
                      <div className="relative h-8 bg-gray-100 rounded">
                        {/* Confidence Interval */}
                        <div
                          className="absolute h-full bg-blue-200 rounded"
                          style={{
                            width: `${(item.confidence_upper / maxValue) * 100}%`,
                            left: `${(item.confidence_lower / maxValue) * 100}%`,
                          }}
                        />
                        {/* Predicted Value */}
                        <div
                          className="absolute h-full bg-blue-500 rounded"
                          style={{ width: `${(item.predicted / maxValue) * 100}%` }}
                        />
                        {/* Actual Value (if available) */}
                        {item.actual && (
                          <div
                            className="absolute h-full bg-green-500 rounded"
                            style={{ width: `${(item.actual / maxValue) * 100}%` }}
                          />
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Range: ${item.confidence_lower.toLocaleString()} - ${item.confidence_upper.toLocaleString()}
                        </span>
                        {item.actual && <span>Actual: ${item.actual.toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Patterns Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {seasonalPatterns.map((pattern, index) => {
                  const TrendIcon = getTrendIcon(pattern.trend)

                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{pattern.month}</h3>
                        <TrendIcon
                          className={`w-4 h-4 ${
                            pattern.trend === "up"
                              ? "text-green-500"
                              : pattern.trend === "down"
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Seasonal Factor</span>
                          <span className="text-sm font-medium">{pattern.seasonal_factor.toFixed(2)}x</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              pattern.seasonal_factor > 1 ? "bg-green-500" : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(pattern.seasonal_factor * 50, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">
                          {pattern.seasonal_factor > 1 ? "Above" : "Below"} average sales period
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Strong Seasonal Pattern</p>
                    <p className="text-xs text-green-600">
                      December shows 1.8x higher sales than average, plan inventory accordingly
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Upward Trend</p>
                    <p className="text-xs text-blue-600">Overall sales trend is positive with 12% growth projected</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">High Model Accuracy</p>
                    <p className="text-xs text-purple-600">
                      SARIMA model shows {modelAccuracy}% accuracy on historical data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">Inventory Planning</p>
                    <p className="text-xs text-orange-600">Increase stock levels by 25% for Q4 seasonal demand</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Staff Scheduling</p>
                    <p className="text-xs text-yellow-600">Plan additional staff during peak months (Nov-Jan)</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Low Season Strategy</p>
                    <p className="text-xs text-red-600">Consider promotions during low-demand periods (Feb-Apr)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
