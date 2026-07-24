import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, FileText, ArrowRight, CheckCircle, X, Trash2, Edit } from 'lucide-react'
import { mockQuotations, mockCustomers, mockVehicles, mockInventory } from '@/mock/data'
import { PageHeader, StatusBadge, getQuotationStatusVariant, EmptyState } from '@/components/common'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Quotation, QuotationStatus } from '@/types'

const STATUSES: QuotationStatus[] = ['Draft', 'Pending', 'Approved', 'Rejected', 'Expired']

interface QItem {
  description: string
  type: 'labour' | 'part' | 'other'
  partId?: string
  quantity: number
  unitPrice: number
  discount: number
}

interface QForm {
  customerId: string
  vehicleId: string
  validUntil: string
  items: QItem[]
  discountPercent: number
  gstPercent: number
  notes: string
  status: QuotationStatus
}

const emptyQ: QForm = {
  customerId: '', vehicleId: '', validUntil: '', items: [],
  discountPercent: 0, gstPercent: 18, notes: '', status: 'Pending',
}

function calcTotals(items: QItem[], discountPercent: number, gstPercent: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const discountAmount = Math.round(subtotal * discountPercent / 100)
  const taxable = subtotal - discountAmount
  const gstAmount = Math.round(taxable * gstPercent / 100)
  return { subtotal, discountAmount, gstAmount, grandTotal: taxable + gstAmount }
}

