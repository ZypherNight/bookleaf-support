import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { Filter, AlertTriangle, ShieldAlert, Search, Calendar, ChevronRight, Clock, CheckCircle, User, Bell, MessageSquare, X } from 'lucide-react'

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [authorSearch, setAuthorSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ticketsPerPage = 10
  const navigate = useNavigate()
  
  const prevTicketsRef = useRef<any[]>([])
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'new' | 'reply'}[]>([])

  const getUnreadCount = (ticket: any) => {
    const lastReadStr = localStorage.getItem(`ticket_read_${ticket.id}`)
    let count = 0
    if (!lastReadStr) {
      count = 1 + (ticket.messages ? ticket.messages.filter((m: any) => !m.sender_id.startsWith('ADMIN')).length : 0)
    } else {
      const lastReadDate = new Date(lastReadStr)
      if (ticket.messages) {
        count = ticket.messages.filter((m: any) => {
          if (m.sender_id.startsWith('ADMIN')) return false
          const msgDate = new Date(m.created_at + (m.created_at.endsWith('Z') ? '' : 'Z'))
          return msgDate > lastReadDate
        }).length
      }
    }
    return count
  }

  useEffect(() => {
    const fetchTickets = () => {
      api.get('/tickets').then(res => {
        const newTickets = res.data

        if (prevTicketsRef.current.length > 0) {
          const prevTicketsMap = new Map(prevTicketsRef.current.map(t => [t.id, t]))
          const newNotifs: {id: string, text: string, type: 'new' | 'reply'}[] = []
          
          newTickets.forEach((ticket: any) => {
            const prev = prevTicketsMap.get(ticket.id)
            if (!prev) {
              newNotifs.push({ id: Date.now().toString() + Math.random(), text: `New ticket: ${ticket.subject}`, type: 'new' })
            } else if (ticket.messages && prev.messages && ticket.messages.length > prev.messages.length) {
              const latestMsg = ticket.messages[ticket.messages.length - 1]
              if (!latestMsg.sender_id.startsWith('ADMIN')) {
                newNotifs.push({ id: Date.now().toString() + Math.random(), text: `New reply from author on ticket #${ticket.id}`, type: 'reply' })
              }
            }
          })

          if (newNotifs.length > 0) {
            setNotifications(prev => [...prev, ...newNotifs])
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => !newNotifs.find(nn => nn.id === n.id)))
            }, 6000)
          }
        }

        prevTicketsRef.current = newTickets
        setTickets(newTickets)
      })
    }
    fetchTickets()
    const interval = setInterval(fetchTickets, 5000) // Poll every 5s for better real-time feel
    return () => clearInterval(interval)
  }, [])

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, categoryFilter, priorityFilter, dateFilter, customDateFrom, customDateTo, authorSearch])

  const filteredTickets = tickets
    .filter(t => statusFilter === 'All' || t.status === statusFilter)
    .filter(t => categoryFilter === 'All' || t.category === categoryFilter)
    .filter(t => priorityFilter === 'All' || t.priority === priorityFilter)
    .filter(t => !authorSearch || t.author_id.toLowerCase().includes(authorSearch.toLowerCase()))
    .filter(t => {
      if (dateFilter === 'All') return true
      const created = new Date(t.created_at)
      const now = new Date()
      if (dateFilter === 'Today') return created.toDateString() === now.toDateString()
      if (dateFilter === '7d') return (now.getTime() - created.getTime()) <= 7 * 86400000
      if (dateFilter === '30d') return (now.getTime() - created.getTime()) <= 30 * 86400000
      if (dateFilter === 'Custom') {
        if (customDateFrom && created < new Date(customDateFrom)) return false
        if (customDateTo) {
          const to = new Date(customDateTo)
          to.setHours(23, 59, 59, 999)
          if (created > to) return false
        }
        return true
      }
      return true
    })
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
      const isActiveA = a.status !== 'Resolved' && a.status !== 'Closed'
      const isActiveB = b.status !== 'Resolved' && b.status !== 'Closed'
      // Active tickets first
      if (isActiveA && !isActiveB) return -1
      if (!isActiveA && isActiveB) return 1
      // Among active: sort by priority (Critical first), then oldest first
      if (isActiveA && isActiveB) {
        const pa = priorityOrder[a.priority] ?? 4
        const pb = priorityOrder[b.priority] ?? 4
        if (pa !== pb) return pa - pb
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <Layout role="admin">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ticket Queue</h1>
            <p className="text-slate-500 mt-1">Manage and resolve author support requests.</p>
          </div>
          
          <div className="flex items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm w-full md:w-72 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input 
              type="text"
              placeholder="Search by Author ID..."
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-slate-700 w-full placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center text-sm font-semibold text-slate-700 mr-2">
            <Filter className="w-4 h-4 mr-2" /> Filters:
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Royalty & Payments">Royalty & Payments</option>
            <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
            <option value="Printing & Quality">Printing & Quality</option>
            <option value="Distribution & Availability">Distribution</option>
            <option value="Book Status & Production Updates">Production Updates</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <option value="All">Any Date</option>
            <option value="Today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="Custom">Custom Range...</option>
          </select>
          
          <div className="flex-1"></div>
          <div className="text-sm text-slate-500 font-medium">
            Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </div>
        </div>

        {dateFilter === 'Custom' && (
          <div className="flex items-center space-x-4 mb-6 bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-sm w-max animate-in fade-in slide-in-from-top-4">
            <Calendar className="w-5 h-5 text-brand-500" />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500 font-medium">From</span>
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500 font-medium">To</span>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {filteredTickets.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No tickets found</h3>
              <p className="text-slate-500 max-w-sm">There are no tickets matching your current filter criteria.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {filteredTickets.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage).map(ticket => {
                  const unreadCount = getUnreadCount(ticket)
                  return (
                  <li
                    key={ticket.id}
                    onClick={() => {
                      localStorage.setItem(`ticket_read_${ticket.id}`, new Date().toISOString())
                      navigate(`/admin/tickets/${ticket.id}`)
                    }}
                    className="p-5 sm:p-6 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center group"
                  >
                    {/* Avatar */}
                    <div className="hidden sm:flex shrink-0 w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-50 rounded-full border border-brand-200 items-center justify-center text-brand-700 font-bold text-lg shadow-sm">
                      {getInitials(ticket.author?.name)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className={`text-lg truncate transition-colors ${unreadCount > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-700 group-hover:text-brand-600'}`}>
                          {ticket.subject}
                        </h3>
                        
                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                          <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-black shadow-sm shadow-red-500/30 animate-in fade-in zoom-in duration-300">
                            {unreadCount}
                          </span>
                        )}
                        
                        {/* Badges */}
                        {ticket.priority === 'Critical' && (
                          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm">
                            <ShieldAlert className="w-3 h-3 mr-1" /> CRITICAL
                          </span>
                        )}
                        {ticket.priority === 'High' && (
                          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">
                            <AlertTriangle className="w-3 h-3 mr-1" /> HIGH
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm flex items-center ${
                          ticket.status === 'Resolved' || ticket.status === 'Closed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ticket.status === 'In Progress' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {ticket.status === 'Open' && <Clock className="w-3 h-3 mr-1" />}
                          {ticket.status === 'Resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {ticket.status}
                        </span>
                      </div>

                      <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                        <span className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span className="font-medium text-slate-700 mr-1">{ticket.author?.name || 'Unknown'}</span> 
                          <span className="text-slate-400">({ticket.author_id})</span>
                        </span>
                        <span className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                          {ticket.category || 'Pending AI'}
                        </span>
                        <span className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                          {new Date(ticket.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right Side Info */}
                    <div className="flex items-center justify-between sm:justify-end sm:ml-4 gap-4 mt-2 sm:mt-0">
                      {ticket.assigned_to && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                            Assigned: {ticket.assigned_to}
                          </span>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors hidden sm:block" />
                    </div>
                  </li>
                )})}
              </ul>
              
              {Math.ceil(filteredTickets.length / ticketsPerPage) > 1 && (
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                     <span className="text-sm text-slate-500 font-bold tracking-wide uppercase">Page {currentPage} of {Math.ceil(filteredTickets.length / ticketsPerPage)}</span>
                  </span>
                <button
                  disabled={currentPage === Math.ceil(filteredTickets.length / ticketsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

  {/* Floating Notifications */}
  <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
    {notifications.map(notif => (
      <div key={notif.id} className="pointer-events-auto bg-white rounded-2xl p-4 border border-slate-200 shadow-2xl shadow-slate-900/10 flex items-start gap-4 animate-in slide-in-from-right-8 fade-in duration-300 w-80">
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          notif.type === 'new' ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {notif.type === 'new' ? <Bell className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{notif.type === 'new' ? 'New Ticket Alert' : 'New Reply'}</p>
          <p className="text-xs font-semibold text-slate-500 leading-snug">{notif.text}</p>
        </div>
        <button 
          onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
</Layout>
)
}
