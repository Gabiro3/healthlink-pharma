"use client"

import { useEffect, useRef } from "react"

export function HeatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Generate mock data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const cellWidth = canvas.width / hours.length
    const cellHeight = canvas.height / days.length

    // Draw heatmap
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      for (let hourIndex = 0; hourIndex < hours.length; hourIndex++) {
        // Generate random value (0-30)
        const value = Math.floor(Math.random() * 30)

        // Determine color based on value
        let color
        if (value < 5) {
          color = "#f3f4f6" // Very light gray
        } else if (value < 10) {
          color = "#e5e7eb" // Light gray
        } else if (value < 15) {
          color = "#d1d5db" // Medium light gray
        } else if (value < 20) {
          color = "#9ca3af" // Medium gray
        } else if (value < 25) {
          color = "#6b7280" // Medium dark gray
        } else {
          color = "#4b5563" // Dark gray
        }

        // Draw cell
        ctx.fillStyle = color
        ctx.fillRect(hourIndex * cellWidth, dayIndex * cellHeight, cellWidth - 1, cellHeight - 1)
      }
    }

    // Draw labels
    ctx.fillStyle = "#000"
    ctx.font = "10px sans-serif"

    // Draw hour labels (only every 4 hours)
    for (let i = 0; i < hours.length; i += 4) {
      ctx.fillText(`${i}h`, i * cellWidth + cellWidth / 2 - 5, canvas.height - 5)
    }

    // Draw day labels
    for (let i = 0; i < days.length; i++) {
      ctx.fillText(days[i], 5, i * cellHeight + cellHeight / 2 + 3)
    }
  }, [])

  return (
    <div className="h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
