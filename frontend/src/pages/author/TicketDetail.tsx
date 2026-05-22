import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { useTicket } from '@/hooks/useTickets'
import { api } from '@/lib/api'
import { ChevronLeft, Loader2, Clock, CheckCircle, BookOpen } from 'lucide-react'
import ChatThread from '@/components/tickets/ChatThread'
import ReplyBox from '@/components/tickets/ReplyBox'

export default function AuthorTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ticket, loading: ticketLoading, refetch } = useTicket(id)
  const [loading, setLoading] = useState(false)
  const [authorName, setAuthorName] = useState('Author')

  useEffect(() => {
    // Update read status for author
    if (id && ticket?.messages) {
      localStorage.setItem('author_ticket_last_read_' + id, new Date().toISOString())
    }
  }, [id, ticket?.messages])

  useEffect(() => {
    api.get('/users/me').then(res => {
      if (res.data && res.data.name) setAuthorName(res.data.name)
    })
  }, [])

  const handleSendReply = async (message: string) => {
    setLoading(true)
    try {
      await api.post(`/tickets/${id}/messages`, { message })
      await refetch()
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  if (ticketLoading || !ticket) return (
    <Layout role="author">
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    </Layout>
  )

  const isClosed = ticket.status === 'Closed'

  return (
    <Layout role="author">
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/author/tickets')}
          className="flex items-center text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors mb-6 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-max"
        >
          <ChevronLeft className="w-4 h-4 mr-1.5" />
          Back to Support Center
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col h-[85vh]">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center shadow-sm w-max ${
                    ticket.status === 'Resolved' || ticket.status === 'Closed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {ticket.status === 'Resolved' || ticket.status === 'Closed' ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <Clock className="w-3.5 h-3.5 mr-1.5" />}
                    {ticket.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 tracking-wider">TICKET #{ticket.id}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                  {ticket.subject}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                Created {new Date(ticket.created_at).toLocaleDateString()}
              </span>
              {ticket.book_title && (
                <span className="flex items-center text-brand-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {ticket.book_title}
                </span>
              )}
            </div>
          </div>

          {/* Conversation Thread */}
          <ChatThread 
            description={ticket.description}
            created_at={ticket.created_at}
            messages={ticket.messages}
            authorName={authorName}
            getInitials={getInitials}
            attachment_url={ticket.attachment_url}
          />

          {/* Reply Box */}
          {!isClosed && (
            <ReplyBox 
              onSend={handleSendReply}
              loading={loading}
              isAdmin={false}
            />
          )}

          {isClosed && (
            <div className="p-5 bg-white border-t border-slate-100 shrink-0">
              <div className="bg-slate-100/50 border border-slate-200 rounded-3xl p-6 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-50" />
                <h3 className="font-bold text-slate-700 mb-1">This ticket is closed.</h3>
                <p className="text-slate-500 text-sm">If you need further assistance, please open a new ticket.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
