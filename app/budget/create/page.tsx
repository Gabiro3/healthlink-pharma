"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, addMonths } from "date-fns"
import { toast } from "sonner"
import { ArrowLeft, Save, Calculator, Plus, Trash2, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

import { BudgetAllocationTable } from "@/components/budget/budget-allocation-table"
import { BudgetVisualization } from "@/components/budget/budget-visualization"
import { BudgetForecast } from "@/components/budget/budget-forecast"
import { BudgetAlerts } from "@/components/budget/budget-alerts"
import { useCurrency } from "@/lib/contexts/currency-context"
import { createBudgetPlan } from "@/lib/services/budget-service"
import type { MedicineCategory } from "@/lib/types"

const budgetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  total_budget: z.number().min(0.01, "Budget must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  status: z.enum(["draft", "active", "completed", "cancelled"]),
  notes: z.string().optional(),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetAllocation {
  category_id: string
  category_name: string
  allocated_amount: number
  percentage: number
  notes?: string
}

interface BudgetGoal {
  id: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string
  priority: "high" | "medium" | "low"
}

export default function CreateBudgetPage() {
  const router = useRouter()
  const { currentCurrency, formatAmount } = useCurrency()
  const [categories, setCategories] = useState<MedicineCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([])
  const [goals, setGoals] = useState<BudgetGoal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [forecastData, setForecastData] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      title: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
      total_budget: 0,
      currency: currentCurrency,
      status: "draft",
      notes: "",
    },
  })

  const watchedBudget = form.watch("total_budget")
  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.allocated_amount, 0)
  const remainingBudget = watchedBudget - totalAllocated
  const allocationPercentage = watchedBudget > 0 ? (totalAllocated / watchedBudget) * 100 : 0

  useEffect(() => {
    fetchCategories()
    generateForecast()
    checkBudgetAlerts()
  }, [])

  useEffect(() => {
    // Update allocation percentages when budget changes
    if (watchedBudget > 0) {
      setAllocations((prev) =>
        prev.map((allocation) => ({
          ...allocation,
          percentage: (allocation.allocated_amount / watchedBudget) * 100,
        })),
      )
    }
  }, [watchedBudget])

  async function fetchCategories() {
    setCategoriesLoading(true)
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      } else {
        setCategories([])
        toast.error("Failed to load categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
      toast.error("Failed to load categories")
    } finally {
      setCategoriesLoading(false)
    }
  }

  async function generateForecast() {
    try {
      const response = await fetch("/api/budget/forecast")
      if (response.ok) {
        const data = await response.json()
        setForecastData(data)
      }
    } catch (error) {
      console.error("Error generating forecast:", error)
    }
  }

  function checkBudgetAlerts() {
    const newAlerts = []

    // Check for over-allocation
    if (allocationPercentage > 100) {
      newAlerts.push({
        type: "error",
        title: "Budget Over-allocated",
        message: `You have allocated ${allocationPercentage.toFixed(1)}% of your budget. Please reduce allocations.`,
      })
    }

    // Check for under-allocation
    if (allocationPercentage < 80 && watchedBudget > 0) {
      newAlerts.push({
        type: "warning",
        title: "Budget Under-allocated",
        message: `Only ${allocationPercentage.toFixed(1)}% of your budget is allocated. Consider allocating more funds.`,
      })
    }

    // Check for unbalanced allocations
    const maxAllocation = Math.max(...allocations.map((a) => a.percentage))
    if (maxAllocation > 50) {
      newAlerts.push({
        type: "info",
        title: "Unbalanced Allocation",
        message: "One category has more than 50% of the budget. Consider diversifying allocations.",
      })
    }

    setAlerts(newAlerts)
  }

  useEffect(() => {
    checkBudgetAlerts()
  }, [allocations, allocationPercentage, watchedBudget])

  function addAllocation() {
    if (!Array.isArray(categories) || categories.length === 0) {
      toast.error("No categories available. Please wait for categories to load.")
      return
    }

    const availableCategories = categories.filter((cat) => !allocations.find((alloc) => alloc.category_id === cat.id))

    if (availableCategories.length === 0) {
      toast.error("All categories have been allocated")
      return
    }

    const newAllocation: BudgetAllocation = {
      category_id: availableCategories[0].id,
      category_name: availableCategories[0].name,
      allocated_amount: 0,
      percentage: 0,
      notes: "",
    }

    setAllocations([...allocations, newAllocation])
  }

  function updateAllocation(index: number, field: keyof BudgetAllocation, value: any) {
    const updated = [...allocations]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "allocated_amount" && watchedBudget > 0) {
      updated[index].percentage = (value / watchedBudget) * 100
    }

    if (field === "category_id") {
      const category = categories.find((cat) => cat.id === value)
      if (category) {
        updated[index].category_name = category.name
      }
    }

    setAllocations(updated)
  }

  function removeAllocation(index: number) {
    setAllocations(allocations.filter((_, i) => i !== index))
  }

  function addGoal() {
    const newGoal: BudgetGoal = {
      id: Date.now().toString(),
      title: "",
      target_amount: 0,
      current_amount: 0,
      deadline: format(addMonths(new Date(), 6), "yyyy-MM-dd"),
      priority: "medium",
    }
    setGoals([...goals, newGoal])
  }

  function updateGoal(index: number, field: keyof BudgetGoal, value: any) {
    const updated = [...goals]
    updated[index] = { ...updated[index], [field]: value }
    setGoals(updated)
  }

  function removeGoal(index: number) {
    setGoals(goals.filter((_, i) => i !== index))
  }

  async function onSubmit(data: BudgetFormData) {
    // Validate allocations
    if (!Array.isArray(allocations) || allocations.length === 0) {
      toast.error("Please add at least one budget allocation")
      return
    }

    if (allocationPercentage > 100) {
      toast.error("Total allocations exceed budget. Please adjust allocations.")
      return
    }

    // Validate total budget
    if (!data.total_budget || data.total_budget <= 0) {
      toast.error("Please enter a valid total budget amount")
      return
    }

    // Validate dates
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      toast.error("End date must be after start date")
      return
    }

    setIsLoading(true)
    try {
      const result = await createBudgetPlan(
        { ...data, notes: data.notes ?? null },
        allocations.map((allocation) => ({
          ...allocation,
          currency: data.currency,
          notes: allocation.notes ?? null,
        }))
      )
      if (result) {
        toast.success("Budget plan created successfully")
        router.push("/budget")
      } else {
        toast.error("Failed to create budget plan. Please try again.")
      }
    } catch (error) {
      console.error("Error creating budget:", error)
      toast.error("An error occurred while creating the budget plan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Budget Plan</h1>
          <p className="text-muted-foreground">Design a comprehensive budget for your pharmacy operations</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="allocations">Allocations</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Budget Details
                  </CardTitle>
                  <CardDescription>Set up the basic information for your budget plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Q1 2024 Budget" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="total_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Budget</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes about this budget plan..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Budget Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatAmount(watchedBudget)}</div>
                      <div className="text-sm text-blue-600">Total Budget</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatAmount(totalAllocated)}</div>
                      <div className="text-sm text-green-600">Allocated</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{formatAmount(remainingBudget)}</div>
                      <div className="text-sm text-orange-600">Remaining</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Allocation Progress</span>
                      <span>{allocationPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={allocationPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget Allocations Tab */}
            <TabsContent value="allocations" className="space-y-6">
              <BudgetAlerts alerts={alerts} />

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Budget Allocations</CardTitle>
                    <CardDescription>Distribute your budget across different categories</CardDescription>
                  </div>
                  <Button onClick={addAllocation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </CardHeader>
                <CardContent>
                  <BudgetAllocationTable
                    allocations={allocations}
                    categories={categories}
                    totalBudget={watchedBudget}
                    onUpdateAllocation={updateAllocation}
                    onRemoveAllocation={removeAllocation}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Budget Goals
                    </CardTitle>
                    <CardDescription>Set specific financial targets and milestones</CardDescription>
                  </div>
                  <Button onClick={addGoal} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No goals set yet. Add your first financial goal to get started.</p>
                    </div>
                  ) : (
                    goals.map((goal, index) => (
                      <Card key={goal.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div>
                            <Label>Goal Title</Label>
                            <Input
                              placeholder="e.g., Emergency Fund"
                              value={goal.title}
                              onChange={(e) => updateGoal(index, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Target Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={goal.target_amount}
                              onChange={(e) =>
                                updateGoal(index, "target_amount", Number.parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div>
                            <Label>Deadline</Label>
                            <Input
                              type="date"
                              value={goal.deadline}
                              onChange={(e) => updateGoal(index, "deadline", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select
                              value={goal.priority}
                              onValueChange={(value) => updateGoal(index, "priority", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="outline" size="icon" onClick={() => removeGoal(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>
                              {formatAmount(goal.current_amount)} / {formatAmount(goal.target_amount)}
                            </span>
                          </div>
                          <Progress
                            value={goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visualization Tab */}
            <TabsContent value="visualization" className="space-y-6">
              <BudgetVisualization allocations={allocations} totalBudget={watchedBudget} goals={goals} />
            </TabsContent>

            {/* Forecast Tab */}
            <TabsContent value="forecast" className="space-y-6">
              <BudgetForecast
                budgetData={{
                  total_budget: watchedBudget,
                  allocations,
                  start_date: form.watch("start_date"),
                  end_date: form.watch("end_date"),
                }}
                forecastData={forecastData}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => form.setValue("status", "draft")}>
                Save as Draft
              </Button>
              <Button type="submit" disabled={isLoading} onClick={() => onSubmit(form.getValues())}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
