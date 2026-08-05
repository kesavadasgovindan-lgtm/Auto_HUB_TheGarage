import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, FileText, CheckCircle, ArrowRight, Edit, X, Trash2, Printer, Wrench, AlertTriangle, Mail } from 'lucide-react'
import { quotationsService, customersService, vehiclesService, inventoryService } from '@/services'
import { PageHeader, EmptyState, PrintDocumentModal } from '@/components/common'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Customer, Vehicle, InventoryItem } from '@/types'

// ─── Add / Edit Quotation Modal ──────────────────────────────────────────────

interface QuotationItemForm {
  itemId?: string
  description: string
  quantity: number
  rate: number
  discount: number
  vatPercent: number
}

interface QuotationModalProps {
  open: boolean
  quotation?: any | null
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

function QuotationModal({ open, quotation, onClose, onSave }: QuotationModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [form, setForm] = useState({ customerId: '', vehicleId: '', remarks: '', labourCharges: 0 })
  const [items, setItems] = useState<QuotationItemForm[]>([
    { itemId: '', description: '', quantity: 1, rate: 0, discount: 0, vatPercent: 0 }
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      customersService.getAll().then(setCustomers).catch(() => {})
      vehiclesService.getAll().then(setVehicles).catch(() => {})
      inventoryService.getAll().then(setInventory).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (quotation) {
      const cId = quotation.customerId || quotation.CustomerId || ''
      const vId = quotation.vehicleId || quotation.VehicleId || ''
      setForm({
        customerId: cId.toString(),
        vehicleId: vId.toString(),
        remarks: quotation.remarks || quotation.Remarks || '',
        labourCharges: quotation.labourCharges || quotation.LabourCharges || 0
      })
      if (quotation.items && quotation.items.length > 0) {
        setItems(quotation.items.map((i: any) => {
          const rawItemId = i.itemId || i.ItemId
          const desc = i.description || i.Description || ''
          const matchingInv = inventory.find(inv => 
            (rawItemId && inv.id.toString() === rawItemId.toString()) || 
            (desc && inv.name.toLowerCase() === desc.toLowerCase())
          )
          const rawVat = (matchingInv as any)?.vatRate ?? (matchingInv as any)?.VatRate ?? (matchingInv as any)?.vatPercent ?? (matchingInv as any)?.VatPercent ?? i.vatPercent ?? i.VatPercent
          const vatVal = (rawVat !== undefined && rawVat !== null) ? Number(rawVat) : 0

          return {
            itemId: matchingInv ? matchingInv.id.toString() : (rawItemId ? rawItemId.toString() : ''),
            description: desc || (matchingInv ? matchingInv.name : ''),
            quantity: i.quantity || i.Quantity || 1,
            rate: i.rate || i.Rate || i.unitPrice || (matchingInv ? matchingInv.sellingPrice : 0),
            discount: i.discount || i.Discount || 0,
            vatPercent: vatVal
          }
        }))
      }
    } else {
      setForm({ customerId: '', vehicleId: '', remarks: '', labourCharges: 0 })
      setItems([{ itemId: '', description: '', quantity: 1, rate: 0, discount: 0, vatPercent: 0 }])
    }
  }, [quotation, open, inventory])

  const addItem = () => {
    setItems(prev => [...prev, { itemId: '', description: '', quantity: 1, rate: 0, discount: 0, vatPercent: 0 }])
  }

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: keyof QuotationItemForm, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
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
        vatPercent: defaultVat
      } : item))
    }
  }

  const filteredVehicles = vehicles.filter(v => !form.customerId || v.customerId?.toString() === form.customerId?.toString())
  
  // Per-item VAT calculation
  const itemGross = items.reduce((s, i) => s + ((i.rate || 0) * (i.quantity || 1) - (i.discount || 0)), 0)
  const itemVat = items.reduce((s, i) => {
    const gross = (i.rate || 0) * (i.quantity || 1) - (i.discount || 0)
    return s + (gross * ((i.vatPercent ?? 0) / 100))
  }, 0)

  const labour = form.labourCharges || 0
  const labourVat = labour * 0.05
  const subtotal = itemGross + labour
  const totalVat = itemVat + labourVat
  const grandTotal = subtotal + totalVat

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId) { alert('Please select a customer'); return }
    if (items.length === 0 || !items.some(i => i.description.trim())) {
      alert('Please add at least one item description')
      return
    }
    setSaving(true)
    try {
      const payload = {
        customerId: parseInt(form.customerId),
        date: quotation?.date || new Date().toISOString(),
        validTill: quotation?.validTill || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        remarks: form.remarks || 'Standard Quotation',
        labourCharges: form.labourCharges,
        items: items.filter(i => i.description.trim()).map(i => ({
          itemId: i.itemId ? parseInt(i.itemId) : null,
          description: i.description,
          rate: parseFloat(i.rate as any) || 0,
          quantity: parseInt(i.quantity as any) || 1,
          discount: parseFloat(i.discount as any) || 0,
          vatPercent: parseFloat(i.vatPercent as any) ?? 0,
          vatApplicable: (i.vatPercent ?? 0) > 0
        }))
      }
      await onSave(payload)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to save quotation')
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
                <h2 className="font-semibold text-base text-foreground">{quotation && quotation.id ? 'Edit Draft Quotation' : 'New Quotation'}</h2>
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Customer *</label>
                    <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value, vehicleId: '' }))} className="input-field text-xs py-2 w-full">
                      <option value="">— Select Customer —</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Vehicle</label>
                    <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} className="input-field text-xs py-2 w-full">
                      <option value="">— Select Vehicle —</option>
                      {filteredVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.brand} {v.model})</option>)}
                    </select>
                  </div>
                </div>

                {/* Line Items Grid Layout with VAT % column */}
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-foreground">Quotation Items</span>
                    <button type="button" onClick={addItem} className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  {/* Table Column Headers */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px] space-y-2 pb-2">
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
                            className="input-field text-xs py-2 h-9 w-full"
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
                            className="input-field text-xs py-2 h-9 w-full"
                          />

                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                            className="input-field text-xs py-2 text-center h-9 w-full"
                          />

                          <input
                            type="number"
                            placeholder="Rate ₹"
                            value={item.rate === 0 ? '' : item.rate}
                            onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                            className="input-field text-xs py-2 text-right h-9 w-full"
                          />

                          <input
                            type="number"
                            placeholder="VAT %"
                            value={item.vatPercent}
                            onChange={e => updateItem(i, 'vatPercent', parseFloat(e.target.value) ?? 0)}
                            className="input-field text-xs py-2 text-right h-9 font-medium text-blue-400 w-full"
                            title="Per-item VAT Percentage"
                          />

                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="h-9 w-9 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dedicated Labour Charges Input */}
                  <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Wrench className="w-3.5 h-3.5 text-blue-400" /> Labour Charge (₹)
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.labourCharges === 0 ? '' : form.labourCharges}
                      onChange={e => setForm(f => ({ ...f, labourCharges: parseFloat(e.target.value) || 0 }))}
                      className="input-field text-xs py-1.5 sm:text-right font-medium w-full"
                    />
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-border/40">
                    <span className="text-muted-foreground">Subtotal: ₹{subtotal.toLocaleString('en-IN')} + VAT: ₹{totalVat.toFixed(2)}</span>
                    <span className="font-bold text-blue-400 text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Remarks / Notes</label>
                  <input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." className="input-field text-xs py-2" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs btn-secondary w-full">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 w-full">
                    {saving ? 'Saving...' : (quotation && quotation.id ? 'Update Draft' : 'Save Draft Quotation')}
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

