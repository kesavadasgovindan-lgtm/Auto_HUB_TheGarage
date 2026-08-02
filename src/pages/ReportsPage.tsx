import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockRevenueData, mockServiceTrend } from '@/mock/data'
import { PageHeader } from '@/components/common'
import { formatCurrency, cn } from '@/lib/utils'

const reportTypes = ['Revenue', 'Inventory', 'Service', 'GST', 'Mechanic', 'Customer']

const mechanics: { name: string; jobs: number; revenue: number; rating: number }[] = []

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('Revenue')
  const [period, setPeriod] = useState('Monthly')

  return (
    <div>
      <PageHeader title="Reports" description="Business intelligence and analytics">
        <div className="flex gap-2">
          <button className="btn-secondary"><Download className="w-4 h-4" /> Export</button>
        </div>
      </PageHeader>

      {/* Report type tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {reportTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveReport(type)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all', activeReport === type ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-secondary text-muted-foreground hover:text-foreground')}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-4">
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', period === p ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground')}>{p}</button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5" /> Jan 2026 – Jul 2026
        </div>
      </div>

      {activeReport === 'Revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: 0, icon: DollarSign, color: 'text-green-400 bg-green-500/10', change: 0 },
              { label: 'Total Expenses', value: 0, icon: TrendingDown, color: 'text-red-400 bg-red-500/10', change: 0 },
              { label: 'Net Profit', value: 0, icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10', change: 0 },
              { label: 'Invoices', value: 0, icon: FileText, color: 'text-purple-400 bg-purple-500/10', change: 0 },
            ].map((s) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', s.color)}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className={cn('text-xs font-medium', s.change >= 0 ? 'text-green-400' : 'text-red-400')}>{s.change > 0 ? '+' : ''}{s.change}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold mt-0.5">{typeof s.value === 'number' && s.label !== 'Invoices' ? formatCurrency(s.value) : s.value.toLocaleString('en-IN')}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="premium-card p-5">
              <h3 className="font-semibold text-sm mb-4">Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gr)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="premium-card p-5">
              <h3 className="font-semibold text-sm mb-4">Service Jobs Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockServiceTrend} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'Mechanic' && (
        <div className="premium-card overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-sm">Mechanic Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mechanic</th>
                  <th>Jobs Completed</th>
                  <th>Revenue Generated</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {mechanics.map((m, i) => (
                  <motion.tr key={m.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{m.name[0]}</div>
                        <span className="font-medium text-sm">{m.name}</span>
                      </div>
                    </td>
                    <td className="font-medium text-sm">{m.jobs}</td>
                    <td className="font-medium text-sm">{formatCurrency(m.revenue)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm font-medium">{m.rating}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!['Revenue', 'Mechanic'].includes(activeReport) && (
        <div className="premium-card p-16 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold">{activeReport} Reports</h3>
          <p className="text-sm text-muted-foreground mt-1">Connect to the API backend to load {activeReport.toLowerCase()} report data.</p>
        </div>
      )}
    </div>
  )
}
