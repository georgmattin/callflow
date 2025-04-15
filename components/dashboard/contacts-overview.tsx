"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface ContactsOverviewProps {
  statusCountsData?: any[]
  isLoading: boolean
}

export function ContactsOverview({ statusCountsData, isLoading }: ContactsOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Uus":
        return "#94a3b8"
      case "Kohtumine":
        return "#22c55e"
      case "Saada info":
        return "#3b82f6"
      case "Helista hiljem":
        return "#a855f7"
      case "Ei vastanud":
        return "#eab308"
      case "Pole huvitatud":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!statusCountsData || statusCountsData.length === 0) {
      // Return default data if no data available
      return [
        { name: "Uus", value: 0, color: "#94a3b8" },
        { name: "Kohtumine", value: 0, color: "#22c55e" },
        { name: "Saada info", value: 0, color: "#3b82f6" },
        { name: "Helista hiljem", value: 0, color: "#a855f7" },
        { name: "Ei vastanud", value: 0, color: "#eab308" },
        { name: "Pole huvitatud", value: 0, color: "#ef4444" },
      ]
    }

    // Map the status counts to chart data
    return statusCountsData.map((item) => ({
      name: item.status,
      value: parseInt(item.count),
      color: getStatusColor(item.status),
    }))
  }

  const data = prepareChartData()
  const COLORS = data.map((item) => item.color)

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-[300px] h-[300px] rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} kontakti`, undefined]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
