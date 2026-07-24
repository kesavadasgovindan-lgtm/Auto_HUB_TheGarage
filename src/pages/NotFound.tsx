import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-white px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-8xl font-black text-white/10 mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-white/50 mb-8">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
