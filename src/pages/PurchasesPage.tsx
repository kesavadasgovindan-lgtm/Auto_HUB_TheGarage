import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ShoppingCart, X, CheckCircle, Trash2 } from 'lucide-react'
import { mockSuppliers, mockInventory } from '@/mock/data'
import { PageHeader, EmptyState, StatusBadge } from '@/components/common'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PurchaseItem {
  partId: string; partName: string; partNumber: string; quantity: number; unitPrice: number
}
interface Purchase {
  id: string; poNumber: string; supplierId: string; supplierName: string
  items: PurchaseItem[]; totalAmount: number; status: string; createdAt: string
}

function NewPurchaseModal({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (p: Purchase) => void
}) {
  const [supplierId, setSupplierId] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addItem = () => setItems(prev => [...prev, { partId: '', partName: '', partNumber: '', quantity: 1, unitPrice: 0 }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const updateItem = (i: number, field: keyof PurchaseItem, value: string | number) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item
      if (field === 'partId') {
        const part = mockInventory.find(p => p.id === value)
        return { ...item, partId: String(value), partName: part?.name || '', partNumber: part?.partNumber || '', unitPrice: part?.purchasePrice || 0 }
      }
      return { ...item, [field]: value }
    }))
  }

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)

  const handleClose = () => {
    setSupplierId(''); setItems([]); setError(''); onClose()
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!supplierId) { setError('Please select a supplier'); return }
    if (items.length === 0) { setError('Add at least one item'); return }
    const hasEmpty = items.some(i => !i.partId)
    if (hasEmpty) { setError('Select a part for every row'); return }
    setError('')
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    const supplier = mockSuppliers.find(s => s.id === supplierId)
    onSave({
      id: `po${Date.now()}`,
      poNumber: `PO-2026-${String(Date.now()).slice(-4)}`,
      supplierId, supplierName: supplier?.name || '',
      items, totalAmount: total, status: 'Ordered', createdAt: new Date().toISOString(),
    })
    setSaved(true)
    await new Promise(r => setTimeout(r, 700))
    setSaved(false); setSaving(false); setSupplierId(''); setItems([]); onClose()
  }

  const fs = { background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }
  const itemFs = { background: 'hsl(240 10% 5.5%)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(0 0% 98%)' }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>

              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <ShoppingCart className="w-4 h-4" style={{ color: '#4ade80' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>New Purchase Order</h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>Order parts from a supplier</p>
                  </div>
                </div>
                <button onClick={handleClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>
                    Supplier <span style={{ color: '#f97316' }}>*</span>
                  </label>
                  <select value={supplierId} onChange={e => { setSupplierId(e.target.value); setError('') }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={fs}>
                    <option value="">— Select Supplier —</option>
                    {mockSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

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

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 rounded-xl text-sm gap-2"
                      style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>
                      <ShoppingCart className="w-6 h-6 opacity-50" />
                      <span>Click "Add Item" to add parts</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Header row */}
                      <div className="grid grid-cols-12 gap-2 px-3 text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>
                        <div className="col-span-5">Part</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-3">Unit Price (₹)</div>
                        <div className="col-span-1 text-right">Total</div>
                        <div className="col-span-1" />
                      </div>
                      {items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl"
                          style={{ background: 'hsl(240 3.7% 15.9%)' }}>
                          <div className="col-span-5">
                            <select value={item.partId} onChange={e => updateItem(i, 'partId', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={itemFs}>
                              <option value="">Select part...</option>
                              {mockInventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <input type="number" min="1" value={item.quantity}
                              onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none text-center" style={itemFs} />
                          </div>
                          <div className="col-span-3">
                            <input type="number" min="0" value={item.unitPrice}
                              onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none" style={itemFs} />
                          </div>
                          <div className="col-span-1 text-right text-xs font-bold" style={{ color: '#60a5fa' }}>
                            ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button type="button" onClick={() => removeItem(i)} style={{ color: '#f87171' }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}

                {items.length > 0 && (
                  <div className="flex justify-between items-center p-4 rounded-xl"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>Total Amount</span>
                    <span className="text-2xl font-bold" style={{ color: '#60a5fa' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: saved ? '#16a34a' : '#3b82f6', color: 'white' }}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Created!</>
                      : saving ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                        : 'Create Purchase Order'}
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

export default function PurchasesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [purchases, setPurchases] = useState<Purchase[]>([])

  const handleSave = (p: Purchase) => setPurchases(prev => [p, ...prev])

  const totalSpent = purchases.reduce((s, p) => s + p.totalAmount, 0)

  return (
    <div>
      <PageHeader title="Purchases" description="Manage purchase orders from suppliers">
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> New Purchase
        </button>
      </PageHeader>

      {purchases.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Orders', value: purchases.length.toString(), color: 'text-foreground' },
            { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-blue-400' },
            { label: 'Ordered', value: purchases.filter(p => p.status === 'Ordered').length.toString(), color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="premium-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {purchases.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-7 h-7" />}
          title="No purchases yet"
          description="Create a purchase order to track parts ordered from suppliers."
          action={
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" /> Create First Purchase Order
            </button>
          }
        />
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td><span className="font-semibold text-sm">{p.poNumber}</span></td>
                    <td className="text-sm">{p.supplierName}</td>
                    <td className="text-sm">{p.items.length} {p.items.length === 1 ? 'item' : 'items'}</td>
                    <td className="font-bold text-sm">{formatCurrency(p.totalAmount)}</td>
                    <td><StatusBadge variant="info">{p.status}</StatusBadge></td>
                    <td className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NewPurchaseModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  )
}
