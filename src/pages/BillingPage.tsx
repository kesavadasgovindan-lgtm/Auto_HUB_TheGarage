import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Receipt, Printer, Download, Share2, Mail, X, CheckCircle, Trash2, FileText } from 'lucide-react'
import { mockInvoices, mockCustomers, mockVehicles, mockInventory, mockQuotations } from '@/mock/data'
import { PageHeader, StatusBadge, getInvoiceStatusVariant, EmptyState } from '@/components/common'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Invoice } from '@/types'

type PayMode = 'Cash' | 'UPI' | 'Credit Card' | 'Bank Transfer' | 'Credit'
const PAY_MODES: PayMode[] = ['Cash', 'UPI', 'Credit Card', 'Bank Transfer', 'Credit']

interface InvItem { description: string; type: 'labour' | 'part' | 'other'; quantity: number; unitPrice: number }
interface InvForm {
  customerId: string; vehicleId: string; items: InvItem[]
  discountPercent: number; gstPercent: number; paymentMode: PayMode
}

const emptyInv: InvForm = {
  customerId: '', vehicleId: '', items: [], discountPercent: 0, gstPercent: 18, paymentMode: 'Cash',
}

function calcInv(items: InvItem[], dp: number, gp: number) {
  const sub = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const disc = Math.round(sub * dp / 100)
  const gst = Math.round((sub - disc) * gp / 100)
  return { subtotal: sub, discountAmount: disc, gstAmount: gst, grandTotal: sub - disc + gst }
}

type SourceQuotation = typeof mockQuotations[0]

