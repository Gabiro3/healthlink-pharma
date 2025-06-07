"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, DollarSign, Calendar, Target } from "lucide-react"
import { toast } from "sonner"

interface CreateBudgetFormProps {
  pharmacyId: string
  userId: string
}

interface BudgetForecast {
  month: number
  year: number
  projected_spending: number
  recommended_budget: number
}

export function CreateBudgetForm({ pharmacyId, userId }: CreateBudgetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [forecast, setForecast] = useState<BudgetForecast[]>([])
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    category: "",
    allocated_amount: "",
    description: "",
  })

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  const categories = [
    "Inventory Purchase",
    "Staff Salaries",
    "Utilities",
    "Marketing",
    "Equipment",
    "Maintenance",
    "Insurance",
    "Training",
    "Other",
  ]

  const handleCategoryChange = async (category: string) => {
    setFormData({ ...formData, category })

    if (category) {
      try {
        const response = await fetch(`/api/budget/forecast?pharmacy_id=${pharmacyId}&category=${category}`)
        if (response.ok) {
          const data = await response.json()
          setForecast(data.forecast || [])
        }
      } catch (error) {
        console.error("Error fetching forecast:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          allocated_amount: Number.parseFloat(formData.allocated_amount),
          pharmacy_id: pharmacyId,
          user_id: userId,
        }),
      })

      if (response.ok) {
        toast.success("Budget created successfully!")
        router.push("/budget")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create budget")
      }
    } catch (error) {
      console.error("Error creating budget:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const recommendedAmount = forecast.find(
    (f) => f.month === formData.month && f.year === formData.year,
  )?.recommended_budget

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Budget Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value) => setFormData({ ...formData, year: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={formData.month.toString()}
                    onValueChange={(value) => setFormData({ ...formData, month: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allocated_amount">Allocated Amount (Rwf)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="allocated_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.allocated_amount}
                    onChange={(e) => setFormData({ ...formData, allocated_amount: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
                {recommendedAmount && (
                  <p className="text-sm text-blue-600 mt-1">Recommended: Rwf {recommendedAmount.toLocaleString()}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this budget..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Budget"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Forecast & Recommendations */}
        <div className="space-y-6">
          {/* Budget Forecast */}
          {forecast.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Budget Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {forecast.slice(0, 3).map((item) => (
                    <div
                      key={`${item.year}-${item.month}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {months.find((m) => m.value === item.month)?.label} {item.year}
                        </p>
                        <p className="text-sm text-gray-500">Projected spending</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.projected_spending.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          Rec: ${item.recommended_budget.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Budget Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertDescription>
                    💡 <strong>Tip:</strong> Set aside 10-15% of your budget as a buffer for unexpected expenses.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription>
                    📊 <strong>Forecast:</strong> Our recommendations are based on your historical spending patterns.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription>
                    🎯 <strong>Goal:</strong> Aim to stay within 90% of your allocated budget for optimal financial
                    health.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
