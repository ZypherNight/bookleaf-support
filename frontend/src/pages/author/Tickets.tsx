import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { Plus, Clock, CheckCircle, LifeBuoy, MessageSquare, ShieldCheck, ChevronRight, Inbox, BookOpen } from 'lucide-react'

export default function AuthorTickets() {
  const [tickets, setTickets] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const ticketsPerPage = 5
  const navigate = useNavigate()

  const [toastMessage, setToastMessage] = useState<{ title: string, desc: string } | null>(null)
  const prevTicketsRef = useRef<any[]>([])

  const getUnreadCount = (ticket: any) => {
    if (!ticket.messages || ticket.messages.length === 0) return 0
    const lastReadStr = localStorage.getItem('author_ticket_last_read_' + ticket.id)
    if (!lastReadStr) return ticket.messages.filter((m: any) => m.sender_id.startsWith('ADMIN')).length

    // Parse times carefully for accurate comparison
    const lastReadTime = new Date(lastReadStr).getTime()
    return ticket.messages.filter((m: any) => {
      // Must ensure timezone-safe parsing by appending Z if missing, assuming backend is UTC
      const msgTimeStr = m.created_at.endsWith('Z') ? m.created_at : m.created_at + 'Z'
      const msgTime = new Date(msgTimeStr).getTime()
      return m.sender_id.startsWith('ADMIN') && msgTime > lastReadTime
    }).length
  }

  useEffect(() => {
    const fetchTickets = () => {
      api.get('/tickets').then(res => {
        const newTickets = res.data

        // Check for new notifications
        if (prevTicketsRef.current.length > 0) {
          const currentPrev = prevTicketsRef.current
          newTickets.forEach((newTicket: any) => {
            const oldTicket = currentPrev.find((t: any) => t.id === newTicket.id)
            if (oldTicket) {
              const newMsgs = newTicket.messages?.length || 0
              const oldMsgs = oldTicket.messages?.length || 0
              if (newMsgs > oldMsgs) {
                // Determine if it was sent by ADMIN
                const lastMsg = newTicket.messages[newMsgs - 1]
                if (lastMsg && lastMsg.sender_id.startsWith('ADMIN')) {
                  setToastMessage({
                    title: `New Reply on Ticket #${newTicket.id}`,
                    desc: newTicket.subject
                  })
                  setTimeout(() => setToastMessage(null), 5000)
                }
              }
            } else {
              // Ignore new ticket creation for author since they made it
            }
          })
        }

        prevTicketsRef.current = newTickets
        setTickets(newTickets)
      })
    }
    fetchTickets()
    // Polling every 5 seconds for real-time feel
    const interval = setInterval(fetchTickets, 5000)
    return () => clearInterval(interval)
  }, [])

  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length

  return (
    <Layout role="author">
      {/* Support Hero Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden pb-12 pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2187&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-3xl -mt-48 -mr-48"></div>
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <p className="text-brand-300 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <LifeBuoy className="w-4 h-4 mr-2" /> Author Support Center
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                How can we help you?
              </h1>
              <p className="text-slate-300 mt-3 max-w-xl text-lg leading-relaxed">
                Our publishing experts are here to ensure your journey is smooth.
                Ask a question, report an issue, or request an update.
              </p>
            </div>

            <button
              onClick={() => navigate('/author/tickets/new')}
              className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center shadow-brand-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Open New Ticket
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 translate-y-20">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/20 text-slate-900 flex items-center group overflow-hidden relative">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mr-6 shrink-0 relative z-10">
                <MessageSquare className="w-8 h-8 text-amber-500" />
              </div>
              <div className="relative z-10">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Active Inquiries</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black">{openTickets}</h3>
                  <span className="text-sm font-medium text-amber-600">Pending</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 -mr-4 -mt-4">
                <MessageSquare className="w-48 h-48" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/20 text-slate-900 flex items-center group overflow-hidden relative">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mr-6 shrink-0 relative z-10">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Resolved Issues</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black">{resolvedTickets}</h3>
                  <span className="text-sm font-medium text-emerald-600">Completed</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 -mr-4 -mt-4">
                <ShieldCheck className="w-48 h-48" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-28 pb-16 px-8 max-w-7xl mx-auto bg-slate-50 min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Your Ticket History</h2>

        {tickets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Whenever you need assistance with your books or royalties, our team is ready to help.
            </p>
            <button
              onClick={() => navigate('/author/tickets/new')}
              className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center shadow-brand-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage).map(ticket => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/author/tickets/${ticket.id}`)}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 cursor-pointer group flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center shadow-sm w-max ${ticket.status === 'Resolved' || ticket.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {ticket.status === 'Resolved' || ticket.status === 'Closed' ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <Clock className="w-3.5 h-3.5 mr-1.5" />}
                      {ticket.status}
                    </span>
                    <span className="text-xs font-bold text-slate-400">TICKET #{ticket.id}</span>
                  </div>

                  <h3 className={`text-xl font-bold transition-colors mb-2 line-clamp-1 flex items-center ${getUnreadCount(ticket) > 0 ? 'text-brand-700' : 'text-slate-900 group-hover:text-brand-600'}`}>
                    {ticket.subject}
                    {getUnreadCount(ticket) > 0 && (
                      <span className="ml-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm shadow-red-500/20">
                        {getUnreadCount(ticket)} New
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-500 line-clamp-2 text-sm leading-relaxed mb-4">{ticket.description}</p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-400">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    {ticket.category && (
                      <span className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                        {ticket.category}
                      </span>
                    )}
                    {ticket.book_title && (
                      <span className="flex items-center text-brand-600">
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                        {ticket.book_title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Latest Response Block */}
                {ticket.messages && ticket.messages.length > 0 && (
                  <div className="w-full md:w-72 lg:w-96 shrink-0 bg-slate-50 rounded-2xl p-5 border border-slate-100 relative">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Latest Reply
                    </p>
                    <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                      {ticket.messages[ticket.messages.length - 1].message}
                    </p>
                  </div>
                )}

                <div className="hidden md:flex shrink-0 w-12 h-12 bg-slate-50 rounded-full items-center justify-center group-hover:bg-brand-50 transition-colors border border-slate-100 group-hover:border-brand-200">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />
                </div>
              </div>
            ))}

            {/* Pagination */}
            {Math.ceil(tickets.length / ticketsPerPage) > 1 && (
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500 font-bold tracking-wide uppercase">
                  Page {currentPage} of {Math.ceil(tickets.length / ticketsPerPage)}
                </span>
                <button
                  disabled={currentPage === Math.ceil(tickets.length / ticketsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-sm border border-slate-700">
          <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center shrink-0 border border-brand-500/30">
            <MessageSquare className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1 pr-2">
            <p className="text-sm font-bold mb-0.5">{toastMessage.title}</p>
            <p className="text-xs text-slate-400 line-clamp-2">{toastMessage.desc}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
            &times;
          </button>
        </div>
      )}
    </Layout>
  )
}
