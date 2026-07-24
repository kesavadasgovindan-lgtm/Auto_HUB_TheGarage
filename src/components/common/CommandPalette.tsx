import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Car, ClipboardList, Package, FileText, Receipt, X } from 'lucide-react'
import { mockCustomers, mockVehicles, mockJobs, mockInventory, mockQuotations, mockInvoices } from '@/mock/data'
import type { SearchResult } from '@/types'
import { cn } from '@/lib/utils'

function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = []
  mockCustomers.forEach((c) => results.push({ id: c.id, type: 'customer', title: c.name, subtitle: c.phone, url: `/customers/${c.id}` }))
  mockVehicles.forEach((v) => results.push({ id: v.id, type: 'vehicle', title: v.vehicleNumber, subtitle: `${v.brand} ${v.model} · ${v.customerName}`, url: `/vehicles/${v.id}` }))
  mockJobs.forEach((j) => results.push({ id: j.id, type: 'job', title: j.jobNumber, subtitle: `${j.vehicleName} · ${j.status}`, url: `/jobs/${j.id}` }))
  mockInventory.forEach((i) => results.push({ id: i.id, type: 'part', title: i.name, subtitle: `${i.partNumber} · Stock: ${i.quantity}`, url: `/inventory/${i.id}` }))
  mockQuotations.forEach((q) => results.push({ id: q.id, type: 'quotation', title: q.quotationNumber, subtitle: `${q.customerName} · ₹${q.grandTotal.toLocaleString('en-IN')}`, url: `/quotations/${q.id}` }))
  mockInvoices.forEach((i) => results.push({ id: i.id, type: 'invoice', title: i.invoiceNumber, subtitle: `${i.customerName} · ₹${i.grandTotal.toLocaleString('en-IN')}`, url: `/billing/${i.id}` }))
  return results
}

const allResults = buildSearchIndex()

const typeIcon: Record<string, React.ElementType> = {
  customer: Users,
  vehicle: Car,
  job: ClipboardList,
  part: Package,
  quotation: FileText,
  invoice: Receipt,
}

const typeColor: Record<string, string> = {
  customer: 'text-blue-400 bg-blue-500/10',
  vehicle: 'text-orange-400 bg-orange-500/10',
  job: 'text-green-400 bg-green-500/10',
  part: 'text-purple-400 bg-purple-500/10',
  quotation: 'text-yellow-400 bg-yellow-500/10',
  invoice: 'text-pink-400 bg-pink-500/10',
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()

  const filtered = query.trim()
    ? allResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : allResults.slice(0, 6)

  const handleSelect = useCallback(
    (result: SearchResult) => {
      navigate(result.url)
      onClose()
      setQuery('')
    },
    [navigate, onClose]
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (!open) onClose()
      }
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') setSelected((s) => Math.min(s + 1, filtered.length - 1))
      if (e.key === 'ArrowUp') setSelected((s) => Math.max(s - 1, 0))
      if (e.key === 'Enter' && filtered[selected]) handleSelect(filtered[selected])
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, filtered, selected, onClose, handleSelect])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-start justify-center pt-16 z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-card border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search customers, vehicles, jobs, parts..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Results */}
              <div className="py-2 max-h-80 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No results found for "{query}"
                  </div>
                ) : (
                  <>
                    {!query && <p className="px-4 py-2 text-xs text-muted-foreground">Recent</p>}
                    {filtered.map((result, i) => {
                      const Icon = typeIcon[result.type] || Search
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className={cn(
                            'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                            selected === i ? 'bg-secondary' : 'hover:bg-secondary/50'
                          )}
                        >
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', typeColor[result.type])}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                          </div>
                          <span className="text-xs text-muted-foreground capitalize hidden sm:block">{result.type}</span>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
                <span><kbd className="font-mono">↵</kbd> Select</span>
                <span><kbd className="font-mono">Esc</kbd> Close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
