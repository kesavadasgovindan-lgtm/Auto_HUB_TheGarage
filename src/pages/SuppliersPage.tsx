import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Building2, Phone, Mail, MapPin, X, CheckCircle } from 'lucide-react'
import { suppliersService } from '@/services'
import { PageHeader, EmptyState } from '@/components/common'
import { formatCurrency } from '@/lib/utils'
import type { Supplier } from '@/types'

interface SupplierModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Supplier>) => Promise<void>
}

function SupplierModal({ open, onClose, onSave }: SupplierModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', contactPerson: '', gstNumber: '', paymentTerms: 'Net 30' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) { alert('Please fill in Supplier Name and Phone'); return }
    setSaving(true)
    try {
      await onSave(form)
      setSaved(true)
      await new Promise(r => setTimeout(r, 600))
      setSaved(false)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to save supplier')
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
                <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>Add New Supplier</h2>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Company / Supplier Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="AutoParts Express" className={fc} style={fs} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Phone *</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9900001111" className={fc} style={fs} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Contact Person</label>
                    <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Mahesh Kumar" className={fc} style={fs} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="sales@supplier.com" className={fc} style={fs} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>GST Number</label>
                    <input value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))} placeholder="29XXXXX0001A1Z5" className={fc} style={fs} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Address</label>
                  <textarea rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={fc} style={fs} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl text-xs" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: saved ? '#16a34a' : '#3b82f6' }}>
                    {saved ? <><CheckCircle className="w-4 h-4 inline mr-1" /> Saved to DB!</> : saving ? 'Saving...' : 'Add Supplier'}
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

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const data = await suppliersService.getAll()
      setSuppliers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSuppliers() }, [])

  const filtered = suppliers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  )

  const handleSave = async (data: Partial<Supplier>) => {
    await suppliersService.create(data)
    await loadSuppliers()
  }

  return (
    <div>
      <PageHeader title="Suppliers" description={`${suppliers.length} active suppliers in DB`}>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </PageHeader>

      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search supplier by name or phone..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading suppliers from database...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Building2 className="w-7 h-7" />} title="No suppliers found" description="Add your first supplier to the database." action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add Supplier</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="premium-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{s.name}</h3>
                  {s.contactPerson && <p className="text-xs text-muted-foreground">Contact: {s.contactPerson}</p>}
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {s.phone}</p>
                {s.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {s.email}</p>}
                {s.address && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {s.address}</p>}
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total purchases</span>
                <span className="font-semibold text-foreground">{formatCurrency(s.totalPurchases || 0)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SupplierModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  )
}
