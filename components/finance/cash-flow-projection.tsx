"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const projectionData = [
  { month: "Jan", income: 78000, expenses: 25000, net: 53000 },
  { month: "Feb", income: 82000, expenses: 28000, net: 54000 },
  { month: "Mar", income: 85000, expenses: 30000, net: 55000 },
  { month: "Apr", income: 88000, expenses: 27000, net: 61000 },
  { month: "May", income: 90000, expenses: 32000, net: 58000 },
  { month: "Jun", income: 92000, expenses: 29000, net: 63000 },
]

export function CashFlowProjection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Flow Projection</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-sm fill-gray-600" />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-sm fill-gray-600"
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === "net" ? "Net Cash Flow" : name === "income" ? "Income" : "Expenses",
              ]}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="url(#gradient)"
              strokeWidth={3}
              dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Projected Income</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">$92,000</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Projected Expenses</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">$29,000</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Net Cash Flow</p>
          <p className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            $63,000
          </p>
        </div>
      </div>
    </div>
  )
}
