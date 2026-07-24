import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Wrench, Clock, CheckCircle, AlertCircle, X, User, Car, FileText, ArrowRight, ChevronDown, Edit2 } from 'lucide-react'
import { mockJobs, mockCustomers, mockVehicles } from '@/mock/data'
import { PageHeader, StatusBadge, PriorityBadge, getJobStatusVariant, EmptyState } from '@/components/common'
import { formatDate, cn } from '@/lib/utils'
import type { JobCard, JobStatus, JobPriority } from '@/types'

const ALL_STATUSES: JobStatus[] = ['Received', 'Inspection', 'Repairing', 'Waiting for Parts', 'Quality Check', 'Completed', 'Delivered']
const PRIORITIES: JobPriority[] = ['Low', 'Normal', 'High', 'Urgent']
const MECHANICS = ['Suresh Kumar', 'Ramesh Babu', 'Pradeep Singh', 'Kiran Rao']

// ─── New Job Card Modal ───────────────────────────────────────────────────────
interface NewJobForm {
  customerId: string
  vehicleId: string
  complaint: string
  inspectionNotes: string
  priority: JobPriority
  mechanicName: string
  estimatedCompletion: string
  labourCharges: string
}

const emptyJob: NewJobForm = {
  customerId: '', vehicleId: '', complaint: '', inspectionNotes: '',
  priority: 'Normal', mechanicName: '', estimatedCompletion: '', labourCharges: '0',
}

function NewJobModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (data: NewJobForm) => void }) {
  const [form, setForm] = useState<NewJobForm>(emptyJob)
  const [errors, setErrors] = useState<Partial<NewJobForm>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState(1)

  const customerVehicles = mockVehicles.filter(v => v.customerId === form.customerId)

  const set = (field: keyof NewJobForm, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
    if (field === 'customerId') setForm(f => ({ ...f, customerId: value, vehicleId: '' }))
  }

  const validate = () => {
    const e: Partial<NewJobForm> = {}
    if (!form.customerId) e.customerId = 'Select customer'
    if (!form.vehicleId) e.vehicleId = 'Select vehicle'
    if (!form.complaint.trim()) e.complaint = 'Describe the complaint'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); setStep(1); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    onSave(form)
    setSaved(true)
    await new Promise(r => setTimeout(r, 800))
    setSaved(false); setSaving(false); setStep(1); setForm(emptyJob); onClose()
  }

  const fieldCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all'
  const s = (f: keyof NewJobForm) => ({ background: 'hsl(240 3.7% 15.9%)', border: `1px solid ${errors[f] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`, color: 'hsl(0 0% 98%)' })

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <Wrench className="w-4 h-4" style={{ color: '#fb923c' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>New Job Card</h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>Step {step} of 2 — {step === 1 ? 'Customer & Vehicle' : 'Service Details'}</p>
                  </div>
                </div>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {step === 1 ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Customer <span style={{ color: '#f97316' }}>*</span></label>
                      <select value={form.customerId} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, customerId: v, vehicleId: '' })); setErrors(er => ({ ...er, customerId: '' })) }} className={fieldCls} style={s('customerId')}>
                        <option value="">— Select Customer —</option>
                        {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                      </select>
                      {errors.customerId && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.customerId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Vehicle <span style={{ color: '#f97316' }}>*</span></label>
                      <select value={form.vehicleId} onChange={e => set('vehicleId', e.target.value)} className={fieldCls} style={s('vehicleId')} disabled={!form.customerId}>
                        <option value="">{form.customerId ? '— Select Vehicle —' : '— Select customer first —'}</option>
                        {customerVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} — {v.brand} {v.model}</option>)}
                      </select>
                      {errors.vehicleId && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.vehicleId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Priority</label>
                      <div className="flex gap-2">
                        {PRIORITIES.map(p => (
                          <button type="button" key={p} onClick={() => set('priority', p)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium border transition-colors"
                            style={form.priority === p ? { background: '#3b82f6', color: 'white', border: '1px solid #3b82f6' } : { background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                      <button type="button" onClick={() => {
                        const errs: Partial<NewJobForm> = {}
                        if (!form.customerId) errs.customerId = 'Select customer'
                        if (!form.vehicleId) errs.vehicleId = 'Select vehicle'
                        if (Object.keys(errs).length) { setErrors(errs); return }
                        setStep(2)
                      }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#3b82f6', color: 'white' }}>
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Customer Complaint <span style={{ color: '#f97316' }}>*</span></label>
                      <textarea rows={3} value={form.complaint} onChange={e => set('complaint', e.target.value)} placeholder="Describe what the customer reported..." className={fieldCls + ' resize-none'} style={s('complaint')} />
                      {errors.complaint && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.complaint}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Inspection Notes</label>
                      <textarea rows={2} value={form.inspectionNotes} onChange={e => set('inspectionNotes', e.target.value)} placeholder="Initial findings after inspection..." className={fieldCls + ' resize-none'} style={s('inspectionNotes')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Assign Mechanic</label>
                        <select value={form.mechanicName} onChange={e => set('mechanicName', e.target.value)} className={fieldCls} style={s('mechanicName')}>
                          <option value="">— Unassigned —</option>
                          {MECHANICS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Est. Completion</label>
                        <input type="date" value={form.estimatedCompletion} onChange={e => set('estimatedCompletion', e.target.value)} className={fieldCls} style={s('estimatedCompletion')} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Labour Charges (₹)</label>
                      <input type="number" min="0" value={form.labourCharges} onChange={e => set('labourCharges', e.target.value)} className={fieldCls} style={s('labourCharges')} />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>← Back</button>
                      <button type="submit" disabled={saving || saved} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ background: saved ? '#16a34a' : '#3b82f6', color: 'white' }}>
                        {saved ? <><CheckCircle className="w-4 h-4" /> Created!</> : saving ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} /> : 'Create Job Card'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Job Detail Drawer ────────────────────────────────────────────────────────
function JobDetailDrawer({ job, onClose, onStatusChange }: { job: JobCard; onClose: () => void; onStatusChange: (id: string, status: JobStatus) => void }) {
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [notes, setNotes] = useState(job.repairNotes || '')
  const [labour, setLabour] = useState(job.labourCharges.toString())
  const partsCost = job.parts.reduce((s, p) => s + p.total, 0)

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="fixed top-0 right-0 h-full w-full max-w-md z-50 overflow-y-auto"
          style={{ background: 'hsl(240 10% 5.5%)', borderLeft: '1px solid hsl(240 3.7% 15.9%)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
            <div>
              <h2 className="font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>{job.jobNumber}</h2>
              <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>{job.vehicleName} · {job.vehicleNumber}</p>
            </div>
            <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-5">
            {/* Status changer */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'hsl(240 5% 64.9%)' }}>CURRENT STATUS</p>
              <div className="relative">
                <button onClick={() => setShowStatusPicker(!showStatusPicker)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium"
                  style={{ background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }}>
                  <span>{job.status}</span>
                  <ChevronDown className="w-4 h-4" style={{ color: 'hsl(240 5% 64.9%)' }} />
                </button>
                <AnimatePresence>
                  {showStatusPicker && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute top-14 left-0 right-0 rounded-xl shadow-xl z-10 overflow-hidden py-1"
                      style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>
                      {ALL_STATUSES.map(s => (
                        <button key={s} onClick={() => { onStatusChange(job.id, s); setShowStatusPicker(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                          style={{ color: s === job.status ? '#60a5fa' : 'hsl(0 0% 98%)', background: s === job.status ? 'rgba(59,130,246,0.1)' : 'transparent', fontWeight: s === job.status ? 600 : 400 }}
                          onMouseEnter={e => { if (s !== job.status) e.currentTarget.style.background = 'hsl(240 3.7% 15.9%)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = s === job.status ? 'rgba(59,130,246,0.1)' : 'transparent' }}>
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* Info */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(240 3.7% 15.9%)' }}>
              {[
                { label: 'Customer', value: job.customerName },
                { label: 'Phone', value: job.customerPhone },
                { label: 'Priority', value: job.priority },
                { label: 'Mechanic', value: job.mechanicName || 'Unassigned' },
                { label: 'Est. Completion', value: job.estimatedCompletion ? formatDate(job.estimatedCompletion) : '—' },
              ].map((row, i, arr) => (
                <div key={row.label} className="flex justify-between px-3 py-2.5 text-sm" style={{ borderBottom: i < arr.length - 1 ? '1px solid hsl(240 3.7% 15.9%)' : 'none' }}>
                  <span style={{ color: 'hsl(240 5% 64.9%)' }}>{row.label}</span>
                  <span className="font-medium" style={{ color: 'hsl(0 0% 98%)' }}>{row.value}</span>
                </div>
              ))}
            </div>
            {/* Complaint */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'hsl(240 5% 64.9%)' }}>COMPLAINT</p>
              <p className="text-sm p-3 rounded-xl" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }}>{job.complaint}</p>
            </div>
            {/* Repair Notes editable */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'hsl(240 5% 64.9%)' }}>REPAIR NOTES</p>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add repair notes..." className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }} />
            </div>
            {/* Labour */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'hsl(240 5% 64.9%)' }}>LABOUR CHARGES (₹)</p>
              <input type="number" value={labour} onChange={e => setLabour(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }} />
            </div>
            {/* Parts */}
            {job.parts.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'hsl(240 5% 64.9%)' }}>PARTS USED</p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(240 3.7% 15.9%)' }}>
                  {job.parts.map((part, i) => (
                    <div key={i} className="flex justify-between items-center px-3 py-2.5 text-sm" style={{ borderBottom: i < job.parts.length - 1 ? '1px solid hsl(240 3.7% 15.9%)' : 'none' }}>
                      <div><p className="font-medium" style={{ color: 'hsl(0 0% 98%)' }}>{part.partName}</p><p style={{ color: 'hsl(240 5% 64.9%)' }}>Qty: {part.quantity} × ₹{part.unitPrice.toLocaleString('en-IN')}</p></div>
                      <span className="font-bold" style={{ color: 'hsl(0 0% 98%)' }}>₹{part.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Total */}
            <div className="flex justify-between items-center p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <span className="font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>Total Estimate</span>
              <span className="text-xl font-bold" style={{ color: '#60a5fa' }}>₹{(parseInt(labour || '0') + partsCost).toLocaleString('en-IN')}</span>
            </div>
            {/* Status Timeline */}
            <div>
              <p className="text-xs font-medium mb-3" style={{ color: 'hsl(240 5% 64.9%)' }}>STATUS HISTORY</p>
              <div className="space-y-3">
                {job.statusHistory.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#3b82f6', boxShadow: '0 0 0 3px rgba(59,130,246,0.2)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'hsl(0 0% 98%)' }}>{entry.status}</p>
                      <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>{formatDate(entry.changedAt)} · {entry.changedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobs, setJobs] = useState<JobCard[]>(mockJobs)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewJob, setViewJob] = useState<JobCard | null>(null)

  const filtered = jobs.filter(j => {
    const ms = j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.toLowerCase().includes(search.toLowerCase()) ||
      j.vehicleNumber.toLowerCase().includes(search.toLowerCase())
    const mf = statusFilter === 'all' || j.status === statusFilter
    return ms && mf
  })

  const handleSaveJob = (data: NewJobForm) => {
    const customer = mockCustomers.find(c => c.id === data.customerId)
    const vehicle = mockVehicles.find(v => v.id === data.vehicleId)
    const newJob: JobCard = {
      id: `j${Date.now()}`,
      jobNumber: `JOB-2026-${String(jobs.length + 1).padStart(3, '0')}`,
      customerId: data.customerId, customerName: customer?.name || '',
      customerPhone: customer?.phone || '', vehicleId: data.vehicleId,
      vehicleNumber: vehicle?.vehicleNumber || '', vehicleName: `${vehicle?.brand} ${vehicle?.model}`,
      complaint: data.complaint, inspectionNotes: data.inspectionNotes,
      priority: data.priority, status: 'Received',
      mechanicName: data.mechanicName, estimatedCompletion: data.estimatedCompletion,
      labourCharges: parseInt(data.labourCharges) || 0, parts: [], statusHistory: [
        { status: 'Received', changedAt: new Date().toISOString(), changedBy: 'Admin' }
      ],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    setJobs(prev => [newJob, ...prev])
  }

  const handleStatusChange = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? {
      ...j, status,
      statusHistory: [...j.statusHistory, { status, changedAt: new Date().toISOString(), changedBy: 'Admin' }],
      updatedAt: new Date().toISOString(),
    } : j))
    setViewJob(prev => prev && prev.id === id ? {
      ...prev, status,
      statusHistory: [...prev.statusHistory, { status, changedAt: new Date().toISOString(), changedBy: 'Admin' }],
    } : prev)
  }

  const Icon = (status: string) => ({ 'Received': Clock, 'Repairing': Wrench, 'Completed': CheckCircle, 'Waiting for Parts': AlertCircle }[status] || Wrench)

  return (
    <div>
      <PageHeader title="Job Cards" description={`${jobs.length} total jobs`}>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> New Job Card</button>
      </PageHeader>
      <div className="premium-card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job number, customer, vehicle..." className="input-field pl-9" />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 flex-wrap">
          {['all', ...ALL_STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors', statusFilter === s ? 'text-white' : 'bg-secondary text-muted-foreground')}
              style={statusFilter === s ? { background: '#3b82f6' } : {}}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Wrench className="w-7 h-7" />} title="No jobs found" description="Create a new job card to get started." action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> New Job Card</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job, i) => {
            const IconComp = Icon(job.status)
            const partsCost = job.parts.reduce((s, p) => s + p.total, 0)
            return (
              <motion.div key={job.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }} className="premium-card p-4 cursor-pointer" onClick={() => setViewJob(job)}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <IconComp className="w-4 h-4" style={{ color: '#60a5fa' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{job.jobNumber}</p>
                      <p className="text-xs text-muted-foreground">{job.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge variant={getJobStatusVariant(job.status)}>{job.status}</StatusBadge>
                    <PriorityBadge priority={job.priority} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.complaint}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{job.customerName}</p></div>
                  <div><p className="text-muted-foreground">Mechanic</p><p className="font-medium">{job.mechanicName || '—'}</p></div>
                  <div><p className="text-muted-foreground">Est. completion</p><p className="font-medium">{job.estimatedCompletion ? formatDate(job.estimatedCompletion) : '—'}</p></div>
                  <div><p className="text-muted-foreground">Total</p><p className="font-medium">₹{(job.labourCharges + partsCost).toLocaleString('en-IN')}</p></div>
                </div>
                <div className="pt-2 border-t border-border/30 text-xs" style={{ color: '#60a5fa' }}>Click to view details & change status →</div>
              </motion.div>
            )
          })}
        </div>
      )}
      <NewJobModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveJob} />
      {viewJob && <JobDetailDrawer job={viewJob} onClose={() => setViewJob(null)} onStatusChange={handleStatusChange} />}
    </div>
  )
}
