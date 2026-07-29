import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Package, AlertTriangle, X, CheckCircle, Edit, TrendingUp } from 'lucide-react'
import { inventoryService, suppliersService } from '@/services'
import { PageHeader, EmptyState } from '@/components/common'
import { formatCurrency } from '@/lib/utils'
import type { InventoryItem, PartCategory, Supplier } from '@/types'

const categories: PartCategory[] = ['Engine Parts', 'Body Parts', 'Electrical', 'Suspension', 'Tyres', 'Lubricants', 'Accessories', 'Tools']

// ─── Add / Edit Item Modal ───────────────────────────────────────────────────

interface ItemModalProps {
  open: boolean
  itemToEdit?: InventoryItem | null
  onClose: () => void
  onSave: (data: Partial<InventoryItem>) => Promise<void>
}

function ItemModal({ open, itemToEdit, onClose, onSave }: ItemModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [form, setForm] = useState({
    partNumber: '', name: '', category: 'Engine Parts' as PartCategory, brand: '',
    purchasePrice: '0', sellingPrice: '0', mrp: '0', quantity: '10', minimumStock: '5',
    rackLocation: '', supplierId: '', vatRate: '5'
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) suppliersService.getAll().then(setSuppliers).catch(() => {})
  }, [open])

  useEffect(() => {
    if (itemToEdit) {
      const vRate = (itemToEdit as any).vatRate ?? (itemToEdit as any).vatPercent ?? ((itemToEdit as any).vatApplicable === false ? 0 : 5)
      setForm({
        partNumber: itemToEdit.partNumber || (itemToEdit as any).code || '',
        name: itemToEdit.name || '',
        category: (itemToEdit.category as PartCategory) || 'Engine Parts',
        brand: itemToEdit.brand || '',
        purchasePrice: (itemToEdit.purchasePrice ?? (itemToEdit as any).costPrice ?? 0).toString(),
        sellingPrice: (itemToEdit.sellingPrice ?? 0).toString(),
        mrp: (itemToEdit.mrp ?? itemToEdit.sellingPrice ?? 0).toString(),
        quantity: (itemToEdit.quantity ?? (itemToEdit as any).stock ?? 0).toString(),
        minimumStock: (itemToEdit.minimumStock ?? 5).toString(),
        rackLocation: itemToEdit.rackLocation || '',
        supplierId: itemToEdit.supplierId?.toString() || '',
        vatRate: vRate.toString()
      })
    } else {
      setForm({
        partNumber: '', name: '', category: 'Engine Parts', brand: '',
        purchasePrice: '0', sellingPrice: '0', mrp: '0', quantity: '10', minimumStock: '5',
        rackLocation: '', supplierId: '', vatRate: '5'
      })
    }
  }, [itemToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.partNumber || !form.name) {
      alert('Please fill in Part Number and Item Name')
      return
    }
    setSaving(true)
    try {
      const selectedSup = suppliers.find(s => s.id.toString() === form.supplierId)
      const parsedVat = parseFloat(form.vatRate) || 0
      await onSave({
        ...(itemToEdit ? { id: itemToEdit.id } : {}),
        partNumber: form.partNumber,
        code: form.partNumber,
        name: form.name,
        category: form.category,
        brand: form.brand,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        costPrice: parseFloat(form.purchasePrice) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        mrp: parseFloat(form.mrp) || parseFloat(form.sellingPrice) || 0,
        quantity: parseInt(form.quantity) || 0,
        stock: parseInt(form.quantity) || 0,
        minimumStock: parseInt(form.minimumStock) || 5,
        rackLocation: form.rackLocation,
        supplierId: form.supplierId ? parseInt(form.supplierId) : undefined,
        supplierName: selectedSup?.name,
        vatRate: parsedVat,
        vatPercent: parsedVat,
        vatApplicable: parsedVat > 0
      } as any)
      setSaved(true)
      await new Promise(r => setTimeout(r, 600))
      setSaved(false)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to save item in database')
    } finally {
      setSaving(false)
    }
  }

  const fc = 'w-full px-3 py-2 rounded-xl text-xs outline-none input-field'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl p-5 shadow-2xl bg-card border border-border">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                <h2 className="font-semibold text-base text-foreground">{itemToEdit ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Part Code / SKU *</label>
                    <input value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value.toUpperCase() }))} placeholder="OIL-5W30" className={fc} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Brand</label>
                    <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Bosch, Castrol..." className={fc} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Item Name / Description *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Engine Oil 5W-30 (4L)" className={fc} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as PartCategory }))} className={fc}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Rack Location</label>
                    <input value={form.rackLocation} onChange={e => setForm(f => ({ ...f, rackLocation: e.target.value }))} placeholder="A-1-3" className={fc} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Purchase / Cost Price (₹)</label>
                    <input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} className={fc} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Selling Price (₹)</label>
                    <input type="number" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} className={fc} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Stock Quantity</label>
                    <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={fc} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Minimum Stock Alert</label>
                    <input type="number" value={form.minimumStock} onChange={e => setForm(f => ({ ...f, minimumStock: e.target.value }))} className={fc} />
                  </div>
                </div>

                {/* Explicit VAT Rate (%) Numerical Input Field */}
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-foreground">VAT Rate (%) *</label>
                    <span className="text-[11px] text-muted-foreground">Persisted in DB & used in Billing/Quotations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={form.vatRate}
                      onChange={e => setForm(f => ({ ...f, vatRate: e.target.value }))}
                      placeholder="5"
                      className="input-field text-xs py-1.5 px-3 font-bold text-blue-400 w-28 text-right"
                    />
                    <span className="text-xs font-bold text-muted-foreground">% VAT</span>
                    <span className="text-[11px] text-muted-foreground ml-auto">
                      {parseFloat(form.vatRate) === 0 ? '(Tax Exempt Item)' : `(${form.vatRate}% VAT applied)`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs btn-secondary">Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2">
                    {saved ? <><CheckCircle className="w-4 h-4" /> Item Saved in DB!</> : saving ? 'Saving...' : (itemToEdit ? 'Update Item' : 'Save New Item')}
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

// ─── Stock In Modal ──────────────────────────────────────────────────────────

interface StockInModalProps {
  open: boolean
  item: InventoryItem | null
  onClose: () => void
  onComplete: () => Promise<void>
}

function StockInModal({ open, item, onClose, onComplete }: StockInModalProps) {
  const [addQty, setAddQty] = useState('10')
  const [saving, setSaving] = useState(false)

  if (!item) return null

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = parseInt(addQty)
    if (!q || q <= 0) return
    setSaving(true)
    try {
      await inventoryService.stockIn(item.id, q)
      await onComplete()
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error updating stock')
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-2xl p-5 shadow-2xl bg-card border border-border">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <h3 className="font-semibold text-sm text-foreground">Add Stock</h3>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleStockSubmit} className="space-y-3">
                <div className="text-xs space-y-1 bg-secondary/30 p-2.5 rounded-xl">
                  <p className="font-bold text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">Current Stock: <span className="font-semibold text-foreground">{item.quantity ?? (item as any).stock ?? 0} units</span></p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Quantity to Add *</label>
                  <input
                    type="number"
                    min="1"
                    value={addQty}
                    onChange={e => setAddQty(e.target.value)}
                    className="input-field text-xs py-2 text-center font-bold text-lg text-blue-400"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl text-xs btn-secondary">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-500">
                    {saving ? 'Updating...' : '+ Add Stock'}
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

// ─── Main Inventory Page ─────────────────────────────────────────────────────

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [stockInItem, setStockInItem] = useState<InventoryItem | null>(null)

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await inventoryService.getAll()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error loading inventory:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const lowStockItems = items.filter((i) => (i.quantity ?? (i as any).stock ?? 0) <= i.minimumStock)

  const filtered = items.filter((item) => {
    const sku = item.partNumber || (item as any).code || ''
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      sku.toLowerCase().includes(search.toLowerCase()) ||
      (item.brand || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter
    return matchSearch && matchCat
  })

  const handleSave = async (data: Partial<InventoryItem>) => {
    if (editingItem) {
      await inventoryService.update(editingItem.id, data)
    } else {
      await inventoryService.create(data)
    }
    await loadItems()
  }

  return (
    <div>
      <PageHeader title="Inventory & Stock" description={`${items.length} total parts in database`}>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}>
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </PageHeader>

      {lowStockItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
          <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-orange-400">Low Stock Alert</p>
            <p className="text-xs text-orange-400/80">{lowStockItems.length} items at or below minimum stock: {lowStockItems.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search parts by name, SKU code or brand..." className="input-field pl-9" />
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading inventory from database...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Package className="w-7 h-7" />} title="No inventory items" description="Add your first part to the database." action={<button className="btn-primary" onClick={() => { setEditingItem(null); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Part</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part / SKU</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>VAT Rate (%)</th>
                  <th>Selling Price</th>
                  <th>Rack Location</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const sku = item.partNumber || (item as any).code || '—'
                  const stock = item.quantity ?? (item as any).stock ?? 0
                  const isLow = stock <= item.minimumStock
                  const vat = (item as any).vatRate ?? (item as any).vatPercent ?? ((item as any).vatApplicable === false ? 0 : 5)

                  return (
                    <tr key={item.id}>
                      <td>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{sku} {item.brand && `· ${item.brand}`}</p>
                      </td>
                      <td className="text-sm text-muted-foreground">{item.category}</td>
                      <td>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isLow ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {stock} in stock
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${vat > 0 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-500/10 text-gray-400'}`}>
                          {vat}% VAT
                        </span>
                      </td>
                      <td className="text-sm font-medium">{formatCurrency(item.sellingPrice || 0)}</td>
                      <td className="text-sm text-muted-foreground">{item.rackLocation || '—'}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setStockInItem(item)}
                            className="px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 flex items-center gap-1"
                            title="Add stock quantity"
                          >
                            <TrendingUp className="w-3 h-3" /> + Stock
                          </button>
                          <button
                            onClick={() => { setEditingItem(item); setModalOpen(true) }}
                            className="px-2 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                            title="Edit part details"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <ItemModal
        open={modalOpen}
        itemToEdit={editingItem}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSave={handleSave}
      />

      {/* Stock In Quick Modal */}
      <StockInModal
        open={!!stockInItem}
        item={stockInItem}
        onClose={() => setStockInItem(null)}
        onComplete={loadItems}
      />
    </div>
  )
}
