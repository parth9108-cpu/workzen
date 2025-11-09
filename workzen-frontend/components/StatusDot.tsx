import { cn } from '@/lib/utils'

interface StatusDotProps {
  status: 'Present' | 'On Leave' | 'Absent' | 'Pending' | 'Approved' | 'Rejected' | string
  showLabel?: boolean
  className?: string
}

export function StatusDot({ status, showLabel = false, className }: StatusDotProps) {
  const colors = {
    Present: 'bg-green-500',
    'On Leave': 'bg-blue-500',
    Absent: 'bg-red-500',
    Pending: 'bg-yellow-500',
    Approved: 'bg-green-500',
    Rejected: 'bg-red-500',
  }

  const colorClass = colors[status as keyof typeof colors] || 'bg-gray-500'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('h-2 w-2 rounded-full', colorClass)} />
      {showLabel && <span className="text-sm text-gray-700">{status}</span>}
    </div>
  )
}
