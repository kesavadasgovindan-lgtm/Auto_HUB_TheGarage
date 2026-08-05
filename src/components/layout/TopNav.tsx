import { useState } from 'react'
import { Bell, Search, Sun, Moon, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { MobileTrigger } from './Sidebar'
import { CommandPalette } from '@/components/common/CommandPalette'
import { cn } from '@/lib/utils'

export function TopNav({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [commandOpen, setCommandOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const notifications = [
    { id: 1, title: 'Low Stock Alert', desc: 'EGR Valve (EGR-MB-E22) is out of stock', time: '10m ago', unread: true },
    { id: 2, title: 'Job Completed', desc: 'JOB-2026-002 quality check passed', time: '1h ago', unread: true },
    { id: 3, title: 'Payment Received', desc: '₹5,310 via UPI from Priya Sharma', time: '2h ago', unread: false },
  ]

  return (
    <>
      <header className="h-14 border-b border-white/5 flex items-center gap-3 px-4 bg-card/80 backdrop-blur-xl flex-shrink-0">
        <MobileTrigger onClick={onMobileMenuOpen} />

        {/* Brand (mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-base">Auto<span className="text-blue-400">Hub</span></span>
        </div>

        {/* Search bar */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden sm:flex flex-1 max-w-sm items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground text-sm border border-border transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search anything...</span>
          <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border border-border font-mono">⌘K</kbd>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Toggle theme"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl hover:bg-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-border">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="divide-y divide-border/50">
                      {notifications.map((n) => (
                        <div key={n.id} className={cn('p-3 hover:bg-secondary/50 transition-colors cursor-pointer', n.unread && 'bg-blue-500/5')}>
                          <div className="flex items-start gap-2">
                            {n.unread && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                            {!n.unread && <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0" />}
                            <div>
                              <p className="text-xs font-medium">{n.title}</p>
                              <p className="text-xs text-muted-foreground">{n.desc}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ml-1 cursor-pointer">
            {user?.name?.slice(0, 2).toUpperCase() || 'AP'}
          </div>
        </div>
      </header>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  )
}