// ─── Quotation Detail Modal ──────────────────────────────────────────────────

interface QuotationDetailModalProps {
  open: boolean
  quotation: any | null
  onClose: () => void
  onCopy: (q: any) => void
  onPrint: (q: any) => void
}

function QuotationDetailModal({ open, quotation, onClose, onCopy, onPrint }: QuotationDetailModalProps) {
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)

  useEffect(() => {
    if (open && quotation) {
      const email = quotation.customer?.email || quotation.Customer?.Email
      if (email) {
        setCustomerEmail(email)
      } else {
        const cid = quotation.customerId || quotation.CustomerId
        if (cid) {
          customersService.getAll().then(customers => {
            const c = customers.find(c => c.id.toString() === cid.toString())
            setCustomerEmail(c?.email || null)
          }).catch(() => setCustomerEmail(null))
        } else {
          setCustomerEmail(null)
        }
      }
    }
  }, [open, quotation])

  if (!quotation) return null

  const qNum = quotation.quotationNumber || quotation.QuotationNumber || `QT-${quotation.id}`
  const custName = quotation.customerName || quotation.customer?.name || quotation.Customer?.Name || 'Customer'
  const vehNum = quotation.vehicleNumber || quotation.vehicle?.vehicleNumber || quotation.Vehicle?.VehicleNumber || '—'
  const vehName = quotation.vehicleName || quotation.vehicle?.name || quotation.Vehicle?.Name || 'Vehicle'
  const date = quotation.date || quotation.createdAt || quotation.CreatedAt
  const validUntil = quotation.validTill || quotation.ValidTill || '—'
  const status = quotation.status || quotation.Status || 'Draft'
  const items = quotation.items || quotation.Items || []
  
  const labour = quotation.labourCharges || quotation.LabourCharges || 0
  
  const itemGross = items.reduce((s: number, i: any) => s + ((i.rate || i.Rate || i.unitPrice || 0) * (i.quantity || i.Quantity || 1) - (i.discount || i.Discount || 0)), 0)
  const itemVat = items.reduce((s: number, i: any) => {
    const gross = (i.rate || i.Rate || i.unitPrice || 0) * (i.quantity || i.Quantity || 1) - (i.discount || i.Discount || 0)
    const vatP = i.vatPercent ?? i.VatPercent ?? 0
    return s + (gross * (vatP / 100))
  }, 0)

  const subtotal = itemGross + labour
  const totalVat = itemVat + (labour * 0.05)
  const grandTotal = subtotal + totalVat

  const handleEmailCustomer = () => {
    if (!customerEmail) {
      alert("Customer email not available")
      return
    }

    const subject = `Quotation [${qNum}] from AutoHub - The Garage`
    
    let body = `Dear ${custName},

Please find your quotation details below:

Quotation No: ${qNum}
Date: ${formatDate(date)}
Valid Until: ${validUntil !== '—' && validUntil ? formatDate(validUntil) : '—'}
Vehicle: ${vehNum} - ${vehName}

ITEMS:
-----------------------------------------------
`

    items.forEach((item: any) => {
      const desc = item.description || item.Description || 'Item'
      const qty = item.quantity || item.Quantity || 1
      const rate = item.rate || item.Rate || item.unitPrice || 0
      const lineTotal = item.total || item.Total || (qty * rate)
      
      body += `${desc.padEnd(20)} Qty: ${qty}   Rate: ₹${rate.toLocaleString('en-IN')}   Total: ₹${lineTotal.toLocaleString('en-IN')}\n`
    })

    body += `-----------------------------------------------
Labour Charges:          ₹${labour.toLocaleString('en-IN')}
Subtotal:                ₹${subtotal.toLocaleString('en-IN')}
VAT:                     ₹${totalVat.toFixed(2)}
Grand Total:             ₹${grandTotal.toLocaleString('en-IN')}
-----------------------------------------------

This quotation is valid until ${validUntil !== '—' && validUntil ? formatDate(validUntil) : '—'}.

Thank you for choosing AutoHub - The Garage.
For queries, please contact us.

Best regards,
AutoHub - The Garage`

    const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl bg-card border border-border">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                <h2 className="font-semibold text-base text-foreground">Quotation Details</h2>
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-secondary/30">
                  <div>
                    <p className="text-muted-foreground">Quotation No.</p>
                    <p className="font-bold text-foreground text-sm">{qNum}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground">{status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{formatDate(date)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valid Until</p>
                    <p className="font-medium text-foreground">{validUntil !== '—' && validUntil ? formatDate(validUntil) : '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium text-foreground">{custName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Vehicle</p>
                    <p className="font-medium text-foreground">{vehNum}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/20 border border-border/50">
                  <p className="font-bold text-foreground mb-2 text-xs">Line Items</p>
                  <div className="space-y-1.5 overflow-x-auto">
                    <div className="min-w-[400px]">
                      <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 font-semibold text-muted-foreground pb-1 border-b border-border/40 text-[11px]">
                        <div>Description</div>
                        <div className="text-center">Qty</div>
                        <div className="text-right">Rate (₹)</div>
                        <div className="text-right">Total (₹)</div>
                      </div>
                      {items.map((item: any, idx: number) => {
                        const desc = item.description || item.Description || 'Item'
                        const qty = item.quantity || item.Quantity || 1
                        const rate = item.rate || item.Rate || item.unitPrice || 0
                        const lineTotal = item.total || item.Total || (qty * rate)
                        return (
                          <div key={idx} className="grid grid-cols-[1fr_60px_90px_90px] gap-2 items-center text-xs py-1 border-b border-border/20">
                            <span className="font-medium text-foreground">{desc}</span>
                            <span className="text-center text-muted-foreground">{qty}</span>
                            <span className="text-right text-muted-foreground">₹{rate.toLocaleString('en-IN')}</span>
                            <span className="text-right font-medium text-foreground">₹{lineTotal.toLocaleString('en-IN')}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal (incl. Labour ₹{labour.toLocaleString('en-IN')})</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>VAT</span>
                      <span>₹{totalVat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-2 border-t border-border/40 text-foreground">
                      <span>Grand Total</span>
                      <span className="text-blue-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={handleEmailCustomer} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-500 hover:bg-blue-400 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" /> Email Customer
                  </button>
                  <button type="button" onClick={() => { onPrint(quotation); onClose(); }} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => { onCopy(quotation); onClose(); }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Copy to New Quotation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Delete Confirmation Modal (View Details Only, Non-Editable) ─────────────

interface DeleteQuotationModalProps {
  open: boolean
  quotation: any | null
  onClose: () => void
  onConfirmDelete: () => Promise<void>
}

function DeleteQuotationModal({ open, quotation, onClose, onConfirmDelete }: DeleteQuotationModalProps) {
  const [deleting, setDeleting] = useState(false)

  if (!quotation) return null

  const qNum = quotation.quotationNumber || quotation.QuotationNumber || `QT-${quotation.id}`
  const custName = quotation.customerName || quotation.customer?.name || quotation.Customer?.Name || 'Customer'
  const vehNum = quotation.vehicleNumber || quotation.vehicle?.vehicleNumber || quotation.Vehicle?.VehicleNumber || '—'
  const date = quotation.date || quotation.createdAt || quotation.CreatedAt
  const items = quotation.items || quotation.Items || []
  const labour = quotation.labourCharges || quotation.LabourCharges || 0
  const total = quotation.netAmount ?? quotation.grandTotal ?? quotation.subTotal ?? 0

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onConfirmDelete()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to delete quotation')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl bg-card border border-red-500/30">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-foreground">Confirm Delete Quotation</h2>
                    <p className="text-xs text-red-400">Review record details below. This action cannot be undone.</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              {/* Details View (Non-editable) */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-secondary/30">
                  <div>
                    <p className="text-muted-foreground">Quotation No.</p>
                    <p className="font-bold text-foreground text-sm">{qNum}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium text-foreground">{custName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{formatDate(date)}</p>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/50">
                  <p className="font-bold text-foreground mb-2 text-xs">Quotation Line Items</p>
                  <div className="space-y-1.5 overflow-x-auto">
                    <div className="min-w-[400px]">
                      <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 font-semibold text-muted-foreground pb-1 border-b border-border/40 text-[11px]">
                        <div>Description</div>
                        <div className="text-center">Qty</div>
                        <div className="text-right">Rate (₹)</div>
                        <div className="text-right">Total (₹)</div>
                      </div>
                      {items.map((item: any, idx: number) => {
                        const desc = item.description || item.Description || 'Item'
                        const qty = item.quantity || item.Quantity || 1
                        const rate = item.rate || item.Rate || item.unitPrice || 0
                        const lineTotal = item.total || item.Total || (qty * rate)
                        return (
                          <div key={idx} className="grid grid-cols-[1fr_60px_90px_90px] gap-2 items-center text-xs py-1 border-b border-border/20">
                            <span className="font-medium text-foreground">{desc}</span>
                            <span className="text-center text-muted-foreground">{qty}</span>
                            <span className="text-right text-muted-foreground">₹{rate.toLocaleString('en-IN')}</span>
                            <span className="text-right font-medium text-foreground">₹{lineTotal.toLocaleString('en-IN')}</span>
                          </div>
                        )
                      })}
                      {labour > 0 && (
                        <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 items-center text-xs py-1 border-b border-border/20">
                          <span className="font-medium text-blue-400">Labour Charge</span>
                          <span className="text-center text-muted-foreground">1</span>
                          <span className="text-right text-muted-foreground">₹{labour.toLocaleString('en-IN')}</span>
                          <span className="text-right font-medium text-foreground">₹{labour.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 mt-2 border-t border-border/40">
                    <span className="text-muted-foreground">Grand Net Total (inc. VAT):</span>
                    <span className="font-bold text-red-400 text-base">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs btn-secondary w-full">
                    Cancel (Keep Quotation)
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 flex items-center justify-center gap-2 transition-colors w-full"
                  >
                    <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Confirm & Delete Quotation'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Convert to Invoice & Edit Details Modal ─────────────────────────────────

interface ConvertModalProps {
  open: boolean
  quotation: any | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

function ConvertModal({ open, quotation, onClose, onConfirm }: ConvertModalProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [items, setItems] = useState<QuotationItemForm[]>([])
  const [paymentMode, setPaymentMode] = useState('')
  const [labourCharges, setLabourCharges] = useState(0)
  const [remarks, setRemarks] = useState('')
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)

  useEffect(() => {
    if (open) {
      inventoryService.getAll().then(setInventory).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (quotation) {
      setPaymentMode('')
      setLabourCharges(quotation.labourCharges || quotation.LabourCharges || 0)
      setRemarks(quotation.remarks || quotation.Remarks || 'Billed from Quotation')
      if (quotation.items && quotation.items.length > 0) {
        setItems(quotation.items.map((i: any) => {
          const rawItemId = i.itemId || i.ItemId
          const desc = i.description || i.Description || ''
          const matchingInv = inventory.find(inv => 
            (rawItemId && inv.id.toString() === rawItemId.toString()) || 
            (desc && inv.name.toLowerCase() === desc.toLowerCase())
          )
          const rawVat = (matchingInv as any)?.vatRate ?? (matchingInv as any)?.VatRate ?? (matchingInv as any)?.vatPercent ?? (matchingInv as any)?.VatPercent ?? i.vatPercent ?? i.VatPercent
          const vatVal = (rawVat !== undefined && rawVat !== null) ? Number(rawVat) : 0

          return {
            itemId: matchingInv ? matchingInv.id.toString() : (rawItemId ? rawItemId.toString() : ''),
            description: desc || (matchingInv ? matchingInv.name : ''),
            quantity: i.quantity || i.Quantity || 1,
            rate: i.rate || i.Rate || i.unitPrice || (matchingInv ? matchingInv.sellingPrice : 0),
            discount: i.discount || i.Discount || 0,
            vatPercent: vatVal
          }
        }))
      } else {
        setItems([{ itemId: '', description: '', quantity: 1, rate: 0, discount: 0, vatPercent: 0 }])
      }
    }
  }, [quotation, open, inventory])

  if (!quotation) return null

  const addItem = () => setItems(prev => [...prev, { itemId: '', description: '', quantity: 1, rate: 0, discount: 0, vatPercent: 0 }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof QuotationItemForm, val: any) => {
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
        vatPercent: defaultVat
      } : item))
    }
  }

  const qNum = quotation.quotationNumber || quotation.QuotationNumber || `QT-${quotation.id}`
  const custName = quotation.customerName || quotation.customer?.name || quotation.Customer?.Name || 'Customer'
  const itemGross = items.reduce((s, i) => s + ((i.rate || 0) * (i.quantity || 1) - (i.discount || 0)), 0)
  const itemVat = items.reduce((s, i) => s + (((i.rate || 0) * (i.quantity || 1) - (i.discount || 0)) * ((i.vatPercent ?? 0) / 100)), 0)
  const subtotal = itemGross + labourCharges
  const totalVat = itemVat + (labourCharges * 0.05)
  const grandTotal = subtotal + totalVat

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentMode) {
      alert('Please select a Payment Mode')
      return
    }
    setProcessing(true)
    try {
      await quotationsService.convertToInvoice(quotation.id)
      setProcessed(true)
      await new Promise(r => setTimeout(r, 600))
      setProcessed(false)
      await onConfirm()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error processing billing')
    } finally {
      setProcessing(false)
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
                <div>
                  <h2 className="font-semibold text-base text-foreground">Convert Quotation to Invoice & Bill</h2>
                  <p className="text-xs text-muted-foreground">Verify and edit line items below before finalizing billing</p>
                </div>
                <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleConvertSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-secondary/30 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-foreground text-sm">{qNum}</p>
                    <p className="text-muted-foreground">Customer: {custName}</p>
                  </div>
                  <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending Billing</span>
                </div>

                {/* Editable Line Items - Grid Layout */}
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-foreground">Editable Line Items</span>
                    <button type="button" onClick={addItem} className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  {/* Table Column Headers */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px] space-y-2 pb-2">
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
                            className="input-field text-xs py-2 h-9 w-full"
                          >
                            <option value="">— Select —</option>
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.id.toString()}>
                                {inv.name} (₹{inv.sellingPrice || inv.mrp})
                              </option>
                            ))}
                          </select>

                          <input
                            placeholder="Description"
                            value={item.description}
                            onChange={e => updateItem(i, 'description', e.target.value)}
                            className="input-field text-xs py-2 h-9 w-full"
                          />

                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                            className="input-field text-xs py-2 text-center h-9 w-full"
                          />

                          <input
                            type="number"
                            placeholder="Rate ₹"
                            value={item.rate === 0 ? '' : item.rate}
                            onChange={e => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                            className="input-field text-xs py-2 text-right h-9 w-full"
                          />

                          <input
                            type="number"
                            placeholder="VAT %"
                            value={item.vatPercent}
                            onChange={e => updateItem(i, 'vatPercent', parseFloat(e.target.value) ?? 0)}
                            className="input-field text-xs py-2 text-right h-9 font-medium text-blue-400 w-full"
                            title="Per-item VAT Percentage"
                          />

                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="h-9 w-9 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Labour Charge */}
                  <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Wrench className="w-3.5 h-3.5 text-blue-400" /> Labour Charge (₹)
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={labourCharges === 0 ? '' : labourCharges}
                      onChange={e => setLabourCharges(parseFloat(e.target.value) || 0)}
                      className="input-field text-xs py-1.5 sm:text-right font-medium w-full"
                    />
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-border/40">
                    <span className="text-muted-foreground">Final Net Total (inc. VAT):</span>
                    <span className="font-bold text-green-400 text-sm">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Payment Mode *</label>
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="input-field text-xs py-2">
                    <option value="">— Select Payment Mode —</option>
                    {['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs btn-secondary w-full">Cancel</button>
                  <button type="submit" disabled={processing || processed} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-500 flex items-center justify-center gap-2 w-full">
                    {processed ? <><CheckCircle className="w-4 h-4" /> Billed & Converted!</> : processing ? 'Finalizing Bill...' : 'Confirm & Finalize Bill'}
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

// ─── Main Quotations Page ───────────────────────────────────────────────────

export default function QuotationsPage() {
  const [search, setSearch] = useState('')
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<any | null>(null)
  const [convertingQuotation, setConvertingQuotation] = useState<any | null>(null)
  const [printingQuotation, setPrintingQuotation] = useState<any | null>(null)
  const [deletingQuotation, setDeletingQuotation] = useState<any | null>(null)
  const [viewingQuotation, setViewingQuotation] = useState<any | null>(null)

  const handleCopyQuotation = (q: any) => {
    const copyQ = { ...q }
    delete copyQ.id
    delete copyQ.quotationNumber
    delete copyQ.QuotationNumber
    setEditingQuotation(copyQ)
    setAddModalOpen(true)
  }

  const loadQuotations = async () => {
    setLoading(true)
    try {
      const data = await quotationsService.getAll()
      setQuotations(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load quotations:', e)
      setQuotations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadQuotations() }, [])

  // Draft / Pending / Approved first, Converted LAST!
  const sortedQuotations = [...quotations].sort((a, b) => {
    const aStatus = (a.status || a.Status || 'Draft').toLowerCase()
    const bStatus = (b.status || b.Status || 'Draft').toLowerCase()
    if (aStatus === 'converted' && bStatus !== 'converted') return 1
    if (aStatus !== 'converted' && bStatus === 'converted') return -1
    return 0
  })

  const filtered = sortedQuotations.filter((q) => {
    const num = q.quotationNumber || q.QuotationNumber || ''
    const cust = q.customerName || q.customer?.name || q.Customer?.Name || ''
    const veh = q.vehicleNumber || q.vehicle?.vehicleNumber || q.Vehicle?.VehicleNumber || ''
    const term = search.toLowerCase()
    return num.toLowerCase().includes(term) || cust.toLowerCase().includes(term) || veh.toLowerCase().includes(term)
  })

  const handleSave = async (data: any) => {
    if (editingQuotation && editingQuotation.id) {
      await quotationsService.update(editingQuotation.id, data)
    } else {
      await quotationsService.create(data)
    }
    await loadQuotations()
  }

  const handleConfirmDelete = async () => {
    if (deletingQuotation) {
      await quotationsService.delete(deletingQuotation.id)
      setDeletingQuotation(null)
      await loadQuotations()
    }
  }

  return (
    <div>
      <PageHeader title="Quotations" description={`${quotations.length} total quotations in DB`}>
        <button className="btn-primary" onClick={() => { setEditingQuotation(null); setAddModalOpen(true) }}>
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </PageHeader>

      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotation number, customer name, vehicle..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading quotations from database...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="No quotations found"
          description="Create your first quotation in database."
          action={<button className="btn-primary" onClick={() => { setEditingQuotation(null); setAddModalOpen(true) }}><Plus className="w-4 h-4" /> New Quotation</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q, i) => {
            const num = q.quotationNumber || q.QuotationNumber || `QT-${q.id || i}`
            const cust = q.customerName || q.customer?.name || q.Customer?.Name || 'Customer'
            const veh = q.vehicleNumber || q.vehicle?.vehicleNumber || q.Vehicle?.VehicleNumber || '—'
            const total = q.netAmount ?? q.grandTotal ?? q.subTotal ?? 0
            const date = q.date || q.createdAt || q.CreatedAt
            const status = q.status || q.Status || 'Draft'
            const isConverted = status.toLowerCase() === 'converted'

            return (
              <motion.div
                key={q.id || i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setViewingQuotation(q)}
                className={`premium-card p-4 border cursor-pointer hover:border-blue-500/40 transition-colors ${isConverted ? 'opacity-70 bg-secondary/20' : 'border-blue-500/20'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{num}</p>
                    <p className="text-xs text-muted-foreground">{veh}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${isConverted ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {isConverted ? 'Converted' : status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingQuotation(q) }}
                      className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      title="View Details & Delete Quotation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <p>Customer: <span className="text-foreground font-medium">{cust}</span></p>
                  <p>Date: {formatDate(date)}</p>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">{formatCurrency(total)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPrintingQuotation(q) }}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                      title="Print Official Quotation Document"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    {!isConverted && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingQuotation(q); setAddModalOpen(true) }}
                          className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConvertingQuotation(q) }}
                          className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                        >
                          Convert to Invoice <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {isConverted && (
                      <span className="text-xs text-green-400 font-medium">Billed ✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Quotation Modal */}
      <QuotationModal
        open={addModalOpen}
        quotation={editingQuotation}
        onClose={() => { setAddModalOpen(false); setEditingQuotation(null) }}
        onSave={handleSave}
      />

      {/* Convert to Invoice Window Modal */}
      <ConvertModal
        open={!!convertingQuotation}
        quotation={convertingQuotation}
        onClose={() => setConvertingQuotation(null)}
        onConfirm={loadQuotations}
      />

      {/* Delete Quotation View & Confirmation Modal */}
      <DeleteQuotationModal
        open={!!deletingQuotation}
        quotation={deletingQuotation}
        onClose={() => setDeletingQuotation(null)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Print Document Modal */}
      <PrintDocumentModal
        open={!!printingQuotation}
        documentType="QUOTATION"
        data={printingQuotation}
        onClose={() => setPrintingQuotation(null)}
      />

      {/* Quotation Detail View Modal */}
      <QuotationDetailModal
        open={!!viewingQuotation}
        quotation={viewingQuotation}
        onClose={() => setViewingQuotation(null)}
        onCopy={handleCopyQuotation}
        onPrint={(q) => setPrintingQuotation(q)}
      />
    </div>
  )
}
