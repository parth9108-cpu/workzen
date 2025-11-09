'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
}

export function KPICard({ title, value, subtitle, icon: Icon, color, trend }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl p-6 shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}
