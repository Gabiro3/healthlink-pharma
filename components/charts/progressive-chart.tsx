"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface ProgressiveChartProps {
  data: {
    name: string
    value: number
    cumulative: number
  }[]
}

export function ProgressiveChart({ data }: ProgressiveChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `$${value}`,
            name === "value" ? "Period Sales" : "Cumulative Sales",
          ]}
          cursor={{ stroke: "#004d40", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#004d40"
          strokeWidth={2}
          fill="url(#colorGradient)"
          fillOpacity={0.6}
        />
        <Area type="monotone" dataKey="value" stroke="#00695c" strokeWidth={2} fill="#00695c" fillOpacity={0.3} />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#004d40" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#004d40" stopOpacity={0.1} />
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  )
}
