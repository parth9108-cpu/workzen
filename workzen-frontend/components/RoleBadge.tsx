import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const colors = {
    ADMIN: 'bg-purple-100 text-purple-700 border-purple-300',
    HR: 'bg-blue-100 text-blue-700 border-blue-300',
    PAYROLL: 'bg-green-100 text-green-700 border-green-300',
    EMPLOYEE: 'bg-gray-100 text-gray-700 border-gray-300',
    Employee: 'bg-gray-100 text-gray-700 border-gray-300',
    Manager: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  }

  const colorClass = colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-300'

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
        className
      )}
    >
      {role}
    </span>
  )
}
