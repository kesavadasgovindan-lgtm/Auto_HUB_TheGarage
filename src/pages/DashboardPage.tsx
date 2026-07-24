import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Car, Wrench, Clock, Package, FileText, CheckCircle, TrendingUp,
  TrendingDown, ArrowUpRight, Activity, ChevronRight, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { mockDashboardStats, mockRevenueData, mockServiceTrend, mockVehicleTypes, mockActivity, mockJobs, mockInvoices, mockQuotations } from '@/mock/data'
import { StatCardSkeleton, StatusBadge, getJobStatusVariant } from '@/components/common'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>(0)
  useEffect(() => {
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])
  return count
}

interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change?: number
  icon: React.ElementType
  iconColor: string
  gradient: string
}

function StatCard({ title, value, prefix = '', suffix = '', change, icon: Icon, iconColor, gradient }: StatCardProps) {
  const animated = useAnimatedCounter(value)
  const isPositive = (change || 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="stat-card"
    >
      <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20', gradient)} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">
            {prefix}{animated.toLocaleString('en-IN')}{suffix}
          </p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs', isPositive ? 'text-green-400' : 'text-red-400')}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}% vs last month
            </div>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltipRevenue = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-medium">₹{p.value.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

const activityTypeColors: Record<string, string> = {
  job: 'bg-green-500/15 text-green-400',
  invoice: 'bg-blue-500/15 text-blue-400',
  quotation: 'bg-yellow-500/15 text-yellow-400',
  customer: 'bg-purple-500/15 text-purple-400',
  vehicle: 'bg-orange-500/15 text-orange-400',
  stock: 'bg-red-500/15 text-red-400',
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const stats = mockDashboardStats
  const pendingJobs = mockJobs.filter((j) => j.status !== 'Delivered')
  const recentInvoices = mockInvoices.slice(0, 3)
  const recentQuotations = mockQuotations.slice(0, 3)

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-60 bg-white/5 rounded-lg animate-pulse mt-1" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good morning! Here's what's happening at your garage today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <Activity className="w-3 h-3 text-green-400" />
          Live data
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Revenue" value={stats.todayRevenue} prefix="₹" change={stats.revenueChange} icon={DollarSign} iconColor="text-green-400 bg-green-500/10" gradient="bg-green-500" />
        <StatCard title="Vehicles in Garage" value={stats.vehiclesInGarage} icon={Car} iconColor="text-blue-400 bg-blue-500/10" gradient="bg-blue-500" />
        <StatCard title="Active Jobs" value={stats.activeJobs} change={stats.jobsChange} icon={Wrench} iconColor="text-orange-400 bg-orange-500/10" gradient="bg-orange-500" />
        <StatCard title="Pending Deliveries" value={stats.pendingDeliveries} icon={Clock} iconColor="text-yellow-400 bg-yellow-500/10" gradient="bg-yellow-500" />
        <StatCard title="Low Stock Items" value={stats.lowStockItems} icon={AlertTriangle} iconColor="text-red-400 bg-red-500/10" gradient="bg-red-500" />
        <StatCard title="Active Quotations" value={stats.activeQuotations} icon={FileText} iconColor="text-purple-400 bg-purple-500/10" gradient="bg-purple-500" />
        <StatCard title="Completed Services" value={stats.completedServices} icon={CheckCircle} iconColor="text-teal-400 bg-teal-500/10" gradient="bg-teal-500" />
        <StatCard title="Monthly Revenue" value={stats.monthlyRevenue} prefix="₹" icon={TrendingUp} iconColor="text-indigo-400 bg-indigo-500/10" gradient="bg-indigo-500" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 premium-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">2026 monthly revenue vs expenses</p>
            </div>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">+{stats.revenueChange}%</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockRevenueData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltipRevenue />} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenue)" />
              <Area type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={2} fill="url(#expenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Types Pie */}
        <div className="premium-card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Vehicle Types</h3>
            <p className="text-xs text-muted-foreground">Distribution this month</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={mockVehicleTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {mockVehicleTypes.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {mockVehicleTypes.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-muted-foreground">{t.name}</span>
                </div>
                <span className="font-medium">{t.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Trend + Activity + Jobs row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Service Trend */}
        <div className="premium-card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Service Trend</h3>
            <p className="text-xs text-muted-foreground">Jobs created vs completed</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockServiceTrend} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="jobs" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Recent Activity</h3>
            <Link to="/jobs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockActivity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-2.5">
                <div className={cn('mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0', activityTypeColors[item.type])}>
                  <Activity className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="premium-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Active Jobs</h3>
            <Link to="/jobs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {pendingJobs.slice(0, 4).map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{job.jobNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{job.vehicleName}</p>
                </div>
                <StatusBadge variant={getJobStatusVariant(job.status)} className="text-[10px] px-1.5 py-0.5 hidden sm:inline-flex">
                  {job.status}
                </StatusBadge>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom – Latest Bills & Quotations */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Latest Invoices */}
        <div className="premium-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h3 className="font-semibold text-sm">Latest Invoices</h3>
            <Link to="/billing" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-400">{inv.customerName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{inv.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(inv.grandTotal)}</p>
                  <StatusBadge variant={inv.status === 'Paid' ? 'success' : 'warning'} className="text-[10px]">{inv.status}</StatusBadge>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Latest Quotations */}
        <div className="premium-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h3 className="font-semibold text-sm">Latest Quotations</h3>
            <Link to="/quotations" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {recentQuotations.map((q) => (
              <div key={q.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{q.quotationNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{q.customerName} · {q.vehicleNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(q.grandTotal)}</p>
                  <StatusBadge variant={q.status === 'Approved' ? 'success' : q.status === 'Pending' ? 'warning' : 'default'} className="text-[10px]">{q.status}</StatusBadge>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
