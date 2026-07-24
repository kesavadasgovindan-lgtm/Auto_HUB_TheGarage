import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, ArrowRight, Car, Gauge, Wrench, Shield } from 'lucide-react'
import { authService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

const features = [
  { icon: Gauge, text: 'Real-time dashboard insights' },
  { icon: Car, text: 'Complete vehicle service tracking' },
  { icon: Wrench, text: 'Digital job card management' },
  { icon: Shield, text: 'Role-based access control' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@autohub.com', password: 'admin123' },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await authService.login(data.email, data.password)
      login(res.user, res.token)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password. Try admin@autohub.com / admin123')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      {/* Left – Illustration */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-[#09090B] to-[#09090B]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px]" />

        {/* Animated particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-blue-400/40"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-sm mx-auto px-8 text-white">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Auto<span className="text-blue-400">Hub</span></span>
          </div>

          {/* Luxury car illustration */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-10"
          >
            <svg viewBox="0 0 400 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
              {/* Glow */}
              <ellipse cx="200" cy="175" rx="140" ry="15" fill="rgba(59,130,246,0.2)" />
              {/* Body */}
              <rect x="40" y="100" width="320" height="55" rx="6" fill="#1e293b" />
              <path d="M 90 100 L 140 65 L 270 65 L 320 100 Z" fill="#334155" />
              {/* Windows */}
              <rect x="148" y="68" width="75" height="30" rx="3" fill="#0ea5e9" opacity="0.4" />
              <rect x="228" y="68" width="82" height="30" rx="3" fill="#0ea5e9" opacity="0.4" />
              {/* Grille */}
              <rect x="42" y="115" width="25" height="12" rx="3" fill="#60a5fa" opacity="0.6" />
              <rect x="335" y="115" width="25" height="12" rx="3" fill="#f87171" opacity="0.6" />
              {/* Wheels */}
              <circle cx="110" cy="155" r="30" fill="#0f172a" stroke="#334155" strokeWidth="4" />
              <circle cx="110" cy="155" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="110" cy="155" r="5" fill="#60a5fa" />
              <circle cx="290" cy="155" r="30" fill="#0f172a" stroke="#334155" strokeWidth="4" />
              <circle cx="290" cy="155" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="290" cy="155" r="5" fill="#60a5fa" />
              {/* Blue accent stripe */}
              <rect x="40" y="148" width="320" height="3" rx="1.5" fill="#3b82f6" opacity="0.6" />
            </svg>
          </motion.div>

          <h2 className="text-3xl font-bold mb-3 leading-tight">
            The premium garage<br />management platform
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Engineered for modern automotive service centers that demand excellence.
          </p>

          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-white/70"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  <f.icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                {f.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – Login Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Auto<span className="text-blue-400">Hub</span></span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-white/50 text-sm mb-8">Sign in to your Auto Hub account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="form-group">
              <label className="form-label text-white/80">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@autohub.com"
                className={cn('input-field bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20', errors.email && 'border-red-500/50')}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label text-white/80">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('input-field bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 pr-10', errors.password && 'border-red-500/50')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500"
                />
                <span className="text-sm text-white/60">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              {isLoading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/40">
            <p className="font-medium text-white/60 mb-1">Demo credentials</p>
            <p>Email: admin@autohub.com</p>
            <p>Password: admin123</p>
          </div>

          <p className="text-center text-xs text-white/30 mt-6">
            © 2026 Auto Hub · Premium Garage Management
          </p>
        </motion.div>
      </div>
    </div>
  )
}
