"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Receipt, Wrench, Home } from "lucide-react"

const mockExpenses = [
  { id: 1, category: "Maintenance", amount: 1200, description: "HVAC Repair", date: "2024-01-15", icon: Wrench },
  { id: 2, category: "Utilities", amount: 450, description: "Water Bill", date: "2024-01-10", icon: Home },
  { id: 3, category: "Insurance", amount: 800, description: "Property Insurance", date: "2024-01-05", icon: Receipt },
]

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState(mockExpenses)

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Maintenance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Utilities":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Insurance":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Tracker</h3>
        <Button size="sm" variant="outline" className="min-h-[44px] bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Monthly Expenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center">
                <expense.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">${expense.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">This Month</span>
            <span className="font-semibold text-gray-900 dark:text-white">${totalExpenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Month</span>
            <span className="font-semibold text-gray-900 dark:text-white">$2,180</span>
          </div>
        </div>
      </div>
    </div>
  )
}