function InvoiceModal({ open, onClose, onSave, fromQuotation }: {
  open: boolean; onClose: () => void; onSave: (inv: Partial<Invoice>) => void; fromQuotation?: SourceQuotation | null
}) {
  const [form, setForm] = useState<InvForm>(() => fromQuotation ? {
    customerId: fromQuotation.customerId,
    vehicleId: fromQuotation.vehicleId || '',
    items: fromQuotation.items.map(i => ({ description: i.description, type: i.type, quantity: i.quantity, unitPrice: i.unitPrice })),
    discountPercent: fromQuotation.discountPercent,
    gstPercent: fromQuotation.gstPercent,
    paymentMode: 'Cash',
  } : { ...emptyInv })
  const [errors, setErrors] = useState<{ customerId?: string; items?: string }>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (f: keyof InvForm, v: unknown) => setForm(p => ({ ...p, [f]: v }))
  const customerVehicles = mockVehicles.filter(v => v.customerId === form.customerId)
  const totals = calcInv(form.items, form.discountPercent, form.gstPercent)

  const addItem = () => set('items', [...form.items, { description: '', type: 'labour' as const, quantity: 1, unitPrice: 0 }])
  const removeItem = (i: number) => set('items', form.items.filter((_, idx) => idx !== i))

  const updateItem = (i: number, field: keyof InvItem, value: unknown) => {
    set('items', form.items.map((item, idx) => {
      if (idx !== i) return item
      if (field === 'description' && typeof value === 'string') {
        const part = mockInventory.find(p => p.id === value)
        if (part) return { ...item, description: part.name, unitPrice: part.sellingPrice, type: 'part' as const }
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
      customerId: form.customerId, customerName: customer?.name || '',
      customerPhone: customer?.phone || '', customerEmail: customer?.email || '',
      vehicleId: form.vehicleId, vehicleNumber: vehicle?.vehicleNumber || '',
      vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : '',
      items: form.items.map(i => ({ ...i, discount: 0, total: i.quantity * i.unitPrice })),
      labourCharges: form.items.filter(i => i.type === 'labour').reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      subtotal: totals.subtotal, discountAmount: totals.discountAmount,
      discountPercent: form.discountPercent, gstPercent: form.gstPercent,
      gstAmount: totals.gstAmount, grandTotal: totals.grandTotal,
      amountPaid: totals.grandTotal, amountDue: 0,
      paymentMode: form.paymentMode, status: 'Paid',
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
                    style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Receipt className="w-4 h-4" style={{ color: '#60a5fa' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>
                      {fromQuotation ? `Invoice from ${fromQuotation.quotationNumber}` : 'New Invoice'}
                    </h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>
                      {fromQuotation ? 'Items pre-filled from quotation' : 'Create a direct invoice'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>
                      Customer <span style={{ color: '#f97316' }}>*</span>
                    </label>
                    <select value={form.customerId}
                      onChange={e => setForm(f => ({ ...f, customerId: e.target.value, vehicleId: '' }))}
                      className={fc + ' w-full'} style={{ ...fs, border: errors.customerId ? '1px solid #ef4444' : fs.border }}
                      disabled={!!fromQuotation}>
                      <option value="">— Select Customer —</option>
                      {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.customerId && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.customerId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Vehicle</label>
                    <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}
                      className={fc + ' w-full'} style={fs}
                      disabled={!form.customerId || !!fromQuotation}>
                      <option value="">{form.customerId ? '— Select Vehicle —' : '— Select customer first —'}</option>
                      {customerVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} — {v.brand} {v.model}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(0 0% 98%)' }}>Payment Mode</label>
                    <div className="flex gap-2 flex-wrap">
                      {PAY_MODES.map(m => (
                        <button type="button" key={m} onClick={() => set('paymentMode', m)}
                          className="flex-1 min-w-fit py-2 rounded-xl text-xs font-medium border transition-colors"
                          style={form.paymentMode === m
                            ? { background: '#3b82f6', color: 'white', border: '1px solid #3b82f6' }
                            : { ...fs, border: '1px solid hsl(240 3.7% 15.9%)' }}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items */}
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
                      <div key={i} className="flex gap-2 items-center p-3 rounded-xl"
                        style={{ background: 'hsl(240 3.7% 15.9%)' }}>
                        <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                          placeholder="Description..." className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none" style={itemFs} />
                        <input type="number" min="1" value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-14 px-2 py-1.5 rounded-lg text-xs outline-none text-center" style={itemFs} />
                        <input type="number" min="0" value={item.unitPrice}
                          onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="Price" className="w-24 px-2 py-1.5 rounded-lg text-xs outline-none" style={itemFs} />
                        <span className="text-xs font-bold w-20 text-right flex-shrink-0" style={{ color: '#60a5fa' }}>
                          ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                        </span>
                        <button type="button" onClick={() => removeItem(i)} style={{ color: '#f87171' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GST & Discount */}
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
                    {saved ? <><CheckCircle className="w-4 h-4" /> Invoice Created!</>
                      : saving ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                        : 'Create Invoice'}
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

export default function BillingPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [modalOpen, setModalOpen] = useState(false)
  const [fromQModal, setFromQModal] = useState(false)
  const [selectedQ, setSelectedQ] = useState<SourceQuotation | null>(null)
  const [showQList, setShowQList] = useState(false)

  const filtered = invoices.filter(inv => {
    const ms = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.vehicleNumber || '').toLowerCase().includes(search.toLowerCase())
    const mt = tab === 'all' || (tab === 'paid' && inv.status === 'Paid') || (tab === 'unpaid' && inv.status !== 'Paid')
    return ms && mt
  })

  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.grandTotal, 0)
  const totalDue = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amountDue, 0)

  const handleSave = (data: Partial<Invoice>) => {
    const newInv: Invoice = {
      id: `i${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Invoice
    setInvoices(prev => [newInv, ...prev])
    setSelectedQ(null)
  }

  const openFromQuotation = (q: SourceQuotation) => {
    setSelectedQ(q)
    setShowQList(false)
    setFromQModal(true)
  }

  const approvedQuotations = mockQuotations.filter(q => q.status === 'Approved' || q.status === 'Pending')

  return (
    <div onClick={() => showQList && setShowQList(false)}>
      <PageHeader title="Billing" description="Manage invoices and payments">
        <div className="flex gap-2">
          {/* From Quotation */}
          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setShowQList(!showQList) }} className="btn-secondary">
              <FileText className="w-4 h-4" /> From Quotation
            </button>
            <AnimatePresence>
              {showQList && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 top-11 w-72 rounded-xl shadow-2xl z-20 overflow-hidden"
                  style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}
                  onClick={e => e.stopPropagation()}>
                  <div className="p-3 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'hsl(240 5% 64.9%)' }}>SELECT QUOTATION</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {approvedQuotations.length === 0 ? (
                      <div className="p-4 text-center text-sm" style={{ color: 'hsl(240 5% 64.9%)' }}>
                        No approved quotations
                      </div>
                    ) : approvedQuotations.map(q => (
                      <button key={q.id} onClick={() => openFromQuotation(q)}
                        className="w-full text-left px-4 py-3 transition-colors border-b text-sm"
                        style={{ borderColor: 'hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'hsl(240 3.7% 15.9%)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <p className="font-medium">{q.quotationNumber}</p>
                        <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>
                          {q.customerName} · {formatCurrency(q.grandTotal)}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="btn-primary" onClick={() => { setSelectedQ(null); setModalOpen(true) }}>
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total Invoices', value: invoices.length.toString(), color: 'hsl(0 0% 98%)' },
          { label: 'Revenue Collected', value: formatCurrency(totalRevenue), color: '#4ade80' },
          { label: 'Amount Due', value: formatCurrency(totalDue), color: '#f87171' },
          { label: 'Paid Invoices', value: invoices.filter(i => i.status === 'Paid').length.toString(), color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} className="premium-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="premium-card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice, customer, vehicle..." className="input-field pl-9" />
        </div>
        <div className="flex gap-1">
          {(['all', 'paid', 'unpaid'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                tab === t ? 'text-white' : 'bg-secondary text-muted-foreground')}
              style={tab === t ? { background: '#3b82f6' } : {}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Receipt className="w-7 h-7" />} title="No invoices found"
            action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> New Invoice</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th className="hidden md:table-cell">Vehicle</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Payment</th>
                  <th className="text-right">Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(59,130,246,0.1)' }}>
                          <Receipt className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium">{inv.customerName}</p>
                        <p className="text-xs text-muted-foreground">{inv.customerPhone}</p>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-sm text-muted-foreground">{inv.vehicleNumber || '—'}</td>
                    <td><StatusBadge variant={getInvoiceStatusVariant(inv.status)}>{inv.status}</StatusBadge></td>
                    <td className="hidden sm:table-cell">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-lg">{inv.paymentMode}</span>
                    </td>
                    <td className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(inv.grandTotal)}</p>
                      {inv.amountDue > 0 && <p className="text-xs" style={{ color: '#f87171' }}>Due: {formatCurrency(inv.amountDue)}</p>}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="Print" onClick={() => window.print()}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button title="Download"
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button title="WhatsApp / Share"
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                          style={{ color: '#4ade80' }}
                          onMouseLeave={e => (e.currentTarget.style.color = '#4ade80')}>
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button title="Email"
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          style={{ color: '#60a5fa' }}>
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      <InvoiceModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />

      {/* From Quotation Modal */}
      <InvoiceModal open={fromQModal} onClose={() => { setFromQModal(false); setSelectedQ(null) }}
        onSave={handleSave} fromQuotation={selectedQ} />
    </div>
  )
}
