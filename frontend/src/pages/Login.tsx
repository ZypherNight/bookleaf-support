import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { BookOpen, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)
      
      const res = await api.post('/token', formData)
      localStorage.setItem('token', res.data.access_token)
      
      const userRes = await api.get('/users/me')
      const role = userRes.data.role
      
      if (role === 'admin') navigate('/admin')
      else navigate('/author')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row relative overflow-y-auto">
      {/* Global Background Image */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay fixed"></div>
      
      {/* Left pane - Branding */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center items-center py-12 lg:py-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 to-transparent hidden lg:block"></div>
        <div className="relative z-10 text-center px-6 lg:px-12 mt-8 lg:mt-0">
          <BookOpen className="w-16 h-16 lg:w-20 lg:h-20 text-brand-500 mx-auto mb-4 lg:mb-8" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 tracking-tight drop-shadow-md">BookLeaf Portal</h1>
          <p className="text-base lg:text-xl text-slate-300 max-w-md mx-auto leading-relaxed drop-shadow-sm">
            Manage your publishing journey, track royalties, and connect with our support team seamlessly.
          </p>
        </div>
      </div>
      
      {/* Right pane - Login Form */}
      <div className="w-full flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl mb-8 lg:mb-0">
          <div className="mb-8 lg:mb-10 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>Demo Admin: admin@bookleaf.com / admin123</p>
            <p>Demo Author: priya.sharma@email.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
