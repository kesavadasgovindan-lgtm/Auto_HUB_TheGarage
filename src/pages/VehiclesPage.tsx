import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Car, Fuel, X, User, Hash, Calendar, Gauge, Palette, FileText, Shield, CheckCircle, Edit, Eye, Trash2 } from 'lucide-react'
import { mockVehicles, mockCustomers } from '@/mock/data'
import { PageHeader, EmptyState } from '@/components/common'
import { formatDate, getInitials, cn } from '@/lib/utils'
import type { Vehicle, FuelType, TransmissionType } from '@/types'

const fuelTypes: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid', 'LPG']
const transmissions: TransmissionType[] = ['Manual', 'Automatic', 'CVT', 'DCT']

const fuelColors: Record<string, string> = {
  Petrol: 'text-green-400 bg-green-500/10 border-green-500/20',
  Diesel: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Electric: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  CNG: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  Hybrid: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  LPG: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

interface VehicleForm {
  customerId: string
  vehicleNumber: string
  brand: string
  model: string
  variant: string
  fuelType: FuelType
  transmission: TransmissionType
  year: string
  color: string
  odometer: string
  engineNumber: string
  chassisNumber: string
  insuranceExpiry: string
  rcExpiry: string
}

const emptyForm: VehicleForm = {
  customerId: '', vehicleNumber: '', brand: '', model: '', variant: '',
  fuelType: 'Petrol', transmission: 'Manual', year: new Date().getFullYear().toString(),
  color: '', odometer: '0', engineNumber: '', chassisNumber: '',
  insuranceExpiry: '', rcExpiry: '',
}

interface VehicleModalProps {
  open: boolean
  onClose: () => void
  vehicle?: Vehicle | null
  onSave: (data: VehicleForm) => void
}

function VehicleModal({ open, onClose, vehicle, onSave }: VehicleModalProps) {
  const [form, setForm] = useState<VehicleForm>(
    vehicle ? {
      customerId: vehicle.customerId, vehicleNumber: vehicle.vehicleNumber,
      brand: vehicle.brand, model: vehicle.model, variant: vehicle.variant || '',
      fuelType: vehicle.fuelType, transmission: vehicle.transmission,
      year: vehicle.year.toString(), color: vehicle.color || '',
      odometer: vehicle.odometer.toString(), engineNumber: vehicle.engineNumber || '',
      chassisNumber: vehicle.chassisNumber || '', insuranceExpiry: vehicle.insuranceExpiry || '',
      rcExpiry: vehicle.rcExpiry || '',
    } : emptyForm
  )
  const [errors, setErrors] = useState<Partial<VehicleForm>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (field: keyof VehicleForm, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e: Partial<VehicleForm> = {}
    if (!form.customerId) e.customerId = 'Select a customer'
    if (!form.vehicleNumber.trim()) e.vehicleNumber = 'Vehicle number is required'
    if (!form.brand.trim()) e.brand = 'Brand is required'
    if (!form.model.trim()) e.model = 'Model is required'
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

  const inputStyle = (field: keyof VehicleForm) => ({
    background: 'hsl(240 3.7% 15.9%)',
    border: `1px solid ${errors[field] ? '#ef4444' : 'hsl(240 3.7% 15.9%)'}`,
    color: 'hsl(0 0% 98%)',
  })

  const fieldCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all'

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
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Car className="w-4 h-4" style={{ color: '#60a5fa' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                    <p className="text-xs" style={{ color: 'hsl(240 5% 64.9%)' }}>Fill in the vehicle details below</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Owner */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Owner <span style={{ color: '#f97316' }}>*</span></label>
                    <select value={form.customerId} onChange={e => set('customerId', e.target.value)} className={fieldCls} style={inputStyle('customerId')}>
                      <option value="">— Select Customer —</option>
                      {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                    </select>
                    {errors.customerId && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.customerId}</p>}
                  </div>
                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Vehicle Number <span style={{ color: '#f97316' }}>*</span></label>
                    <input value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value.toUpperCase())} placeholder="KA01AB1234" className={fieldCls} style={inputStyle('vehicleNumber')} />
                    {errors.vehicleNumber && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.vehicleNumber}</p>}
                  </div>
                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Brand <span style={{ color: '#f97316' }}>*</span></label>
                    <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Toyota, Honda, BMW..." className={fieldCls} style={inputStyle('brand')} />
                    {errors.brand && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.brand}</p>}
                  </div>
                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Model <span style={{ color: '#f97316' }}>*</span></label>
                    <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="Innova, City..." className={fieldCls} style={inputStyle('model')} />
                    {errors.model && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.model}</p>}
                  </div>
                  {/* Variant */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Variant</label>
                    <input value={form.variant} onChange={e => set('variant', e.target.value)} placeholder="ZXI, GX..." className={fieldCls} style={inputStyle('variant')} />
                  </div>
                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Fuel Type</label>
                    <select value={form.fuelType} onChange={e => set('fuelType', e.target.value as FuelType)} className={fieldCls} style={inputStyle('fuelType')}>
                      {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Transmission</label>
                    <select value={form.transmission} onChange={e => set('transmission', e.target.value as TransmissionType)} className={fieldCls} style={inputStyle('transmission')}>
                      {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Year</label>
                    <input type="number" min="1990" max="2030" value={form.year} onChange={e => set('year', e.target.value)} className={fieldCls} style={inputStyle('year')} />
                  </div>
                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Color</label>
                    <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="Pearl White" className={fieldCls} style={inputStyle('color')} />
                  </div>
                  {/* Odometer */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Odometer (km)</label>
                    <input type="number" min="0" value={form.odometer} onChange={e => set('odometer', e.target.value)} className={fieldCls} style={inputStyle('odometer')} />
                  </div>
                  {/* Engine Number */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Engine Number</label>
                    <input value={form.engineNumber} onChange={e => set('engineNumber', e.target.value.toUpperCase())} placeholder="ENG123456" className={fieldCls} style={inputStyle('engineNumber')} />
                  </div>
                  {/* Chassis Number */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Chassis Number</label>
                    <input value={form.chassisNumber} onChange={e => set('chassisNumber', e.target.value.toUpperCase())} placeholder="CHS789012" className={fieldCls} style={inputStyle('chassisNumber')} />
                  </div>
                  {/* Insurance Expiry */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>Insurance Expiry</label>
                    <input type="date" value={form.insuranceExpiry} onChange={e => set('insuranceExpiry', e.target.value)} className={fieldCls} style={inputStyle('insuranceExpiry')} />
                  </div>
                  {/* RC Expiry */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(0 0% 98%)' }}>RC Expiry</label>
                    <input type="date" value={form.rcExpiry} onChange={e => set('rcExpiry', e.target.value)} className={fieldCls} style={inputStyle('rcExpiry')} />
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex gap-3 mt-5">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ background: saved ? '#16a34a' : '#3b82f6', color: 'white' }}>
                    {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : saving ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} /> : (vehicle ? 'Save Changes' : 'Add Vehicle')}
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

function VehicleDetailDrawer({ vehicle, onClose, onEdit }: { vehicle: Vehicle; onClose: () => void; onEdit: () => void }) {
  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="fixed top-0 right-0 h-full w-full max-w-sm z-50 overflow-y-auto"
          style={{ background: 'hsl(240 10% 5.5%)', borderLeft: '1px solid hsl(240 3.7% 15.9%)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
            <h2 className="font-semibold" style={{ color: 'hsl(0 0% 98%)' }}>Vehicle Details</h2>
            <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Car className="w-7 h-7" style={{ color: '#60a5fa' }} />
              </div>
              <div>
                <h3 className="font-bold text-xl" style={{ color: 'hsl(0 0% 98%)' }}>{vehicle.vehicleNumber}</h3>
                <p className="text-sm" style={{ color: 'hsl(240 5% 64.9%)' }}>{vehicle.brand} {vehicle.model} {vehicle.variant}</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(240 3.7% 15.9%)' }}>
              {[
                { label: 'Owner', value: vehicle.customerName },
                { label: 'Fuel Type', value: vehicle.fuelType },
                { label: 'Transmission', value: vehicle.transmission },
                { label: 'Year', value: vehicle.year.toString() },
                { label: 'Color', value: vehicle.color || '—' },
                { label: 'Odometer', value: `${vehicle.odometer.toLocaleString('en-IN')} km` },
                { label: 'Engine No.', value: vehicle.engineNumber || '—' },
                { label: 'Chassis No.', value: vehicle.chassisNumber || '—' },
                { label: 'Insurance Expiry', value: vehicle.insuranceExpiry ? formatDate(vehicle.insuranceExpiry) : '—' },
                { label: 'RC Expiry', value: vehicle.rcExpiry ? formatDate(vehicle.rcExpiry) : '—' },
              ].map((row, i, arr) => (
                <div key={row.label} className="flex justify-between items-center px-3 py-2.5 text-sm" style={{ borderBottom: i < arr.length - 1 ? '1px solid hsl(240 3.7% 15.9%)' : 'none' }}>
                  <span style={{ color: 'hsl(240 5% 64.9%)' }}>{row.label}</span>
                  <span className="font-medium" style={{ color: 'hsl(0 0% 98%)' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#3b82f6', color: 'white' }}>
              <Edit className="w-4 h-4" /> Edit Vehicle
            </button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [modalOpen, setModalOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null)

  const filtered = vehicles.filter(v =>
    v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.customerName.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (data: VehicleForm) => {
    const owner = mockCustomers.find(c => c.id === data.customerId)
    if (editVehicle) {
      setVehicles(prev => prev.map(v => v.id === editVehicle.id ? { ...v, ...data, year: parseInt(data.year), odometer: parseInt(data.odometer), customerName: owner?.name || '' } : v))
    } else {
      const newV: Vehicle = {
        id: `v${Date.now()}`, customerId: data.customerId, customerName: owner?.name || '',
        vehicleNumber: data.vehicleNumber, brand: data.brand, model: data.model, variant: data.variant,
        fuelType: data.fuelType, transmission: data.transmission, year: parseInt(data.year),
        color: data.color, odometer: parseInt(data.odometer), engineNumber: data.engineNumber,
        chassisNumber: data.chassisNumber, insuranceExpiry: data.insuranceExpiry, rcExpiry: data.rcExpiry,
        createdAt: new Date().toISOString(),
      }
      setVehicles(prev => [newV, ...prev])
    }
    setEditVehicle(null)
  }

  const openAdd = () => { setEditVehicle(null); setModalOpen(true) }
  const openEdit = (v: Vehicle) => { setEditVehicle(v); setViewVehicle(null); setModalOpen(true) }
  const openView = (v: Vehicle) => setViewVehicle(v)
  const handleDelete = (id: string) => setVehicles(prev => prev.filter(v => v.id !== id))

  return (
    <div>
      <PageHeader title="Vehicles" description={`${vehicles.length} registered vehicles`}>
        <button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Vehicle</button>
      </PageHeader>
      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by vehicle number, brand, model or owner..." className="input-field pl-9" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Car className="w-7 h-7" />} title="No vehicles found" description="Add a vehicle to get started." action={<button className="btn-primary" onClick={openAdd}><Plus className="w-4 h-4" /> Add Vehicle</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }} className="premium-card p-5 cursor-pointer group" onClick={() => openView(v)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Car className="w-5 h-5" style={{ color: '#60a5fa' }} />
                </div>
                <span className={`badge border ${fuelColors[v.fuelType] || 'text-muted-foreground bg-secondary'}`}>
                  <Fuel className="w-3 h-3" /> {v.fuelType}
                </span>
              </div>
              <h3 className="font-bold text-base mb-0.5">{v.vehicleNumber}</h3>
              <p className="text-sm text-muted-foreground mb-3">{v.brand} {v.model}{v.variant ? ` · ${v.variant}` : ''}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Owner</p><p className="font-medium truncate">{v.customerName}</p></div>
                <div><p className="text-muted-foreground">Year</p><p className="font-medium">{v.year}</p></div>
                <div><p className="text-muted-foreground">Odometer</p><p className="font-medium">{v.odometer.toLocaleString('en-IN')} km</p></div>
                <div><p className="text-muted-foreground">Transmission</p><p className="font-medium">{v.transmission}</p></div>
              </div>
              {v.insuranceExpiry && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Insurance expiry</span>
                  <span className="font-medium">{formatDate(v.insuranceExpiry)}</span>
                </div>
              )}
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); openEdit(v) }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}><Edit className="w-3 h-3" /> Edit</button>
                <button onClick={e => { e.stopPropagation(); handleDelete(v.id) }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}><Trash2 className="w-3 h-3" /> Remove</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <VehicleModal open={modalOpen} onClose={() => { setModalOpen(false); setEditVehicle(null) }} vehicle={editVehicle} onSave={handleSave} />
      {viewVehicle && <VehicleDetailDrawer vehicle={viewVehicle} onClose={() => setViewVehicle(null)} onEdit={() => openEdit(viewVehicle)} />}
    </div>
  )
}
