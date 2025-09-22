import { LucideIcon } from "lucide-react"
import { AnimatedCard } from "@/components/animated-card"
import { CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColorClass?: string
  gradientFromClass?: string
  gradientToClass?: string
  delay?: number
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColorClass = "text-indigo-600 dark:text-indigo-400",
  gradientFromClass = "from-indigo-100",
  gradientToClass = "to-cyan-100",
  delay = 0,
  trend,
}: StatsCardProps) {
  return (
    <AnimatedCard delay={delay} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            {trend && (
              <p className={`text-xs ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} mt-1`}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className={`h-12 w-12 bg-gradient-to-br ${gradientFromClass} ${gradientToClass} dark:from-indigo-900 dark:to-cyan-900 rounded-lg flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconColorClass}`} />
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  )
}
