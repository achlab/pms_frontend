"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const expenseData = [
  { name: "Maintenance", value: 35, color: "#f59e0b" },
  { name: "Utilities", value: 25, color: "#3b82f6" },
  { name: "Insurance", value: 20, color: "#8b5cf6" },
  { name: "Management", value: 15, color: "#10b981" },
  { name: "Other", value: 5, color: "#6b7280" },
]

export function FinancialSummary() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Breakdown</h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {expenseData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Profit Margin</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">68%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">ROI</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">12.5%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
