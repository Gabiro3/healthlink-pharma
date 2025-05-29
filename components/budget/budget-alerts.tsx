"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"

interface BudgetAlert {
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
}

interface BudgetAlertsProps {
  alerts: BudgetAlert[]
}

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return null
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "default"
      case "success":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <Alert key={index} variant={getAlertVariant(alert.type)}>
          {getAlertIcon(alert.type)}
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
