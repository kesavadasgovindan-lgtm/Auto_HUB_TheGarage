import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-white/5', className)} />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="premium-card p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-16 hidden sm:block" />
          <Skeleton className="h-6 w-20 rounded-full hidden md:block" />
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange'
  className?: string
}

export function StatusBadge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-500/15 text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    orange: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  }
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  )
}

export function getJobStatusVariant(status: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    'Received': 'info',
    'Inspection': 'purple',
    'Repairing': 'warning',
    'Waiting for Parts': 'orange',
    'Quality Check': 'info',
    'Completed': 'success',
    'Delivered': 'default',
  }
  return map[status] || 'default'
}

export function getQuotationStatusVariant(status: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    'Draft': 'default',
    'Pending': 'warning',
    'Approved': 'success',
    'Rejected': 'danger',
    'Expired': 'orange',
  }
  return map[status] || 'default'
}

export function getInvoiceStatusVariant(status: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    'Draft': 'default',
    'Unpaid': 'danger',
    'Partial': 'warning',
    'Paid': 'success',
    'Cancelled': 'orange',
  }
  return map[status] || 'default'
}

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}

export function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.5 }: AnimatedCounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="tabular-nums"
    >
      {prefix}{value.toLocaleString('en-IN')}{suffix}
    </motion.span>
  )
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 w-full sm:w-auto">{children}</div>}
    </div>
  )
}

interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const map: Record<string, BadgeProps['variant']> = {
    Low: 'default',
    Normal: 'info',
    High: 'warning',
    Urgent: 'danger',
  }
  return <StatusBadge variant={map[priority] || 'default'}>{priority}</StatusBadge>
}

export { PrintDocumentModal } from './PrintDocumentModal'

