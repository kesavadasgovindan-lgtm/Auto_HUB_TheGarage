import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Truck, Phone, Mail, X, CheckCircle, Edit, Trash2, MapPin, FileText } from 'lucide-react'
import { mockSuppliers } from '@/mock/data'
import { PageHeader, EmptyState } from '@/components/common'
import { formatCurrency, getInitials } from '@/lib/utils'
import type { Supplier } from '@/types'

interface SupplierForm {
  name: string; contactPerson: string; phone: string; email: string
  address: string; gstNumber: string; paymentTerms: string
}

const emptyForm: SupplierForm = {
  name: '', contactPerson: '', phone: '', email: '', address: '', gstNumber: '', paymentTerms: 'Net 30',
}

function SupplierModal({ open, onClose, supplier, onSave }: {
  open: boolean; onClose: () => void; supplier?: Supplier | null; onSave: (d: SupplierForm) => void
}) {
  const [form, setForm] = useState<SupplierForm>(supplier ? {
    name: supplier.name, contactPerson: supplier.contactPerson || '', phone: supplier.phone,
    email: supplier.email || '', address: supplier.address || '',
    gstNumber: supplier.gstNumber || '', paymentTerms: supplier.paymentTerms || 'Net 30',
  } : emptyForm)
  const [errors, setErrors] = useState<Partial<SupplierForm>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (f: keyof SupplierForm, v: string) => { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: '' })) }

  const validate = () => {
    const e: Partial<SupplierForm> = {}
    if (!form.name.trim()) e.name = 'Supplier name is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit number'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onSave(form)
    setSaved(true)
    await new Promise(r => setTimeout(r, 700))
    setSaved(false); setSaving(false); onClose()
  }

  const fc = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all'
  const si = (f: keyof SupplierForm) => ({
    background: 'hsl(240 3.7% 15.9%)',
    border: `1px solid ${errors[f] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`,
    color: 'hsl(0 0% 98%)',
  })

  const fields: { label: string; field: keyof SupplierForm; placeholder: string; required?: boolean; textarea?: boolean }[] = [
    { label: 'Supplier Name', field: 'name', placeholder: 'AutoParts Express', required: true },
    { label: 'Contact Person', field: 'contactPerson', placeholder: 'Rajesh Sharma' },
    { label: 'Phone Number', field: 'phone', placeholder: '9876543210', required: true },
    { label: 'Email Address', field: 'email', placeholder: 'contact@supplier.com' },
    { label: 'GST Number', field: 'gstNumber', placeholder: '29AABCT1332L1ZX' },
    { label: 'Payment Terms', field: 'paymentTerms', placeholder: 'Net 30' },
    { label: 'Address', field: 'address', placeholder: 'Full address...', textarea: true },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>

              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <Truck className="w-4 h-4" style={{ color: '#fb923c' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>
                      {supplier ? 'Edit Supplier' : 'Add Supplier'}
                    </h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>Fill in supplier details</p>
                  </div>
                </div>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {fields.map(({ label, field, placeholder, required, textarea }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>
                      {label} {required && <span style={{ color: '#f97316' }}>*</span>}
                    </label>
                    {textarea ? (
                      <textarea rows={2} value={form[field]} onChange={e => set(field, e.target.value)}
                        placeholder={placeholder} className={fc + ' resize-none'} style={si(field)} />
                    ) : (
                      <input value={form[field]} onChange={e => set(field, e.target.value)}
                        placeholder={placeholder} className={fc} style={si(field)} />
                    )}
                    {errors[field] && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors[field]}</p>}
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: saved ? '#16a34a' : '#3b82f6', color: 'white' }}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                      : saving ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                        : (supplier ? 'Save Changes' : 'Add Supplier')}
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [modalOpen, setModalOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.contactPerson?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (data: SupplierForm) => {
    if (editSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editSupplier.id ? { ...s, ...data } : s))
    } else {
      setSuppliers(prev => [{
        id: `s${Date.now()}`, ...data, totalPurchases: 0, createdAt: new Date().toISOString(),
      }, ...prev])
    }
    setEditSupplier(null)
  }

  const openAdd = () => { setEditSupplier(null); setModalOpen(true) }
  const openEdit = (s: Supplier) => { setEditSupplier(s); setModalOpen(true) }

  return (
    <div>
      <PageHeader title="Suppliers" description={`${suppliers.length} suppliers`}>
        <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Supplier</button>
      </PageHeader>

      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search suppliers by name, phone..." className="input-field pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Truck className="w-7 h-7" />} title="No suppliers found"
          description="Add your first supplier to get started."
          action={<button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Supplier</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }} className="premium-card p-5 group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.2)', color: '#fb923c' }}>
                  {getInitials(s.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.contactPerson || 'No contact person'}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs mb-3">
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{s.phone}</div>
                {s.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{s.email}</div>}
                {s.address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{s.address}</div>}
                {s.gstNumber && <div className="flex items-center gap-2 text-muted-foreground"><FileText className="w-3.5 h-3.5" />GST: {s.gstNumber}</div>}
              </div>
              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Purchases</p>
                  <p className="font-bold text-sm">{formatCurrency(s.totalPurchases)}</p>
                </div>
                {s.paymentTerms && (
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-lg">{s.paymentTerms}</span>
                )}
              </div>
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => setSuppliers(prev => prev.filter(x => x.id !== s.id))}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SupplierModal open={modalOpen} onClose={() => { setModalOpen(false); setEditSupplier(null) }}
        supplier={editSupplier} onSave={handleSave} />
    </div>
  )
}
