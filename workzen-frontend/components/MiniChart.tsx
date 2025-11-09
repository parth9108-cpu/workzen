'use client'

import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface MiniChartProps {
  type: 'line' | 'donut'
  data: any[]
  color?: string
}

export function MiniChart({ type, data, color = '#3B82F6' }: MiniChartProps) {
  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'donut') {
    const COLORS = ['#3B82F6', '#E5E7EB']
    return (
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={50}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null
}
