import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Car, Fuel, X, CheckCircle } from 'lucide-react'
import { vehiclesService, customersService } from '@/services'
import { PageHeader, EmptyState } from '@/components/common'
import { formatDate } from '@/lib/utils'
import type { Vehicle, Customer } from '@/types'

const fuelColors: Record<string, string> = {
  Petrol: 'bg-green-500/10 text-green-400',
  Diesel: 'bg-yellow-500/10 text-yellow-400',
  Electric: 'bg-blue-500/10 text-blue-400',
  CNG: 'bg-teal-500/10 text-teal-400',
  Hybrid: 'bg-purple-500/10 text-purple-400',
  LPG: 'bg-orange-500/10 text-orange-400',
}

interface VehicleModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Vehicle>) => Promise<void>
}

function VehicleModal({ open, onClose, onSave }: VehicleModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [form, setForm] = useState({
    customerId: '', vehicleNumber: '', brand: '', model: '', variant: '',
    fuelType: 'Petrol', transmission: 'Manual', year: new Date().getFullYear().toString(),
    color: '', odometer: '0', engineNumber: '', chassisNumber: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) customersService.getAll().then(setCustomers).catch(() => {})
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId || !form.vehicleNumber || !form.brand || !form.model) {
      alert('Please fill in customer, vehicle number, brand, and model')
      return
    }
    setSaving(true)
    try {
      const selectedCustomer = customers.find(c => c.id.toString() === form.customerId)
      await onSave({
        ...form,
        customerId: form.customerId,
        customerName: selectedCustomer?.name || '',
        year: parseInt(form.year) || 2024,
        odometer: parseInt(form.odometer) || 0,
        fuelType: form.fuelType as any,
        transmission: form.transmission as any,
      })
      setSaved(true)
      await new Promise(r => setTimeout(r, 600))
      setSaved(false)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Failed to save vehicle')
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl" style={{ background: 'hsl(240 10% 5.5%)', border: '1px solid hsl(240 3.7% 15.9%)' }}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b" style={{ borderColor: 'hsl(240 3.7% 15.9%)' }}>
                <h2 className="font-semibold text-base" style={{ color: 'hsl(0 0% 98%)' }}>Add New Vehicle</h2>
                <button onClick={onClose} style={{ color: 'hsl(240 5% 64.9%)' }}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Owner (Customer) *</label>
                  <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} className={fc} style={fs}>
                    <option value="">— Select Owner —</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Vehicle Reg. Number *</label>
                    <input value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))} placeholder="KA01AB1234" className={fc} style={fs} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Brand *</label>
                    <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Toyota, Honda..." className={fc} style={fs} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Model *</label>
                    <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Innova, City..." className={fc} style={fs} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Fuel Type</label>
                    <select value={form.fuelType} onChange={e => setForm(f => ({ ...f, fuelType: e.target.value }))} className={fc} style={fs}>
                      {['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid', 'LPG'].map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Transmission</label>
                    <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))} className={fc} style={fs}>
                      {['Manual', 'Automatic', 'CVT', 'AMT'].map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'hsl(0 0% 98%)' }}>Odometer (km)</label>
                    <input type="number" value={form.odometer} onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))} className={fc} style={fs} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl text-xs" style={{ background: 'hsl(240 3.7% 15.9%)', color: 'hsl(240 5% 64.9%)' }}>Cancel</button>
                  <button type="submit" disabled={saving || saved} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: saved ? '#16a34a' : '#3b82f6' }}>
                    {saved ? <><CheckCircle className="w-4 h-4 inline mr-1" /> Inserted to DB!</> : saving ? 'Inserting...' : 'Save to DB'}
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

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadVehicles = async () => {
    setLoading(true)
    try {
      const data = await vehiclesService.getAll()
      setVehicles(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVehicles() }, [])

  const filtered = vehicles.filter((v) =>
    v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.customerName.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data: Partial<Vehicle>) => {
    await vehiclesService.create(data)
    await loadVehicles()
  }

  return (
    <div>
      <PageHeader title="Vehicles" description={`${vehicles.length} registered vehicles in DB`}>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </PageHeader>

      <div className="premium-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by registration, brand, model or owner..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading vehicles from database...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Car className="w-7 h-7" />} title="No vehicles found" description="Try a different search or add a vehicle." action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add Vehicle</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((vehicle, i) => (
            <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="premium-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-400" />
                </div>
                <span className={`badge ${fuelColors[vehicle.fuelType] || 'bg-secondary'}`}>
                  <Fuel className="w-3 h-3" /> {vehicle.fuelType}
                </span>
              </div>
              <h3 className="font-bold text-base mb-0.5">{vehicle.vehicleNumber}</h3>
              <p className="text-sm text-muted-foreground mb-3">{vehicle.brand} {vehicle.model} {vehicle.variant && `· ${vehicle.variant}`}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="font-medium truncate">{vehicle.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Year</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Odometer</p>
                  <p className="font-medium">{vehicle.odometer ? vehicle.odometer.toLocaleString('en-IN') : 0} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transmission</p>
                  <p className="font-medium">{vehicle.transmission}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <VehicleModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  )
}
