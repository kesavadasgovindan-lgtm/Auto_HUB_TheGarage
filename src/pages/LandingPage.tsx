import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Zap, Shield, BarChart3, Users, Car, Package, FileText, Receipt, Settings, ClipboardList, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Particles ───────────────────────────────────────────────────────────────
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0
              ? 'rgba(59,130,246,0.6)'
              : i % 3 === 1
              ? 'rgba(249,115,22,0.4)'
              : 'rgba(255,255,255,0.3)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Car SVG ─────────────────────────────────────────────────────────────────
function CarSVG({ glowPart }: { glowPart?: string }) {
  const partClass = (part: string) =>
    cn(
      'transition-all duration-700',
      glowPart === part
        ? 'fill-blue-500 opacity-100 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
        : glowPart
        ? 'opacity-20'
        : 'opacity-80'
    )

  return (
    <svg viewBox="0 0 800 400" className="w-full max-w-2xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Body Frame */}
      <g className={partClass('body')}>
        <rect x="80" y="200" width="640" height="80" rx="8" fill="currentColor" className={glowPart === 'body' ? 'text-blue-400' : 'text-slate-400'} />
        <path d="M 180 200 L 250 140 L 550 140 L 620 200 Z" fill={glowPart === 'body' ? '#60a5fa' : '#64748b'} />
        <rect x="80" y="270" width="640" height="20" rx="4" fill={glowPart === 'body' ? '#3b82f6' : '#475569'} />
      </g>

      {/* Engine (hood area) */}
      <g className={partClass('engine')}>
        <rect x="80" y="170" width="180" height="40" rx="6" fill={glowPart === 'engine' ? '#f97316' : '#334155'} />
        <rect x="100" y="180" width="140" height="5" rx="2" fill={glowPart === 'engine' ? '#fb923c' : '#475569'} />
        <rect x="100" y="192" width="140" height="5" rx="2" fill={glowPart === 'engine' ? '#fb923c' : '#475569'} />
      </g>

      {/* Transmission */}
      <g className={partClass('transmission')}>
        <rect x="340" y="245" width="120" height="30" rx="5" fill={glowPart === 'transmission' ? '#a855f7' : '#1e293b'} />
        <rect x="370" y="252" width="60" height="8" rx="3" fill={glowPart === 'transmission' ? '#c084fc' : '#334155'} />
      </g>

      {/* Suspension */}
      <g className={partClass('suspension')}>
        <line x1="160" y1="280" x2="160" y2="320" stroke={glowPart === 'suspension' ? '#22c55e' : '#475569'} strokeWidth="8" strokeLinecap="round" />
        <line x1="640" y1="280" x2="640" y2="320" stroke={glowPart === 'suspension' ? '#22c55e' : '#475569'} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="160" cy="270" rx="25" ry="10" fill={glowPart === 'suspension' ? '#16a34a' : '#334155'} />
        <ellipse cx="640" cy="270" rx="25" ry="10" fill={glowPart === 'suspension' ? '#16a34a' : '#334155'} />
      </g>

      {/* Electrical */}
      <g className={partClass('electrical')}>
        <rect x="540" y="155" width="80" height="35" rx="5" fill={glowPart === 'electrical' ? '#eab308' : '#1e293b'} />
        <path d="M 560 165 L 568 178 L 580 170 L 572 185 L 610 165" stroke={glowPart === 'electrical' ? '#facc15' : '#475569'} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Braking System */}
      <g className={partClass('braking')}>
        <circle cx="160" cy="330" r="18" fill="none" stroke={glowPart === 'braking' ? '#ef4444' : '#475569'} strokeWidth="6" />
        <circle cx="640" cy="330" r="18" fill="none" stroke={glowPart === 'braking' ? '#ef4444' : '#475569'} strokeWidth="6" />
        <circle cx="160" cy="330" r="8" fill={glowPart === 'braking' ? '#dc2626' : '#334155'} />
        <circle cx="640" cy="330" r="8" fill={glowPart === 'braking' ? '#dc2626' : '#334155'} />
      </g>

      {/* Tyres */}
      <g className={partClass('tyres')}>
        <circle cx="160" cy="330" r="48" fill="none" stroke={glowPart === 'tyres' ? '#06b6d4' : '#1e293b'} strokeWidth="28" />
        <circle cx="640" cy="330" r="48" fill="none" stroke={glowPart === 'tyres' ? '#06b6d4' : '#1e293b'} strokeWidth="28" />
        <circle cx="160" cy="330" r="30" fill={glowPart === 'tyres' ? '#0e7490' : '#0f172a'} />
        <circle cx="640" cy="330" r="30" fill={glowPart === 'tyres' ? '#0e7490' : '#0f172a'} />
      </g>

      {/* Windows */}
      <g opacity={glowPart && glowPart !== 'body' ? 0.3 : 0.9}>
        <rect x="265" y="145" width="100" height="50" rx="4" fill="#0ea5e9" opacity="0.5" />
        <rect x="375" y="145" width="165" height="50" rx="4" fill="#0ea5e9" opacity="0.5" />
      </g>

      {/* Lights */}
      <g>
        <ellipse cx="92" cy="215" rx="12" ry="8" fill={glowPart === 'electrical' ? '#fbbf24' : '#94a3b8'} opacity={glowPart === 'electrical' ? 1 : 0.5} />
        <ellipse cx="708" cy="215" rx="12" ry="8" fill={glowPart === 'electrical' ? '#ef4444' : '#94a3b8'} opacity={glowPart === 'electrical' ? 1 : 0.5} />
      </g>
    </svg>
  )
}

