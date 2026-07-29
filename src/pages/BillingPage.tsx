import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CreditCard, Plus, CheckCircle, FileText, X, Trash2, Printer, Wrench } from 'lucide-react'
import { billingService, quotationsService, customersService, vehiclesService, inventoryService } from '@/services'
import { PageHeader, EmptyState, PrintDocumentModal } from '@/components/common'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Customer, Vehicle, InventoryItem } from '@/types'

interface DirectBillItem {
  itemId?: string | number
  description: string
  quantity: number
  rate: number
  discount: number
  isLabour: boolean
  vatApplicable?: boolean
  vatPercent?: number
}

// ─── Direct New Bill Modal ───────────────────────────────────────────────────

interface DirectBillModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => Promise<void>
}

function DirectBillModal({ open, onClose, onComplete }: DirectBillModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customerId, setCustomerId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [paymentMode, setPaymentMode] = useState('')
  const [status, setStatus] = useState('')
  const [labourCharges, setLabourCharges] = useState<number>(0)
  const [items, setItems] = useState<DirectBillItem[]>([
    { itemId: '', description: '', quantity: 1, rate: 0, discount: 0, isLabour: false, vatApplicable: true, vatPercent: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      customersService.getAll().then(setCustomers).catch(() => {})
      vehiclesService.getAll().then(setVehicles).catch(() => {})
      inventoryService.getAll().then(setInventory).catch(() => {})
      setCustomerId('')
      setVehicleId('')
      setPaymentMode('')
      setStatus('')
      setLabourCharges(0)
      setItems([{ itemId: '', description: '', quantity: 1, rate: 0, discount: 0, isLabour: false, vatApplicable: true, vatPercent: 0 }])
    }
  }, [open])

  const filteredVehicles = vehicles.filter(v => !customerId || v.customerId?.toString() === customerId.toString())

  const addItem = () => setItems(prev => [...prev, { itemId: '', description: '', quantity: 1, rate: 0, discount: 0, isLabour: false, vatApplicable: true, vatPercent: 0 }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof DirectBillItem, val: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item))
  }

  const handleSelectInventory = (idx: number, selectedId: string) => {
    if (!selectedId) {
      setItems(prev => prev.map((item, i) => i === idx ? { ...item, itemId: '', vatPercent: 0 } : item))
      return
    }
    const inv = inventory.find(invItem => invItem.id.toString() === selectedId.toString())
    if (inv) {
      const rawVat = (inv as any).vatRate ?? (inv as any).VatRate ?? (inv as any).vatPercent ?? (inv as any).VatPercent
      const defaultVat = (rawVat !== undefined && rawVat !== null) ? Number(rawVat) : 0
      setItems(prev => prev.map((item, i) => i === idx ? {
        ...item,
        itemId: inv.id.toString(),
        description: inv.name,
        rate: inv.sellingPrice || inv.mrp || 0,
        vatApplicable: defaultVat > 0,
        vatPercent: defaultVat
      } : item))
    }
  }

  const itemGross = items.reduce((s, i) => s + ((i.rate || 0) * (i.quantity || 1) - (i.discount || 0)), 0)
  const itemVat = items.reduce((s, i) => {
    const gross = (i.rate || 0) * (i.quantity || 1) - (i.discount || 0)
    const vRate = i.vatApplicable === false ? 0 : ((i.vatPercent ?? 0) / 100)
    return s + (gross * vRate)
  }, 0)

  const labour = labourCharges || 0
  const labourVat = labour * 0.05
  const subtotal = itemGross + labour
  const totalVat = itemVat + labourVat
  const grandTotal = subtotal + totalVat

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) { alert('Please select a customer'); return }
    if (!paymentMode) { alert('Please select a Payment Mode'); return }
    if (!status) { alert('Please select Payment Status'); return }
    if (items.length === 0 || !items.some(i => i.description.trim())) {
      alert('Please add at least one line item')
      return
    }
    setSaving(true)
    try {
      const cust = customers.find(c => c.id.toString() === customerId.toString())
      const veh = vehicles.find(v => v.id.toString() === vehicleId.toString())

      const payload = {
        customerId: parseInt(customerId),
        customerName: cust?.name || 'Customer',
        vehicleNumber: veh?.vehicleNumber || '—',
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString(),
        subTotal: subtotal,
        vatAmount: totalVat,
        netAmount: grandTotal,
        status,
        paymentMode,
        labourCharges: labour,
        items: items.filter(i => i.description.trim()).map(i => ({
          itemId: i.itemId ? parseInt(i.itemId as any) : null,
          description: i.description,
          rate: parseFloat(i.rate as any) || 0,
          quantity: parseInt(i.quantity as any) || 1,
          discount: parseFloat(i.discount as any) || 0,
          isLabour: i.isLabour,
          vatApplicable: i.vatApplicable,
          vatPercent: i.vatPercent,
          grossAmount: (i.rate || 0) * (i.quantity || 1),
          netAmount: (i.rate || 0) * (i.quantity || 1) - (i.discount || 0)
        }))
      }

      await billingService.create(payload as any)
      setSaved(true)
      await new Promise(r => setTimeout(r, 600))
      setSaved(false)
      await onComplete()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to create bill')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl bg-card border border-border">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                <h2 className="font-semibold text-base text-foreground">Create Direct Bill / Invoice</h2>
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Customer *</label>
                    <select value={customerId} onChange={e => { setCustomerId(e.target.value); setVehicleId('') }} className="input-field text-xs py-2">
                      <option value="">— Select Customer —</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Vehicle</label>
                    <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="input-field text-xs py-2">
                      <option value="">— Select Vehicle —</option>
                      {filteredVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.brand} {v.model})</option>)}
                    </select>
                  </div>
                </div>

                {/* Line Items Grid Layout */}
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-foreground">Bill Line Items</span>
                    <button type="button" onClick={addItem} className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  {/* Table Column Headers */}
                  <div className="grid grid-cols-[140px_1fr_60px_85px_65px_36px] gap-2 text-[11px] font-semibold text-muted-foreground px-1">
                    <div>Inventory Item</div>
                    <div>Description</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Rate (₹)</div>
                    <div className="text-right">VAT %</div>
                    <div></div>
                  </div>

                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[140px_1fr_60px_85px_65px_36px] gap-2 items-center">
                      <select
                        value={item.itemId || ''}
                        onChange={e => handleSelectInventory(i, e.target.value)}
                        className="input-field text-xs py-2 h-9"
                      >
                        <option value="">— Select —</option>
                        {inventory.map(inv => (
                          <option key={inv.id} value={inv.id.toString()}>
                            {inv.name} (₹{inv.sellingPrice || inv.mrp})
                          </option>
                        ))}
                      </select>

                      <input
                        placeholder="Item description"
                        value={item.description}
                        onChange={e => updateItem(i, 'description', e.target.value)}
                        className="input-field text-xs py-2 h-9"
                      />

                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                        className="input-field text-xs py-2 text-center h-9"
                      />

                      <input
                        type="number"
                        placeholder="Rate ₹"
                        value={item.rate === 0 ? '' : item.rate}
                        onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                        className="input-field text-xs py-2 text-right h-9"
                      />

                      <input
                        type="number"
                        placeholder="VAT %"
                        value={item.vatPercent}
                        onChange={e => updateItem(i, 'vatPercent', parseFloat(e.target.value) ?? 0)}
                        className="input-field text-xs py-2 text-right h-9 font-medium text-blue-400"
                        title="Per-item VAT Percentage"
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="h-9 w-9 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete line item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Dedicated Labour Charges Input */}
                  <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-3 items-center">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Wrench className="w-3.5 h-3.5 text-blue-400" /> Labour Charge (₹)
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={labourCharges === 0 ? '' : labourCharges}
                      onChange={e => setLabourCharges(parseFloat(e.target.value) || 0)}
                      className="input-field text-xs py-1.5 text-right font-medium"
                    />
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-border/40">
                    <span className="text-muted-foreground">Subtotal: ₹{subtotal.toLocaleString('en-IN')} + VAT: ₹{totalVat.toFixed(2)}</span>
                    <span className="font-bold text-green-400 text-sm">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Payment Mode *</label>
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="input-field text-xs py-2">
                      <option value="">— Select Payment Mode —</option>
                      {['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Payment Status *</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="input-field text-xs py-2">
                      <option value="">— Select Payment Status —</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs btn-secondary">Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-500 flex items-center justify-center gap-2">
                    {saved ? <><CheckCircle className="w-4 h-4" /> Bill Created in DB!</> : saving ? 'Saving Bill...' : 'Create & Save Bill'}
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

// ─── Convert Invoice Modal ────────────────────────────────────────────────────

interface ConvertInvoiceModalProps {
  open: boolean
  quotation: any
  onClose: () => void
  onComplete: () => Promise<void>
}

function ConvertInvoiceModal({ open, quotation, onClose, onComplete }: ConvertInvoiceModalProps) {
  const [paymentMode, setPaymentMode] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) setPaymentMode('')
  }, [open])

  if (!quotation) return null

  const qNum = quotation.quotationNumber || quotation.QuotationNumber || `QT-${quotation.id}`
  const custName = quotation.customerName || quotation.customer?.name || quotation.Customer?.Name || 'Customer'
  const total = quotation.netAmount ?? quotation.grandTotal ?? quotation.subTotal ?? 0

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentMode) {
      alert('Please select a Payment Mode')
      return
    }
    setSaving(true)
    try {
      await quotationsService.convertToInvoice(quotation.id)
      setSaved(true)
      await new Promise(r => setTimeout(r, 600))
      setSaved(false)
      await onComplete()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to complete billing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl p-5 shadow-2xl bg-card border border-border">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h2 className="font-semibold text-base text-foreground">Generate Final Invoice</h2>
                </div>
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleFinalize} className="space-y-4">
                <div className="p-3 rounded-xl bg-secondary/30 space-y-1.5 text-xs text-muted-foreground">
                  <p>Quotation: <span className="font-semibold text-foreground">{qNum}</span></p>
                  <p>Customer: <span className="font-semibold text-foreground">{custName}</span></p>
                  <p className="pt-1 text-sm font-bold text-blue-400">Total Billed: {formatCurrency(total)}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Payment Method *</label>
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="input-field text-xs py-2">
                    <option value="">— Select Payment Mode —</option>
                    {['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cheque'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl text-xs btn-secondary">Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: saved ? '#16a34a' : '#3b82f6' }}>
                    {saved ? <><CheckCircle className="w-4 h-4 inline mr-1" /> Invoice Created & Status Updated!</> : saving ? 'Processing Invoice...' : 'Generate & Finalize Invoice'}
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

// ─── Main Billing Page ───────────────────────────────────────────────────────

export default function BillingPage() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [convertQuotation, setConvertQuotation] = useState<any | null>(location.state?.quotationToInvoice || null)
  const [directBillOpen, setDirectBillOpen] = useState(false)
  const [printingInvoice, setPrintingInvoice] = useState<any | null>(null)

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const data = await billingService.getAll()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load invoices:', e)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
    if (location.state?.quotationToInvoice) {
      setConvertQuotation(location.state.quotationToInvoice)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const filtered = invoices.filter((i) => {
    const num = i.invoiceNumber || i.InvoiceNumber || ''
    const cust = i.customerName || i.Customer?.Name || i.customer?.name || ''
    const veh = i.vehicleNumber || i.Vehicle?.VehicleNumber || i.vehicle?.vehicleNumber || ''
    const term = search.toLowerCase()
    return num.toLowerCase().includes(term) || cust.toLowerCase().includes(term) || veh.toLowerCase().includes(term)
  })

  return (
    <div>
      <PageHeader title="Billing & Invoices" description={`${invoices.length} total invoices in database`}>
        <button className="btn-primary" onClick={() => setDirectBillOpen(true)}>
          <Plus className="w-4 h-4" /> New Bill
        </button>
      </PageHeader>

      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number, customer name, vehicle..."
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading invoices from database...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-7 h-7" />}
            title="No invoices found"
            description="Create a new direct bill or convert a quotation."
            action={<button className="btn-primary" onClick={() => setDirectBillOpen(true)}><Plus className="w-4 h-4" /> New Bill</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Grand Total</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, idx) => {
                  const invNum = inv.invoiceNumber || inv.InvoiceNumber || `INV-${inv.id || idx}`
                  const custName = inv.customerName || inv.Customer?.Name || inv.customer?.name || 'Walk-in Customer'
                  const vehNum = inv.vehicleNumber || inv.Vehicle?.VehicleNumber || inv.vehicle?.vehicleNumber || '—'
                  const total = inv.grandTotal ?? inv.netAmount ?? inv.NetAmount ?? inv.subTotal ?? 0
                  const status = inv.status || inv.Status || 'Paid'
                  const date = inv.createdAt || inv.invoiceDate || inv.InvoiceDate

                  return (
                    <tr key={inv.id || idx}>
                      <td className="font-semibold text-sm">{invNum}</td>
                      <td className="text-sm">{custName}</td>
                      <td className="text-sm text-muted-foreground">{vehNum}</td>
                      <td className="text-sm font-bold text-foreground">{formatCurrency(total)}</td>
                      <td>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="text-sm text-muted-foreground">{formatDate(date)}</td>
                      <td className="text-right">
                        <button
                          onClick={() => setPrintingInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct Bill Modal */}
      <DirectBillModal
        open={directBillOpen}
        onClose={() => setDirectBillOpen(false)}
        onComplete={loadInvoices}
      />

      {/* Quotation Conversion Modal */}
      <ConvertInvoiceModal
        open={!!convertQuotation}
        quotation={convertQuotation}
        onClose={() => setConvertQuotation(null)}
        onComplete={loadInvoices}
      />

      {/* Print Document Modal */}
      <PrintDocumentModal
        open={!!printingInvoice}
        documentType="TAX INVOICE"
        data={printingInvoice}
        onClose={() => setPrintingInvoice(null)}
      />
    </div>
  )
}
