import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Phone, Mail, Car, MoreHorizontal,
  Edit, Trash2, Eye, X, User, Building2, FileText,
  MapPin, StickyNote, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react'
import { mockCustomers } from '@/mock/data'
import { PageHeader, EmptyState } from '@/components/common'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
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
  onSave: (data: CustomerFormData) => void
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

  const set = (field: keyof CustomerFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs: Partial<CustomerFormData> = {}
    if (!form.name.trim()) errs.name = 'Customer name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid 10-digit phone number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    onSave(form)
    setSaved(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaved(false)
    setSaving(false)
    onClose()
  }

  const fields: { label: string; field: keyof CustomerFormData; type?: string; placeholder: string; icon: React.ElementType; required?: boolean }[] = [
    { label: 'Customer Name', field: 'name', placeholder: 'e.g. Rajesh Kumar', icon: User, required: true },
    { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: 'e.g. 9876543210', icon: Phone, required: true },
    { label: 'Email Address', field: 'email', type: 'email', placeholder: 'e.g. rajesh@gmail.com', icon: Mail },
    { label: 'GST Number', field: 'gstNumber', placeholder: 'e.g. 29AABCT1332L1ZX', icon: Building2 },
    { label: 'Address', field: 'address', placeholder: 'Full address...', icon: MapPin },
    { label: 'Notes', field: 'notes', placeholder: 'Any internal notes...', icon: StickyNote },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b"
                style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <User className="w-4 h-4" style={{ color: '#60a5fa' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>
                      {customer ? 'Edit Customer' : 'Add New Customer'}
                    </h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>
                      {customer ? `Editing ${customer.name}` : 'Fill in the customer details below'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'hsl(240 5% 64.9%)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(240 3.7% 15.9%)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {fields.map(({ label, field, type = 'text', placeholder, icon: Icon, required }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>
                      {label} {required && <span style={{ color: '#f97316' }}>*</span>}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: 'hsl(240 5% 64.9%)' }} />
                      {field === 'notes' || field === 'address' ? (
                        <textarea
                          rows={field === 'notes' ? 2 : 3}
                          value={form[field]}
                          onChange={(e) => set(field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm resize-none outline-none transition-all"
                          style={{
                            background: 'hsl(240 3.7% 15.9%)',
                            border: `1px solid ${errors[field] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`,
                            color: 'hsl(0 0% 98%)',
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.15)' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = errors[field] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                      ) : (
                        <input
                          type={type}
                          value={form[field]}
                          onChange={(e) => set(field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                          style={{
                            background: 'hsl(240 3.7% 15.9%)',
                            border: `1px solid ${errors[field] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`,
                            color: 'hsl(0 0% 98%)',
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.15)' }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = errors[field] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                      )}
                    </div>
                    {errors[field] && (
                      <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors[field]}</p>
                    )}
                  </div>
                ))}

                {/* Footer buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)', border: '1px solid hsl(240 3.7% 15.9%)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || saved}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: saved ? '#16a34a' : '#3b82f6',
                      color: 'white',
                      opacity: saving ? 0.8 : 1,
                    }}
                  >
                    {saved ? (
                      <><CheckCircle className="w-4 h-4" /> Saved!</>
                    ) : saving ? (
                      <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                      />
                    ) : (
                      <>{customer ? 'Save Changes' : 'Add Customer'}</>
                    )}
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

// ─── Customer Detail Drawer ───────────────────────────────────────────────────

function CustomerDetail({ customer, onClose, onEdit }: { customer: Customer; onClose: () => void; onEdit: () => void }) {
  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="fixed top-0 right-0 h-full w-full max-w-sm z-50 overflow-y-auto"
          style={{ background: 'hsl(240 10% 5.5%)', borderLeft: '1px solid hsl(240 3.7% 15.9%)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
            <h2 className="font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>Customer Details</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'hsl(240 5% 64.9%)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                {getInitials(customer.name)}
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'hsl(0 0% 98%)' }}>{customer.name}</h3>
                <p className="text-sm" style={{ color: 'hsl(240 5% 64.9%)' }}>Customer since {formatDate(customer.createdAt)}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(240 3.7% 15.9%)' }}>
              {[
                { label: 'Phone', value: customer.phone, icon: Phone },
                { label: 'Email', value: customer.email || '—', icon: Mail },
                { label: 'Address', value: customer.address || '—', icon: MapPin },
                { label: 'GST Number', value: customer.gstNumber || '—', icon: FileText },
              ].map((row, i, arr) => (
                <div key={row.label} className="flex items-start gap-3 p-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid hsl(240 3.7% 15.9%)' : 'none' }}>
                  <row.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(240 5% 64.9%)' }} />
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'hsl(240 5% 64.9%)' }}>{row.label}</p>
                    <p className="text-sm font-medium" style={{ color: 'hsl(0 0% 98%)' }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Vehicles', value: customer.vehicleCount, color: '#60a5fa' },
                { label: 'Total Billed', value: formatCurrency(customer.totalBilled), color: '#4ade80' },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl" style={{ background: 'hsl(240 3.7% 15.9%)' }}>
                  <p className="text-xs mb-1" style={{ color: 'hsl(240 5% 64.9%)' }}>{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {customer.notes && (
              <div className="p-3 rounded-xl" style={{ background: 'hsl(240 3.7% 15.9%)' }}>
                <p className="text-xs mb-1" style={{ color: 'hsl(240 5% 64.9%)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'hsl(0 0% 98%)' }}>{customer.notes}</p>
              </div>
            )}

            <button
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#3b82f6', color: 'white' }}
            >
              <Edit className="w-4 h-4" /> Edit Customer
            </button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (data: { name: string; phone: string; email: string; address: string; gstNumber: string; notes: string }) => {
    if (editCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editCustomer.id ? { ...c, ...data } : c
        )
      )
    } else {
      const newCustomer: Customer = {
        id: `c${Date.now()}`,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        gstNumber: data.gstNumber,
        notes: data.notes,
        vehicleCount: 0,
        totalBilled: 0,
        createdAt: new Date().toISOString(),
      }
      setCustomers((prev) => [newCustomer, ...prev])
    }
    setEditCustomer(null)
  }

  const handleDelete = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    setOpenMenu(null)
  }

  const openAdd = () => {
    setEditCustomer(null)
    setModalOpen(true)
  }

  const openEdit = (customer: Customer) => {
    setEditCustomer(customer)
    setViewCustomer(null)
    setOpenMenu(null)
    setModalOpen(true)
  }

  const openView = (customer: Customer) => {
    setViewCustomer(customer)
    setOpenMenu(null)
  }

  return (
    <div onClick={() => openMenu && setOpenMenu(null)}>
      <PageHeader title="Customers" description={`${customers.length} total customers`}>
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </PageHeader>

      {/* Search */}
      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-7 h-7" />}
            title="No customers found"
            description="Try searching with a different name or phone number."
            action={
              <button className="btn-primary" onClick={openAdd}>
                <Plus className="w-4 h-4" /> Add Customer
              </button>
            }
          />
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
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="cursor-pointer"
                    onClick={() => openView(customer)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.name}</p>
                          {customer.gstNumber && (
                            <p className="text-xs text-muted-foreground">GST: {customer.gstNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        {customer.email || '—'}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Car className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
                        {customer.vehicleCount}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell text-sm font-medium">{formatCurrency(customer.totalBilled)}</td>
                    <td className="hidden sm:table-cell text-sm text-muted-foreground">
                      {customer.lastVisit ? formatDate(customer.lastVisit) : '—'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenu(openMenu === customer.id ? null : customer.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <AnimatePresence>
                          {openMenu === customer.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 top-9 w-36 rounded-xl shadow-xl z-20 py-1 overflow-hidden"
                              style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}
                            >
                              <button
                                onClick={() => openView(customer)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors"
                                style={{ color: 'hsl(0 0% 98%)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(240 3.7% 15.9%)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>
                              <button
                                onClick={() => openEdit(customer)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors"
                                style={{ color: 'hsl(0 0% 98%)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(240 3.7% 15.9%)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <div style={{ height: '1px', background: 'hsl(240 3.7% 15.9%)', margin: '2px 0' }} />
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors"
                                style={{ color: '#f87171' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(240 3.7% 15.9%)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <CustomerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditCustomer(null) }}
        customer={editCustomer}
        onSave={handleSave}
      />

      {/* View Drawer */}
      {viewCustomer && (
        <CustomerDetail
          customer={viewCustomer}
          onClose={() => setViewCustomer(null)}
          onEdit={() => openEdit(viewCustomer)}
        />
      )}
    </div>
  )
}