function QuotationModal({ open, onClose, quotation, onSave }: {
  open: boolean; onClose: () => void; quotation?: Quotation | null; onSave: (q: Partial<Quotation>) => void
}) {
  const [form, setForm] = useState<QForm>(quotation ? {
    customerId: quotation.customerId,
    vehicleId: quotation.vehicleId || '',
    validUntil: quotation.validUntil,
    items: quotation.items.map(i => ({
      description: i.description, type: i.type,
      partId: i.partId, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount || 0,
    })),
    discountPercent: quotation.discountPercent,
    gstPercent: quotation.gstPercent,
    notes: quotation.notes || '',
    status: quotation.status,
  } : { ...emptyQ })
  const [errors, setErrors] = useState<{ customerId?: string; items?: string }>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (f: keyof QForm, v: unknown) => setForm(p => ({ ...p, [f]: v }))
  const customerVehicles = mockVehicles.filter(v => v.customerId === form.customerId)
  const totals = calcTotals(form.items, form.discountPercent, form.gstPercent)

  const addItem = () => set('items', [...form.items, { description: '', type: 'labour' as const, quantity: 1, unitPrice: 0, discount: 0 }])
  const removeItem = (i: number) => set('items', form.items.filter((_, idx) => idx !== i))

  const updateItem = (i: number, field: keyof QItem, value: unknown) => {
    set('items', form.items.map((item, idx) => {
      if (idx !== i) return item
      if (field === 'partId' && typeof value === 'string') {
        const part = mockInventory.find(p => p.id === value)
        return { ...item, partId: value, description: part?.name || item.description, unitPrice: part?.sellingPrice || item.unitPrice }
      }
      return { ...item, [field]: value }
    }))
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs: { customerId?: string; items?: string } = {}
    if (!form.customerId) errs.customerId = 'Select a customer'
    if (form.items.length === 0) errs.items = 'Add at least one item'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    const customer = mockCustomers.find(c => c.id === form.customerId)
    const vehicle = mockVehicles.find(v => v.id === form.vehicleId)
    onSave({
      customerId: form.customerId, customerName: customer?.name || '', customerPhone: customer?.phone || '',
      vehicleId: form.vehicleId, vehicleNumber: vehicle?.vehicleNumber || '',
      vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : '',
      validUntil: form.validUntil,
      items: form.items.map(i => ({ ...i, total: i.quantity * i.unitPrice })),
      discountPercent: form.discountPercent, discountAmount: totals.discountAmount,
      gstPercent: form.gstPercent, gstAmount: totals.gstAmount,
      subtotal: totals.subtotal, grandTotal: totals.grandTotal,
      labourCharges: form.items.filter(i => i.type === 'labour').reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      notes: form.notes, status: form.status,
    })
    setSaved(true)
    await new Promise(r => setTimeout(r, 700))
    setSaved(false); setSaving(false); onClose()
  }

  const fc = 'px-3 py-2 rounded-xl text-sm outline-none'
  const fs = { background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }
  const itemFs = { background: 'hsl(240 10% 5.5%)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(0 0% 98%)' }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>

              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.2)' }}>
                    <FileText className="w-4 h-4" style={{ color: '#facc15' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>
                      {quotation ? 'Edit Quotation' : 'New Quotation'}
                    </h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>
                      {quotation ? quotation.quotationNumber : 'Create a new quotation'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Row 1: Customer + Vehicle */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>
                      Customer <span style={{ color: '#f97316' }}>*</span>
                    </label>
                    <select value={form.customerId}
                      onChange={e => { setForm(f => ({ ...f, customerId: e.target.value, vehicleId: '' })); setErrors(er => ({ ...er, customerId: '' })) }}
                      className={fc + ' w-full'} style={{ ...fs, border: errors.customerId ? '1px solid #ef4444' : fs.border }}>
                      <option value="">— Select Customer —</option>
                      {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.customerId && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.customerId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Vehicle</label>
                    <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}
                      className={fc + ' w-full'} style={fs} disabled={!form.customerId}>
                      <option value="">{form.customerId ? '— Select Vehicle —' : '— Select customer first —'}</option>
                      {customerVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} — {v.brand} {v.model}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value as QuotationStatus)}
                      className={fc + ' w-full'} style={fs}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Valid Until</label>
                    <input type="date" value={form.validUntil} onChange={e => set('validUntil', e.target.value)}
                      className={fc + ' w-full'} style={fs} />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: 'hsl(0 0% 98%)' }}>
                      Items <span style={{ color: '#f97316' }}>*</span>
                    </label>
                    <button type="button" onClick={addItem}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>
                  {errors.items && <p className="text-xs mb-2" style={{ color: '#f87171' }}>{errors.items}</p>}
                  <div className="space-y-2">
                    {form.items.map((item, i) => (
                      <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'hsl(240 3.7% 15.9%)' }}>
                        <div className="flex gap-2 items-center">
                          <select value={item.type} onChange={e => updateItem(i, 'type', e.target.value)}
                            className="px-2 py-1.5 rounded-lg text-xs outline-none flex-shrink-0" style={itemFs}>
                            <option value="labour">Labour</option>
                            <option value="part">Part</option>
                          </select>
                          {item.type === 'part' ? (
                            <select value={item.partId || ''} onChange={e => updateItem(i, 'partId', e.target.value)}
                              className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none" style={itemFs}>
                              <option value="">Select part...</option>
                              {mockInventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          ) : (
                            <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                              placeholder="Service description..." className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none" style={itemFs} />
                          )}
                          <button type="button" onClick={() => removeItem(i)} style={{ color: '#f87171' }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <p className="text-xs mb-1" style={{ color: 'hsl(240 5% 64.9%)' }}>Qty</p>
                            <input type="number" min="1" value={item.quantity}
                              onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 rounded-lg text-xs outline-none text-center" style={itemFs} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs mb-1" style={{ color: 'hsl(240 5% 64.9%)' }}>Unit Price (₹)</p>
                            <input type="number" min="0" value={item.unitPrice}
                              onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 rounded-lg text-xs outline-none" style={itemFs} />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-xs mb-1" style={{ color: 'hsl(240 5% 64.9%)' }}>Total</p>
                            <p className="text-sm font-bold px-2 py-1" style={{ color: '#60a5fa' }}>
                              ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount & GST */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Discount (%)</label>
                    <input type="number" min="0" max="100" value={form.discountPercent}
                      onChange={e => set('discountPercent', parseFloat(e.target.value) || 0)}
                      className={fc + ' w-full'} style={fs} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>GST (%)</label>
                    <input type="number" min="0" max="28" value={form.gstPercent}
                      onChange={e => set('gstPercent', parseFloat(e.target.value) || 0)}
                      className={fc + ' w-full'} style={fs} />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
                    placeholder="Any notes for the customer..." className={fc + ' w-full resize-none'} style={fs} />
                </div>

                {/* Live Totals */}
                {form.items.length > 0 && (
                  <div className="p-4 rounded-xl space-y-2"
                    style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'hsl(240 5% 64.9%)' }}>Subtotal</span>
                      <span style={{ color: 'hsl(0 0% 98%)' }}>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'hsl(240 5% 64.9%)' }}>Discount ({form.discountPercent}%)</span>
                        <span style={{ color: '#f87171' }}>-₹{totals.discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'hsl(240 5% 64.9%)' }}>GST ({form.gstPercent}%)</span>
                      <span style={{ color: 'hsl(0 0% 98%)' }}>₹{totals.gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
                      <span style={{ color: 'hsl(0 0% 98%)' }}>Grand Total</span>
                      <span style={{ color: '#60a5fa' }}>₹{totals.grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: saved ? '#16a34a' : '#3b82f6', color: 'white' }}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                      : saving ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                        : (quotation ? 'Save Changes' : 'Create Quotation')}
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

