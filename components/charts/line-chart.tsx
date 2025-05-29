"use client"

import {
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface LineChartProps {
  data: {
    name: string
    total: number
  }[]
}

export function LineChart({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `RWF-${value}`}
        />
        <Tooltip formatter={(value: number) => [`RWF-${value}`, "Total"]} cursor={{ stroke: "#004d40", strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#004d40"
          strokeWidth={2}
          dot={{ fill: "#004d40", r: 4 }}
          activeDot={{ r: 6, fill: "#004d40" }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
