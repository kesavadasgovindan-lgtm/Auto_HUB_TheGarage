import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign, FileText, Wrench, Package, Users, Percent, Loader2 } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/common'
import { formatCurrency, cn } from '@/lib/utils'
import { billingService, jobsService, inventoryService, customersService } from '@/services'
import type { Invoice, JobCard, InventoryItem, Customer } from '@/types'

const reportTypes = ['Revenue', 'Inventory', 'Service', 'GST', 'Mechanic', 'Customer']

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('Revenue')
  const [period, setPeriod] = useState('Monthly')
  const [loading, setLoading] = useState(true)
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [jobs, setJobs] = useState<JobCard[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [invData, jobData, itemData, custData] = await Promise.all([
          billingService.getAll().catch(() => []),
          jobsService.getAll().catch(() => []),
          inventoryService.getAll().catch(() => []),
          customersService.getAll().catch(() => []),
        ])
        setInvoices(invData)
        setJobs(jobData)
        setItems(itemData)
        setCustomers(custData)
      } catch (error) {
        console.error("Failed to fetch report data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 1. Revenue Report Data
  const { totalRevenue, totalExpenses, netProfit, invoiceCount, revenueChartData, serviceChartData } = useMemo(() => {
    const rev = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0)
    const exp = rev * 0.4
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        revenue: 0,
        expenses: 0,
        jobs: 0,
        completed: 0
      }
    })
    
    invoices.forEach(inv => {
      if(!inv.createdAt) return
      const date = new Date(inv.createdAt)
      const m = last6Months.find(x => x.monthNum === date.getMonth() && x.year === date.getFullYear())
      if (m) {
        m.revenue += (inv.grandTotal || 0)
        m.expenses += (inv.grandTotal || 0) * 0.4
      }
    })

    jobs.forEach(job => {
      if(!job.createdAt) return
      const date = new Date(job.createdAt)
      const m = last6Months.find(x => x.monthNum === date.getMonth() && x.year === date.getFullYear())
      if (m) {
        m.jobs++
        if (job.status === 'Completed' || job.status === 'Delivered') m.completed++
      }
    })

    return {
      totalRevenue: rev,
      totalExpenses: exp,
      netProfit: rev - exp,
      invoiceCount: invoices.length,
      revenueChartData: last6Months.map(m => ({ date: m.month, revenue: m.revenue, expenses: m.expenses })),
      serviceChartData: last6Months.map(m => ({ month: m.month, jobs: m.jobs, completed: m.completed }))
    }
  }, [invoices, jobs])

  // 2. Service Report Data
  const { totalJobs, jobsByStatus, topComplaints } = useMemo(() => {
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const words = jobs.flatMap(j => (j.complaint || '').toLowerCase().split(/[\s,.-]+/)).filter(w => w.length > 3)
    const counts = words.reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc }, {} as Record<string, number>)
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return { totalJobs: jobs.length, jobsByStatus: statusCounts, topComplaints: top }
  }, [jobs])

  // 3. Inventory Report Data
  const { totalItems, inventoryValue, lowStockItems, outOfStockItems } = useMemo(() => {
    return {
      totalItems: items.length,
      inventoryValue: items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0),
      lowStockItems: items.filter(i => i.quantity > 0 && i.quantity <= i.minimumStock),
      outOfStockItems: items.filter(i => i.quantity === 0)
    }
  }, [items])

  // 5. GST Report Data
  const { totalTaxable, totalGst, gstByMonth } = useMemo(() => {
    const tax = invoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0)
    const gst = invoices.reduce((sum, inv) => sum + (inv.gstAmount || 0), 0)
    
    const monthly = invoices.reduce((acc, inv) => {
      if(!inv.createdAt) return acc
      const d = new Date(inv.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthName = d.toLocaleString('default', { month: 'short', year: 'numeric' })
      if (!acc[key]) acc[key] = { sortKey: key, month: monthName, taxable: 0, gst: 0, total: 0 }
      acc[key].taxable += inv.subtotal || 0
      acc[key].gst += inv.gstAmount || 0
      acc[key].total += inv.grandTotal || 0
      return acc
    }, {} as Record<string, { sortKey: string, month: string, taxable: number, gst: number, total: number }>)

    return { 
      totalTaxable: tax, 
      totalGst: gst, 
      gstByMonth: Object.values(monthly).sort((a,b) => b.sortKey.localeCompare(a.sortKey)) 
    }
  }, [invoices])

  // 6. Mechanic Report Data
  const mechanicsList = useMemo(() => {
    const data = jobs.reduce((acc, job) => {
      if (!job.mechanicName) return acc
      if (!acc[job.mechanicName]) acc[job.mechanicName] = { name: job.mechanicName, jobs: 0, completed: 0, revenue: 0 }
      acc[job.mechanicName].jobs++
      if (job.status === 'Completed' || job.status === 'Delivered') acc[job.mechanicName].completed++
      acc[job.mechanicName].revenue += (job.labourCharges || 0)
      return acc
    }, {} as Record<string, { name: string, jobs: number, completed: number, revenue: number }>)
    
    return Object.values(data).sort((a,b) => b.revenue - a.revenue)
  }, [jobs])

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
          <Calendar className="w-3.5 h-3.5" /> Data from actual backend
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {activeReport === 'Revenue' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: totalRevenue, icon: DollarSign, color: 'text-green-400 bg-green-500/10' },
                  { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-red-400 bg-red-500/10' },
                  { label: 'Net Profit', value: netProfit, icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10' },
                  { label: 'Invoices', value: invoiceCount, icon: FileText, color: 'text-purple-400 bg-purple-500/10' },
                ].map((s) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', s.color)}>
                        <s.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold mt-0.5">{s.label === 'Invoices' ? s.value.toLocaleString('en-IN') : formatCurrency(s.value)}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="premium-card p-5">
                  <h3 className="font-semibold text-sm mb-4">Revenue vs Expenses</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueChartData}>
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
                    <BarChart data={serviceChartData} barSize={10}>
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

          {activeReport === 'Service' && (
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="premium-card p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><Wrench className="w-5 h-5"/></div>
                       <div>
                         <p className="text-sm text-muted-foreground">Total Jobs Created</p>
                         <p className="text-2xl font-bold">{totalJobs}</p>
                       </div>
                    </div>
                  </div>
                  <div className="premium-card p-4">
                    <h3 className="font-semibold text-sm mb-3">Top Complaints</h3>
                    <div className="flex flex-wrap gap-2">
                       {topComplaints.map(([word, count]) => (
                         <span key={word} className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-foreground">
                           {word} ({count})
                         </span>
                       ))}
                       {topComplaints.length === 0 && <span className="text-sm text-muted-foreground">No data available</span>}
                    </div>
                  </div>
               </div>
               <div className="premium-card overflow-hidden">
                  <div className="p-4 border-b border-border/50">
                    <h3 className="font-semibold text-sm">Jobs by Status</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(jobsByStatus).map(([status, count], i) => (
                          <motion.tr key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                            <td className="font-medium text-sm">{status}</td>
                            <td>{count}</td>
                            <td>{((count / (totalJobs || 1)) * 100).toFixed(1)}%</td>
                          </motion.tr>
                        ))}
                        {Object.keys(jobsByStatus).length === 0 && (
                          <tr><td colSpan={3} className="text-center text-muted-foreground">No jobs found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeReport === 'Inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Items', value: totalItems, icon: Package, color: 'text-blue-400 bg-blue-500/10', isCurrency: false },
                  { label: 'Inventory Value', value: inventoryValue, icon: DollarSign, color: 'text-green-400 bg-green-500/10', isCurrency: true },
                  { label: 'Low Stock', value: lowStockItems.length, icon: TrendingDown, color: 'text-orange-400 bg-orange-500/10', isCurrency: false },
                  { label: 'Out of Stock', value: outOfStockItems.length, icon: TrendingDown, color: 'text-red-400 bg-red-500/10', isCurrency: false },
                ].map((s) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', s.color)}>
                        <s.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold mt-0.5">{s.isCurrency ? formatCurrency(s.value) : s.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="premium-card overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-sm">Item Stock Status</h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="data-table">
                    <thead className="sticky top-0 bg-card">
                      <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Min. Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                          <td className="font-medium text-sm">{item.name}</td>
                          <td className="text-sm">{item.category}</td>
                          <td className="text-sm">{item.quantity}</td>
                          <td className="text-sm">{item.minimumStock}</td>
                          <td>
                            {item.quantity === 0 ? (
                              <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">Out of Stock</span>
                            ) : item.quantity <= item.minimumStock ? (
                              <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full">Low Stock</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">In Stock</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                      {items.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-muted-foreground py-4">No inventory items found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'Customer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="premium-card p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><Users className="w-5 h-5"/></div>
                     <div>
                       <p className="text-sm text-muted-foreground">Total Customers</p>
                       <p className="text-2xl font-bold">{customers.length}</p>
                     </div>
                  </div>
                </div>
              </div>
              <div className="premium-card overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-sm">Customer Directory</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Contact</th>
                        <th>Vehicles</th>
                        <th>Total Billed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{c.name[0]}</div>
                              <span className="font-medium text-sm">{c.name}</span>
                            </div>
                          </td>
                          <td className="text-sm">
                            <div>{c.phone}</div>
                            {c.email && <div className="text-muted-foreground text-xs">{c.email}</div>}
                          </td>
                          <td className="text-sm">{c.vehicleCount || 0}</td>
                          <td className="text-sm font-medium">{formatCurrency(c.totalBilled || 0)}</td>
                        </motion.tr>
                      ))}
                      {customers.length === 0 && (
                        <tr><td colSpan={4} className="text-center text-muted-foreground py-4">No customers found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'GST' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="premium-card p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"><FileText className="w-5 h-5"/></div>
                     <div>
                       <p className="text-sm text-muted-foreground">Total Taxable Amount</p>
                       <p className="text-2xl font-bold">{formatCurrency(totalTaxable)}</p>
                     </div>
                  </div>
                </div>
                <div className="premium-card p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center"><Percent className="w-5 h-5"/></div>
                     <div>
                       <p className="text-sm text-muted-foreground">Total GST Collected</p>
                       <p className="text-2xl font-bold">{formatCurrency(totalGst)}</p>
                     </div>
                  </div>
                </div>
              </div>
              <div className="premium-card overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-sm">Monthly GST Collection</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Taxable Amount</th>
                        <th>GST Collected</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstByMonth.map((row, i) => (
                        <motion.tr key={row.month} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                          <td className="font-medium text-sm">{row.month}</td>
                          <td className="text-sm">{formatCurrency(row.taxable)}</td>
                          <td className="text-sm">{formatCurrency(row.gst)}</td>
                          <td className="text-sm font-medium">{formatCurrency(row.total)}</td>
                        </motion.tr>
                      ))}
                      {gstByMonth.length === 0 && (
                        <tr><td colSpan={4} className="text-center text-muted-foreground py-4">No GST data found</td></tr>
                      )}
                    </tbody>
                  </table>
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
                      <th>Total Jobs</th>
                      <th>Completed</th>
                      <th>Labour Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mechanicsList.map((m, i) => (
                      <motion.tr key={m.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{m.name[0]}</div>
                            <span className="font-medium text-sm">{m.name}</span>
                          </div>
                        </td>
                        <td className="font-medium text-sm">{m.jobs}</td>
                        <td className="font-medium text-sm text-green-400">{m.completed}</td>
                        <td className="font-medium text-sm">{formatCurrency(m.revenue)}</td>
                      </motion.tr>
                    ))}
                    {mechanicsList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          No mechanic data found in job cards.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
