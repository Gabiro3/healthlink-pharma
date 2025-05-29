// This is a simplified implementation of SARIMA forecasting
// In a real application, you would use a proper time series forecasting library
// or call an external service for more accurate forecasting

export interface TimeSeriesData {
  date: string
  value: number
}

export interface ForecastResult {
  forecast: TimeSeriesData[]
  confidenceInterval: {
    lower: TimeSeriesData[]
    upper: TimeSeriesData[]
  }
  confidenceLevel: number
}

export async function generateSARIMAForecast(
  historicalData: TimeSeriesData[],
  forecastPeriod: number,
  confidenceLevel = 0.95,
): Promise<ForecastResult> {
  // Sort data by date
  const sortedData = [...historicalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Extract values for calculations
  const values = sortedData.map((d) => d.value)

  // Calculate simple moving average and standard deviation
  // (In a real SARIMA model, this would be much more complex)
  const movingAverage = calculateMovingAverage(values, 3)
  const stdDev = calculateStandardDeviation(values)

  // Generate forecast dates
  const lastDate = new Date(sortedData[sortedData.length - 1].date)
  const forecastDates = generateForecastDates(lastDate, forecastPeriod)

  // Generate forecast values
  // (This is a very simplified approach - real SARIMA would be more complex)
  const forecast: TimeSeriesData[] = []
  const lowerBound: TimeSeriesData[] = []
  const upperBound: TimeSeriesData[] = []

  // Z-score for the confidence interval
  const zScore =
    confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.9 ? 1.645 : confidenceLevel === 0.99 ? 2.576 : 1.96

  // Last few values for trend calculation
  const lastValues = values.slice(-6)
  const trend = calculateTrend(lastValues)

  // Generate forecast with confidence intervals
  for (let i = 0; i < forecastPeriod; i++) {
    // Base forecast is last moving average plus trend
    const baseValue = movingAverage + trend * (i + 1)

    // Add some randomness to simulate seasonality
    const seasonalFactor = 1 + Math.sin((i / 6) * Math.PI) * 0.1
    const forecastValue = baseValue * seasonalFactor

    // Calculate confidence interval
    const interval = stdDev * zScore * Math.sqrt(i + 1)

    forecast.push({
      date: forecastDates[i],
      value: Math.max(0, Math.round(forecastValue)),
    })

    lowerBound.push({
      date: forecastDates[i],
      value: Math.max(0, Math.round(forecastValue - interval)),
    })

    upperBound.push({
      date: forecastDates[i],
      value: Math.max(0, Math.round(forecastValue + interval)),
    })
  }

  return {
    forecast,
    confidenceInterval: {
      lower: lowerBound,
      upper: upperBound,
    },
    confidenceLevel,
  }
}

// Helper functions

function calculateMovingAverage(values: number[], window: number): number {
  if (values.length < window) {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  const lastWindow = values.slice(-window)
  return lastWindow.reduce((sum, val) => sum + val, 0) / window
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0

  // Simple linear trend calculation
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

  return secondAvg - firstAvg
}

function generateForecastDates(lastDate: Date, periods: number): string[] {
  const dates: string[] = []
  const currentDate = new Date(lastDate)

  for (let i = 0; i < periods; i++) {
    currentDate.setDate(currentDate.getDate() + 1)
    dates.push(currentDate.toISOString().split("T")[0])
  }

  return dates
}