// ─── Scroll Animation Sections ────────────────────────────────────────────────
const scrollSteps = [
  { part: null, title: 'Complete Vehicle', description: 'A fully assembled precision machine, engineered to perfection.', icon: '🚗' },
  { part: 'body', title: 'Body Frame', description: 'High-strength steel construction for maximum safety and aerodynamics.', icon: '🏗️' },
  { part: 'engine', title: 'Engine', description: 'High-performance powertrain delivering optimal power and efficiency.', icon: '⚙️' },
  { part: 'transmission', title: 'Transmission', description: 'Precision-engineered gearbox for smooth, responsive gear shifts.', icon: '🔧' },
  { part: 'suspension', title: 'Suspension', description: 'Advanced suspension system for a comfortable, controlled ride.', icon: '🌀' },
  { part: 'electrical', title: 'Electrical System', description: 'Smart electronics managing every function of the vehicle.', icon: '⚡' },
  { part: 'braking', title: 'Braking System', description: 'High-performance brakes for precise stopping power and safety.', icon: '🔴' },
  { part: 'tyres', title: 'Tyres', description: 'Premium rubber compounds for grip, handling and durability.', icon: '⭕' },
  { part: null, title: 'Complete Vehicle', description: 'Every component working in perfect harmony. That\'s Auto Hub.', icon: '✨' },
]

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: Users, title: 'Customer Management', desc: 'Complete customer profiles with vehicle history, billing, and communication logs.', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/20', iconColor: 'text-blue-400 bg-blue-500/10' },
  { icon: Car, title: 'Vehicle Management', desc: 'Track every vehicle with VIN, service history, insurance, and RC details.', color: 'from-orange-500/20 to-orange-600/20 border-orange-500/20', iconColor: 'text-orange-400 bg-orange-500/10' },
  { icon: ClipboardList, title: 'Job Cards', desc: 'Digital job cards with status tracking, mechanic assignment, and photo uploads.', color: 'from-green-500/20 to-green-600/20 border-green-500/20', iconColor: 'text-green-400 bg-green-500/10' },
  { icon: Package, title: 'Inventory', desc: 'Real-time stock management with low-stock alerts, barcode support, and supplier tracking.', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/20', iconColor: 'text-purple-400 bg-purple-500/10' },
  { icon: FileText, title: 'Quotations', desc: 'Create professional quotations, get approvals, and convert to invoices in one click.', color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/20', iconColor: 'text-yellow-400 bg-yellow-500/10' },
  { icon: Receipt, title: 'Billing', desc: 'GST-compliant invoicing with multiple payment modes, PDF export, and WhatsApp sharing.', color: 'from-pink-500/20 to-pink-600/20 border-pink-500/20', iconColor: 'text-pink-400 bg-pink-500/10' },
  { icon: BarChart3, title: 'Reports', desc: 'Business intelligence dashboards with revenue, inventory, and mechanic performance reports.', color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/20', iconColor: 'text-cyan-400 bg-cyan-500/10' },
  { icon: Settings, title: 'Settings', desc: 'Configure your garage profile, GST settings, user roles, and invoice templates.', color: 'from-slate-500/20 to-slate-600/20 border-slate-500/20', iconColor: 'text-slate-400 bg-slate-500/10' },
  { icon: Shield, title: 'Employee Management', desc: 'Manage mechanics, assign jobs, track performance, and control access with role-based permissions.', color: 'from-red-500/20 to-red-600/20 border-red-500/20', iconColor: 'text-red-400 bg-red-500/10' },
]

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [currentStep, setCurrentStep] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Scroll-linked step detection
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return
      const sectionEl = document.getElementById('scroll-animation')
      if (!sectionEl) return
      const rect = sectionEl.getBoundingClientRect()
      const sectionHeight = sectionEl.offsetHeight
      const viewportH = window.innerHeight
      const progress = Math.max(0, Math.min(1, (-rect.top) / (sectionHeight - viewportH)))
      const step = Math.min(Math.floor(progress * scrollSteps.length), scrollSteps.length - 1)
      setCurrentStep(step)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const activeStep = scrollSteps[currentStep]

  return (
    <div ref={scrollRef} className="min-h-screen bg-[#09090B] text-white overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-[#09090B] to-[#09090B]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-orange-500/5 blur-[80px]" />
          <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-blue-500/8 blur-[80px]" />
        </div>

        <Particles />

        {/* Mouse following glow */}
        <motion.div
          className="pointer-events-none absolute w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"
          animate={{ x: mousePos.x * 8, y: mousePos.y * 8 }}
          transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          style={{ left: '50%', top: '40%', translateX: '-50%', translateY: '-50%' }}
        />

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-10 py-5 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Auto<span className="text-blue-400">Hub</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">Sign In</Link>
            <Link to="/login" className="btn-primary text-sm py-1.5">Get Started</Link>
          </div>
        </nav>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6"
          >
            <Zap className="w-3 h-3" />
            Premium Garage Management Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-4"
          >
            <span className="block">AUTO</span>
            <span className="block gradient-text">HUB</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg sm:text-xl text-white/60 font-medium mb-2"
          >
            Complete Garage Management Solution
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-sm sm:text-base text-white/40 max-w-2xl mx-auto mb-10"
          >
            Manage Customers, Vehicles, Inventory, Quotations, Billing, Repairs and Reports from one modern platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all duration-200 active:scale-95">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-8 mt-14 flex-wrap"
          >
            {[
              { label: 'Garages using Auto Hub', value: '500+' },
              { label: 'Vehicles managed', value: '50K+' },
              { label: 'Invoices generated', value: '2M+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Car visual below hero text */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{ x: mousePos.x, y: mousePos.y }}
          className="absolute bottom-8 left-0 right-0 px-8 pointer-events-none"
        >
          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent z-10" />
            <CarSVG />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs"
        >
          <span>Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Apple Scroll Animation ── */}
      <section id="scroll-animation" className="relative" style={{ height: `${scrollSteps.length * 100}vh` }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#09090B]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[100px]" />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-8"
              >
                <div className="text-4xl mb-2">{activeStep.icon}</div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">{activeStep.title}</h2>
                <p className="text-white/50 text-base max-w-md mx-auto">{activeStep.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="relative">
              <CarSVG glowPart={activeStep.part as string | undefined} />
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {scrollSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === currentStep ? 'w-6 h-1.5 bg-blue-500' : 'w-1.5 h-1.5 bg-white/20'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything your garage needs</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            A complete suite of tools designed for the modern automotive service center.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={cn(
                'relative p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-sm overflow-hidden group cursor-pointer',
                feature.color
              )}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/2" />
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', feature.iconColor)}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to transform your garage?</h2>
              <p className="text-white/60 mb-8">
                Join 500+ garages already using Auto Hub to streamline operations and grow their business.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"
              >
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-white/70">Auto<span className="text-blue-400">Hub</span></span>
        </div>
        <p>© 2026 Auto Hub. Premium Automobile Garage Management System.</p>
      </footer>
    </div>
  )
}
