import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Package, AlertTriangle, X, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { mockInventory, mockSuppliers } from '@/mock/data'
import { PageHeader, EmptyState } from '@/components/common'
import { formatCurrency, cn } from '@/lib/utils'
import type { InventoryItem, PartCategory } from '@/types'

const CATEGORIES: PartCategory[] = ['Engine Parts', 'Body Parts', 'Electrical', 'Suspension', 'Tyres', 'Lubricants', 'Accessories', 'Tools']

const categoryColors: Record<string, string> = {
  'Engine Parts': 'text-orange-400 bg-orange-500/10',
  'Body Parts': 'text-blue-400 bg-blue-500/10',
  'Electrical': 'text-yellow-400 bg-yellow-500/10',
  'Suspension': 'text-green-400 bg-green-500/10',
  'Tyres': 'text-slate-400 bg-slate-500/10',
  'Lubricants': 'text-purple-400 bg-purple-500/10',
  'Accessories': 'text-pink-400 bg-pink-500/10',
  'Tools': 'text-cyan-400 bg-cyan-500/10',
}

interface PartForm {
  partNumber: string; name: string; category: PartCategory; brand: string
  supplierId: string; purchasePrice: string; sellingPrice: string; mrp: string
  quantity: string; minimumStock: string; rackLocation: string
}

const emptyPart: PartForm = {
  partNumber: '', name: '', category: 'Engine Parts', brand: '', supplierId: '',
  purchasePrice: '', sellingPrice: '', mrp: '', quantity: '0', minimumStock: '5', rackLocation: '',
}

