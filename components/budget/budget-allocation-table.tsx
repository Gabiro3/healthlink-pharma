"use client"

import { useState } from "react"
import { Trash2, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useCurrency } from "@/lib/contexts/currency-context"
import type { MedicineCategory } from "@/lib/types"

interface BudgetAllocation {
  category_id: string
  category_name: string
  allocated_amount: number
  percentage: number
  notes?: string
}

interface BudgetAllocationTableProps {
  allocations: BudgetAllocation[]
  categories: MedicineCategory[]
  totalBudget: number
  onUpdateAllocation: (index: number, field: keyof BudgetAllocation, value: any) => void
  onRemoveAllocation: (index: number) => void
}

export function BudgetAllocationTable({
  allocations,
  categories,
  totalBudget,
  onUpdateAllocation,
  onRemoveAllocation,
}: BudgetAllocationTableProps) {
  const { formatAmount } = useCurrency()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const availableCategories = (currentCategoryId?: string) => {
    if (!Array.isArray(categories)) {
      return []
    }
    return categories.filter(
      (cat) => cat.id === currentCategoryId || !allocations.find((alloc) => alloc.category_id === cat.id),
    )
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage > 40) return "text-red-600"
    if (percentage > 25) return "text-yellow-600"
    return "text-green-600"
  }

  const totalAllocated = Array.isArray(allocations)
    ? allocations.reduce((sum, allocation) => sum + (allocation.allocated_amount || 0), 0)
    : 0
  const totalPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0

  if (!Array.isArray(categories) || !Array.isArray(allocations)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Loading budget allocation data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {allocations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No budget allocations yet. Add categories to start allocating your budget.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {editingIndex === index ? (
                      <Select
                        value={allocation.category_id}
                        onValueChange={(value) => onUpdateAllocation(index, "category_id", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories(allocation.category_id).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="cursor-pointer hover:text-blue-600" onClick={() => setEditingIndex(index)}>
                        {allocation.category_name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={allocation.allocated_amount}
                        onChange={(e) =>
                          onUpdateAllocation(index, "allocated_amount", Number.parseFloat(e.target.value) || 0)
                        }
                        onBlur={() => setEditingIndex(null)}
                        autoFocus
                      />
                    ) : (
                      <div className="cursor-pointer hover:text-blue-600" onClick={() => setEditingIndex(index)}>
                        {formatAmount(allocation.allocated_amount)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPercentageColor(allocation.percentage)}>
                      {allocation.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={allocation.percentage} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <Input
                        placeholder="Add notes..."
                        value={allocation.notes || ""}
                        onChange={(e) => onUpdateAllocation(index, "notes", e.target.value)}
                        onBlur={() => setEditingIndex(null)}
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:text-blue-600 text-sm text-muted-foreground"
                        onClick={() => setEditingIndex(index)}
                      >
                        {allocation.notes || "Click to add notes..."}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onRemoveAllocation(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{formatAmount(totalAllocated)}</div>
                <div className="text-sm text-muted-foreground">Total Allocated</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{formatAmount(totalBudget - totalAllocated)}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${getPercentageColor(totalPercentage)}`}>
                  {totalPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Allocated</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={totalPercentage} className="h-3" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
