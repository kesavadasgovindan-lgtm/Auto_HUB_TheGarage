import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Phone, Mail, Car, MoreHorizontal,
  Edit, Trash2, Eye, X, User, Building2,
  MapPin, StickyNote, CheckCircle
} from 'lucide-react'
import { customersService } from '@/services'
import { PageHeader, EmptyState } from '@/components/common'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import type { Customer } from '@/types'

// ─── Add / Edit Customer Modal ────────────────────────────────────────────────

interface CustomerFormData {
  name: string
  phone: string
  email: string
  address: string
  gstNumber: string
  notes: string
}

const emptyForm: CustomerFormData = {
  name: '', phone: '', email: '', address: '', gstNumber: '', notes: '',
}

interface CustomerModalProps {
  open: boolean
  onClose: () => void
  customer?: Customer | null
  onSave: (data: CustomerFormData) => Promise<void>
}

function CustomerModal({ open, onClose, customer, onSave }: CustomerModalProps) {
  const [form, setForm] = useState<CustomerFormData>(
    customer
      ? { name: customer.name, phone: customer.phone, email: customer.email || '', address: customer.address || '', gstNumber: customer.gstNumber || '', notes: customer.notes || '' }
      : emptyForm
  )
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (customer) {
      setForm({ name: customer.name, phone: customer.phone, email: customer.email || '', address: customer.address || '', gstNumber: customer.gstNumber || '', notes: customer.notes || '' })
    } else {
      setForm(emptyForm)
    }
  }, [customer, open])

  const set = (field: keyof CustomerFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs: Partial<CustomerFormData> = {}
    if (!form.name.trim()) errs.name = 'Customer name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid 10-digit phone number'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave(form)
      setSaved(true)
      await new Promise((r) => setTimeout(r, 600))
      setSaved(false)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error saving customer')
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <User className="w-4 h-4" style={{ color: '#60a5fa' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>{customer ? `Editing ${customer.name}` : 'Fill in the customer details below'}</p>
                  </div>
                </div>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Customer Name <span style={{ color: '#f97316' }}>*</span></label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Rajesh Kumar" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'hsl(240 3.7% 15.9%)', border: `1px solid ${errors.name ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`, color: 'hsl(0 0% 98%)' }} />
                  {errors.name && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Phone Number <span style={{ color: '#f97316' }}>*</span></label>
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="e.g. 9876543210" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'hsl(240 3.7% 15.9%)', border: `1px solid ${errors.phone ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`, color: 'hsl(0 0% 98%)' }} />
                  {errors.phone && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Email Address</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="e.g. rajesh@gmail.com" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>GST Number</label>
                  <input value={form.gstNumber} onChange={(e) => set('gstNumber', e.target.value)} placeholder="e.g. 29AABCT1332L1ZX" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Address</label>
                  <textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Full address..." className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none" style={{ background: 'hsl(240 3.7% 15.9%)', border: '1px solid hsl(240 3.7% 15.9%)', color: 'hsl(0 0% 98%)' }} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: saved ? '#16a34a' : '#3b82f6' }}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved to DB!</> : saving ? 'Saving to Database...' : (customer ? 'Save Changes' : 'Add Customer')}
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

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const data = await customersService.getAll()
      setCustomers(data)
    } catch (e) {
      console.error('Failed to load customers:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data: CustomerFormData) => {
    if (editCustomer) {
      await customersService.update(editCustomer.id, data)
    } else {
      await customersService.create(data)
    }
    await loadCustomers()
  }

  const handleDelete = async (id: string | number) => {
    if (confirm('Delete this customer?')) {
      await customersService.delete(id)
      await loadCustomers()
    }
  }

  return (
    <div onClick={() => openMenu && setOpenMenu(null)}>
      <PageHeader title="Customers" description={`${customers.length} total customers in database`}>
        <button className="btn-primary" onClick={() => { setEditCustomer(null); setModalOpen(true) }}>
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </PageHeader>

      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or email..." className="input-field pl-9" />
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading customers from database...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Search className="w-7 h-7" />} title="No customers found" description="Try searching or add a new customer." action={<button className="btn-primary" onClick={() => { setEditCustomer(null); setModalOpen(true) }}><Plus className="w-4 h-4" /> Add Customer</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th className="hidden md:table-cell">Email</th>
                  <th className="hidden lg:table-cell">Vehicles</th>
                  <th className="hidden lg:table-cell">Total Billed</th>
                  <th className="hidden sm:table-cell">Last Visit</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, i) => (
                  <motion.tr key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          {customer.gstNumber && <p className="text-xs text-muted-foreground">GST: {customer.gstNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-sm text-muted-foreground">{customer.email || '—'}</td>
                    <td className="hidden lg:table-cell text-sm">{customer.vehicleCount || 0}</td>
                    <td className="hidden lg:table-cell text-sm font-medium">{formatCurrency(customer.totalBilled || 0)}</td>
                    <td className="hidden sm:table-cell text-sm text-muted-foreground">{customer.lastVisit ? formatDate(customer.lastVisit) : '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditCustomer(customer); setModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="p-1.5 rounded-lg hover:bg-secondary text-red-400">
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

      <CustomerModal open={modalOpen} onClose={() => setModalOpen(false)} customer={editCustomer} onSave={handleSave} />
    </div>
  )
}
