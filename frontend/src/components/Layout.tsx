import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, BookOpen, MessageSquare, LayoutDashboard } from 'lucide-react'

export default function Layout({ children, role }: { children: React.ReactNode, role: 'author' | 'admin' }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const authorLinks = [
    { name: 'My Books', path: '/author', icon: BookOpen },
    { name: 'My Tickets', path: '/author/tickets', icon: MessageSquare },
  ]
  
  const adminLinks = [
    { name: 'Ticket Queue', path: '/admin', icon: LayoutDashboard },
  ]

  const links = role === 'admin' ? adminLinks : authorLinks

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 h-screen sticky top-0 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 flex items-center space-x-3 text-white border-b border-slate-800">
          <BookOpen className="w-8 h-8 text-brand-500" />
          <span className="font-bold text-xl tracking-tight">BookLeaf</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const active = location.pathname === link.path || (link.path !== '/author' && link.path !== '/admin' && location.pathname.startsWith(link.path))
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  active 
                    ? 'bg-brand-500 text-white font-medium shadow-md shadow-brand-500/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </button>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