export default function QuotationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations)
  const [modalOpen, setModalOpen] = useState(false)
  const [editQuotation, setEditQuotation] = useState<Quotation | null>(null)
  const [convertMsg, setConvertMsg] = useState<string | null>(null)

  const filtered = quotations.filter(q => {
    const ms = q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      q.vehicleNumber.toLowerCase().includes(search.toLowerCase())
    const mf = statusFilter === 'all' || q.status === statusFilter
    return ms && mf
  })

  const handleSave = (data: Partial<Quotation>) => {
    if (editQuotation) {
      setQuotations(prev => prev.map(q => q.id === editQuotation.id
        ? { ...q, ...data, updatedAt: new Date().toISOString() } : q))
    } else {
      const newQ: Quotation = {
        id: `q${Date.now()}`,
        quotationNumber: `QUO-2026-${String(quotations.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as Quotation
      setQuotations(prev => [newQ, ...prev])
    }
    setEditQuotation(null)
  }

  const handleConvert = (q: Quotation) => {
    const invNum = `INV-2026-${String(Date.now()).slice(-4)}`
    setConvertMsg(`✅ ${q.quotationNumber} converted to ${invNum} successfully! Go to Billing to view.`)
    setQuotations(prev => prev.map(x => x.id === q.id ? { ...x, status: 'Approved' as QuotationStatus } : x))
    setTimeout(() => setConvertMsg(null), 6000)
  }

  const openAdd = () => { setEditQuotation(null); setModalOpen(true) }
  const openEdit = (q: Quotation) => { setEditQuotation(q); setModalOpen(true) }

  return (
    <div>
      <PageHeader title="Quotations" description={`${quotations.length} total quotations`}>
        <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> New Quotation</button>
      </PageHeader>

      <AnimatePresence>
        {convertMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl mb-4"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#4ade80' }} />
            <p className="text-sm" style={{ color: '#4ade80' }}>{convertMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="premium-card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quotation number, customer, vehicle..." className="input-field pl-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                statusFilter === s ? 'text-white' : 'bg-secondary text-muted-foreground')}
              style={statusFilter === s ? { background: '#3b82f6' } : {}}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="w-7 h-7" />} title="No quotations found"
          action={<button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> New Quotation</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} whileHover={{ y: -2 }} className="premium-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <FileText className="w-4 h-4" style={{ color: '#facc15' }} />
                    <span className="font-semibold text-sm">{q.quotationNumber}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(q.date)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(q)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <StatusBadge variant={getQuotationStatusVariant(q.status)}>{q.status}</StatusBadge>
                </div>
              </div>

              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{q.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="font-medium">{q.vehicleNumber || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{q.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Until</span>
                  <span className="font-medium">{q.validUntil ? formatDate(q.validUntil) : '—'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Grand Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(q.grandTotal)}</p>
                    <p className="text-xs text-muted-foreground">incl. GST {q.gstPercent}%</p>
                  </div>
                  {(q.status === 'Approved' || q.status === 'Pending') && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleConvert(q)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Convert to Invoice
                      <ArrowRight className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <QuotationModal open={modalOpen} onClose={() => { setModalOpen(false); setEditQuotation(null) }}
        quotation={editQuotation} onSave={handleSave} />
    </div>
  )
}