function PartModal({ open, onClose, part, onSave }: {
  open: boolean; onClose: () => void; part?: InventoryItem | null; onSave: (d: PartForm) => void
}) {
  const [form, setForm] = useState<PartForm>(part ? {
    partNumber: part.partNumber, name: part.name, category: part.category, brand: part.brand,
    supplierId: part.supplierId || '', purchasePrice: part.purchasePrice.toString(),
    sellingPrice: part.sellingPrice.toString(), mrp: part.mrp?.toString() || '',
    quantity: part.quantity.toString(), minimumStock: part.minimumStock.toString(),
    rackLocation: part.rackLocation || '',
  } : emptyPart)
  const [errors, setErrors] = useState<Partial<PartForm>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (f: keyof PartForm, v: string) => { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: '' })) }

  const validate = () => {
    const e: Partial<PartForm> = {}
    if (!form.name.trim()) e.name = 'Part name is required'
    if (!form.partNumber.trim()) e.partNumber = 'Part number is required'
    if (!form.brand.trim()) e.brand = 'Brand is required'
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice))) e.sellingPrice = 'Enter valid selling price'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    onSave(form)
    setSaved(true)
    await new Promise(r => setTimeout(r, 700))
    setSaved(false); setSaving(false); onClose()
  }

  const fc = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all'
  const si = (f: keyof PartForm) => ({
    background: 'hsl(240 3.7% 15.9%)',
    border: `1px solid ${errors[f] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`,
    color: 'hsl(0 0% 98%)',
  })

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>

              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <Package className="w-4 h-4" style={{ color: '#c084fc' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>{part ? 'Edit Part' : 'Add New Part'}</h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>Fill in inventory details</p>
                  </div>
                </div>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Part Name <span style={{ color: '#f97316' }}>*</span></label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Engine Oil Filter" className={fc} style={si('name')} />
                    {errors.name && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Part Number <span style={{ color: '#f97316' }}>*</span></label>
                    <input value={form.partNumber} onChange={e => set('partNumber', e.target.value.toUpperCase())} placeholder="OF-HYN-001" className={fc} style={si('partNumber')} />
                    {errors.partNumber && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.partNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Brand <span style={{ color: '#f97316' }}>*</span></label>
                    <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Bosch, NGK, MRF..." className={fc} style={si('brand')} />
                    {errors.brand && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.brand}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Category</label>
                    <select value={form.category} onChange={e => set('category', e.target.value as PartCategory)} className={fc} style={si('category')}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Supplier</label>
                    <select value={form.supplierId} onChange={e => set('supplierId', e.target.value)} className={fc} style={si('supplierId')}>
                      <option value="">— Select Supplier —</option>
                      {mockSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Purchase Price (₹)</label>
                    <input type="number" min="0" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} className={fc} style={si('purchasePrice')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Selling Price (₹) <span style={{ color: '#f97316' }}>*</span></label>
                    <input type="number" min="0" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} className={fc} style={si('sellingPrice')} />
                    {errors.sellingPrice && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.sellingPrice}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>MRP (₹)</label>
                    <input type="number" min="0" value={form.mrp} onChange={e => set('mrp', e.target.value)} className={fc} style={si('mrp')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Current Stock</label>
                    <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} className={fc} style={si('quantity')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Minimum Stock</label>
                    <input type="number" min="0" value={form.minimumStock} onChange={e => set('minimumStock', e.target.value)} className={fc} style={si('minimumStock')} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Rack Location</label>
                    <input value={form.rackLocation} onChange={e => set('rackLocation', e.target.value.toUpperCase())} placeholder="A-1-3" className={fc} style={si('rackLocation')} />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: saved ? '#16a34a' : '#3b82f6', color: 'white' }}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                      : saving ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                        : (part ? 'Save Changes' : 'Add Part')}
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

function StockBar({ qty, min }: { qty: number; min: number }) {
  const pct = Math.min((qty / Math.max(min * 2, 1)) * 100, 100)
  const color = qty === 0 ? '#ef4444' : qty <= min ? '#f97316' : '#22c55e'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'hsl(240 3.7% 15.9%)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-5 text-right" style={{ color }}>{qty}</span>
    </div>
  )
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [parts, setParts] = useState<InventoryItem[]>(mockInventory)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPart, setEditPart] = useState<InventoryItem | null>(null)

  const lowStock = parts.filter(p => p.quantity <= p.minimumStock)

  const filtered = parts.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const mc = categoryFilter === 'all' || p.category === categoryFilter
    return ms && mc
  })

  const handleSave = (data: PartForm) => {
    if (editPart) {
      setParts(prev => prev.map(p => p.id === editPart.id ? {
        ...p, ...data,
        purchasePrice: Number(data.purchasePrice), sellingPrice: Number(data.sellingPrice),
        mrp: Number(data.mrp), quantity: Number(data.quantity), minimumStock: Number(data.minimumStock),
        updatedAt: new Date().toISOString(),
      } : p))
    } else {
      const supplier = mockSuppliers.find(s => s.id === data.supplierId)
      setParts(prev => [{
        id: `p${Date.now()}`, ...data,
        purchasePrice: Number(data.purchasePrice), sellingPrice: Number(data.sellingPrice),
        mrp: Number(data.mrp), quantity: Number(data.quantity), minimumStock: Number(data.minimumStock),
        supplierName: supplier?.name || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }, ...prev])
    }
    setEditPart(null)
  }

  const openAdd = () => { setEditPart(null); setModalOpen(true) }
  const openEdit = (p: InventoryItem) => { setEditPart(p); setModalOpen(true) }

  return (
    <div>
      <PageHeader title="Inventory" description={`${parts.length} parts · ${lowStock.length} low stock`}>
        <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Part</button>
      </PageHeader>

      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl mb-4"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#fb923c' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#fb923c' }}>Low Stock Alert</p>
            <p className="text-xs" style={{ color: 'rgba(251,146,60,0.8)' }}>
              {lowStock.length} items at or below minimum: {lowStock.map(i => i.name).join(', ')}
            </p>
          </div>
        </motion.div>
      )}

      <div className="premium-card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, part number or brand..." className="input-field pl-9" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto flex-wrap">
          {['all', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                categoryFilter === c ? 'text-white' : 'bg-secondary text-muted-foreground')}
              style={categoryFilter === c ? { background: '#3b82f6' } : {}}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<Package className="w-7 h-7" />} title="No parts found"
            action={<button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Part</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Part</th>
                  <th className="hidden md:table-cell">Part No.</th>
                  <th>Category</th>
                  <th className="hidden lg:table-cell">Brand</th>
                  <th className="hidden lg:table-cell">Sell Price</th>
                  <th>Stock</th>
                  <th className="hidden sm:table-cell">Location</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', categoryColors[item.category] || 'text-blue-400 bg-blue-500/10')}>
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-medium text-sm">{item.name}</p>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">{item.partNumber}</span>
                    </td>
                    <td><span className={cn('badge text-xs', categoryColors[item.category])}>{item.category}</span></td>
                    <td className="hidden lg:table-cell text-sm">{item.brand}</td>
                    <td className="hidden lg:table-cell text-sm font-medium">{formatCurrency(item.sellingPrice)}</td>
                    <td><StockBar qty={item.quantity} min={item.minimumStock} /></td>
                    <td className="hidden sm:table-cell text-xs text-muted-foreground font-mono">{item.rackLocation || '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setParts(prev => prev.filter(p => p.id !== item.id))} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" style={{ color: '#f87171' }}>
                          <Trash2 className="w-3.5 h-3.5" />
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

      <PartModal open={modalOpen} onClose={() => { setModalOpen(false); setEditPart(null) }} part={editPart} onSave={handleSave} />
    </div>
  )
}
