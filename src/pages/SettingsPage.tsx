import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, FileText, Users, Bell, Palette, Database, Shield, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'invoice', label: 'Invoice Settings', icon: FileText },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'theme', label: 'Theme Settings', icon: Palette },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
  { id: 'permissions', label: 'Roles & Permissions', icon: Shield },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('business')

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your garage management platform</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="premium-card p-2">
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-colors',
                  activeSection === s.id
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'business' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6">
              <h2 className="font-semibold text-base mb-4">Business Profile</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Garage Name', placeholder: 'Auto Hub Service Center', type: 'text' },
                  { label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
                  { label: 'Email Address', placeholder: 'contact@autohub.com', type: 'email' },
                  { label: 'GST Number', placeholder: '29AABCT1332L1ZX', type: 'text' },
                ].map((f) => (
                  <div key={f.label} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} className="input-field" />
                  </div>
                ))}
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Address</label>
                  <textarea rows={3} placeholder="Full address of your garage..." className="input-field resize-none" />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button className="btn-primary">Save Changes</button>
              </div>
            </motion.div>
          )}

          {activeSection === 'invoice' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6">
              <h2 className="font-semibold text-base mb-4">Invoice Settings</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Invoice Prefix', placeholder: 'INV', value: 'INV' },
                  { label: 'Quotation Prefix', placeholder: 'QUO', value: 'QUO' },
                  { label: 'Job Card Prefix', placeholder: 'JOB', value: 'JOB' },
                  { label: 'GST Percentage', placeholder: '18', value: '18' },
                ].map((f) => (
                  <div key={f.label} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} defaultValue={f.value} className="input-field" />
                  </div>
                ))}
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Terms & Conditions</label>
                  <textarea rows={4} placeholder="Default terms and conditions for all invoices and quotations..." className="input-field resize-none" defaultValue="1. All payments are due within 7 days of invoice date.&#10;2. Warranty on parts as per manufacturer's terms.&#10;3. Warranty on labour: 30 days from service date." />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button className="btn-primary">Save Changes</button>
              </div>
            </motion.div>
          )}

          {activeSection === 'theme' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6">
              <h2 className="font-semibold text-base mb-4">Theme Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Use dark theme across the application</p>
                  </div>
                  <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
                  <div>
                    <p className="font-medium text-sm">Compact View</p>
                    <p className="text-xs text-muted-foreground">Use smaller spacing throughout</p>
                  </div>
                  <div className="w-10 h-5 bg-secondary-foreground/20 rounded-full relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white/50 rounded-full shadow" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!['business', 'invoice', 'theme'].includes(activeSection) && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-16 flex flex-col items-center text-center">
              {sections.find(s => s.id === activeSection) && (
                <>
                  {(() => { const S = sections.find(s => s.id === activeSection)!; return <S.icon className="w-10 h-10 text-muted-foreground mb-4" /> })()}
                  <h3 className="font-semibold">{sections.find(s => s.id === activeSection)?.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">This section is available in the full version.</p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
