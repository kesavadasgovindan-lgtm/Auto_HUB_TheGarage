import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Wrench, Clock, CheckCircle, AlertCircle, ChevronDown, X } from 'lucide-react'
import { jobsService, customersService, vehiclesService } from '@/services'
import { PageHeader, StatusBadge, PriorityBadge, getJobStatusVariant, EmptyState } from '@/components/common'
import { formatDate, cn } from '@/lib/utils'
import type { JobCard, JobStatus, Customer, Vehicle } from '@/types'

const statuses: JobStatus[] = ['Received', 'Inspection', 'Repairing', 'Waiting for Parts', 'Quality Check', 'Completed', 'Delivered']

interface JobModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<JobCard>) => Promise<void>
}

function JobModal({ open, onClose, onSave }: JobModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState({
    customerId: '', vehicleId: '', complaint: '', priority: 'Normal', labourCharges: '1500', estimatedCompletion: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      customersService.getAll().then(setCustomers).catch(() => {})
      vehiclesService.getAll().then(setVehicles).catch(() => {})
    }
  }, [open])

  const filteredVehicles = vehicles.filter(v => !form.customerId || v.customerId.toString() === form.customerId.toString())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId || !form.vehicleId || !form.complaint) {
      alert('Please fill in customer, vehicle, and complaint')
      return
    }
    setSaving(true)
    try {
      const cust = customers.find(c => c.id.toString() === form.customerId)
      const veh = vehicles.find(v => v.id.toString() === form.vehicleId)
      await onSave({
        customerId: form.customerId,
        customerName: cust?.name || '',
        customerPhone: cust?.phone || '',
        vehicleId: form.vehicleId,
        vehicleNumber: veh?.vehicleNumber || '',
        vehicleName: `${veh?.brand || ''} ${veh?.model || ''}`,
        complaint: form.complaint,
        priority: form.priority as any,
        labourCharges: parseFloat(form.labourCharges) || 0,
        estimatedCompletion: form.estimatedCompletion || new Date().toISOString(),
      })
      setSaved(true)
      await new Promise(r => setTimeout(r, 600))
      setSaved(false)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to create job card')
    } finally {
      setSaving(false)
    }
  }

  const fc = 'w-full px-3 py-2 rounded-xl text-sm outline-none'
  const fs = { background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl p-5 shadow-2xl" style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>New Job Card</h2>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Customer *</label>
                  <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value, vehicleId: '' }))} className={fc} style={fs}>
                    <option value="">— Select Customer —</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Vehicle *</label>
                  <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} className={fc} style={fs}>
                    <option value="">— Select Vehicle —</option>
                    {filteredVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.brand} {v.model})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Customer Complaint / Issue *</label>
                  <textarea rows={3} value={form.complaint} onChange={e => setForm(f => ({ ...f, complaint: e.target.value }))} placeholder="Describe issue..." className={fc} style={fs} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={fc} style={fs}>
                      {['Low', 'Normal', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Labour Charges (₹)</label>
                    <input type="number" value={form.labourCharges} onChange={e => setForm(f => ({ ...f, labourCharges: e.target.value }))} className={fc} style={fs} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl text-xs" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: saved ? '#16a34a' : '#3b82f6' }}>
                    {saved ? <><CheckCircle className="w-4 h-4 inline mr-1" /> Created in DB!</> : saving ? 'Creating...' : 'Create Job Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [jobs, setJobs] = useState<JobCard[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadJobs = async () => {
    setLoading(true)
    try {
      const data = await jobsService.getAll()
      setJobs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadJobs() }, [])

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.vehicleNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || j.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleSave = async (data: Partial<JobCard>) => {
    await jobsService.create(data)
    await loadJobs()
  }

  const handleStatusChange = async (id: string | number, newStatus: string) => {
    await jobsService.updateStatus(id, newStatus)
    await loadJobs()
  }

  return (
    <div>
      <PageHeader title="Job Cards" description={`${jobs.length} total jobs in DB`}>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Job Card
        </button>
      </PageHeader>

      <div className="premium-card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search job number, customer, vehicle..." className="input-field pl-9" />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          <button onClick={() => setStatusFilter('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap', statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-secondary text-muted-foreground')}>All</button>
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap', statusFilter === s ? 'bg-blue-500 text-white' : 'bg-secondary text-muted-foreground')}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading job cards from database...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Wrench className="w-7 h-7" />} title="No jobs found" description="Try adjusting search or add a job card." action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> New Job Card</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job, i) => {
            const partsTotal = job.parts?.reduce((s, p) => s + (p.total || 0), 0) || 0
            const total = (job.labourCharges || 0) + partsTotal

            return (
              <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="premium-card p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-sm">{job.jobNumber}</p>
                    <p className="text-xs text-muted-foreground">{job.vehicleNumber} · {job.vehicleName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge variant={getJobStatusVariant(job.status)}>{job.status}</StatusBadge>
                    <PriorityBadge priority={job.priority} />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.complaint}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{job.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">₹{total.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Status Changer */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Change status:</span>
                  <select value={job.status} onChange={e => handleStatusChange(job.id, e.target.value)} className="text-xs py-1 px-2 rounded-lg bg-secondary outline-none">
                    {statuses.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <JobModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  )
}
