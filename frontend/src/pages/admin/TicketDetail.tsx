import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { Bot, ChevronLeft, Loader2, Save, CheckCircle, Paperclip, UserCheck, ShieldAlert, AlertTriangle, User, Clock, FileText, UserMinus, Search, ChevronDown } from 'lucide-react'
import { useTicket } from '@/hooks/useTickets'
import ReplyBox from '@/components/tickets/ReplyBox'

export default function AdminTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [saved, setSaved] = useState(false)
  const [showAttachment, setShowAttachment] = useState(false)
  const [assignedTo, setAssignedTo] = useState('')
  const [admins, setAdmins] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')

  const { ticket, refetch: refetchTicket } = useTicket(id)

  useEffect(() => {
    if (ticket) {
      setDraft(ticket.ai_draft_response || '')
      setInternalNotes(ticket.internal_notes || '')
      setStatus(ticket.status)
      setCategory(ticket.category || '')
      setPriority(ticket.priority || '')
      setAssignedTo(ticket.assigned_to || '')
    }
  }, [ticket])

  useEffect(() => {
    // Fetch admins for assignment dropdown
    api.get('/users/admins').then(res => {
      setAdmins(res.data)
    })

    // Get current user to know who "me" is
    api.get('/users/me').then(res => {
      setCurrentUserId(res.data.id)
    })
  }, [])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  const handleUpdate = async () => {
    await api.put(`/tickets/${id}`, {
      status,
      internal_notes: internalNotes,
      ai_draft_response: draft,
      category,
      priority
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSendReply = async (messageToSend?: string) => {
    const message = messageToSend || replyText || draft
    if (!message) return
    setIsSending(true)
    await api.post(`/tickets/${id}/messages`, { message })
    await api.put(`/tickets/${id}`, { status: 'In Progress' })
    await refetchTicket()
    setReplyText('')
    setIsSending(false)
  }

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  if (!ticket) return null

  return (
    <Layout role="admin">
      <div className="p-8 max-w-7xl mx-auto flex gap-8">

        {/* Left Col - Ticket info and thread */}
        <div className="flex-1 flex flex-col space-y-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors w-max bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Back to Queue
          </button>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col h-[85vh]">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100 shrink-0">
              <div className="flex items-start gap-5">
                <div className="hidden sm:flex shrink-0 w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-50 rounded-full border border-brand-200 items-center justify-center text-brand-700 font-bold text-xl shadow-sm">
                  {getInitials(ticket.author?.name)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{ticket.subject}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1.5 text-slate-400" />
                      <span className="font-semibold text-slate-700 mr-1">{ticket.author?.name || 'Unknown'}</span>
                      <span className="text-slate-400">({ticket.author_id})</span>
                    </span>
                    <span className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                      Ticket #{ticket.id}
                    </span>
                    <span className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600">{ticket.category || 'Pending AI'}</span>
                    </span>
                    {assignedTo && (
                      <span className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md text-xs font-bold">Assigned: {assignedTo}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm shrink-0 ${ticket.status === 'Resolved' || ticket.status === 'Closed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : ticket.status === 'In Progress'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                {status}
              </span>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-4 space-y-10">
              {/* Original Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> Original Request
              </h3>
              <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                {ticket.description}
              </div>
            </div>

            {ticket.attachment_url && (
              <div className="mb-10">
                <button
                  onClick={() => setShowAttachment(!showAttachment)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${showAttachment
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100'
                    }`}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  {showAttachment ? 'Hide Attachment' : 'View Attachment'}
                </button>

                {showAttachment && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    {ticket.attachment_url.match(/\.(jpg|jpeg|png)$/i) ? (
                      <img
                        src={`http://localhost:8001${ticket.attachment_url}`}
                        alt="Ticket attachment"
                        className="max-w-full rounded-2xl border border-slate-200 shadow-md"
                      />
                    ) : ticket.attachment_url.match(/\.pdf$/i) ? (
                      <embed
                        src={`http://localhost:8001${ticket.attachment_url}`}
                        type="application/pdf"
                        className="w-full h-[600px] rounded-2xl border border-slate-200 shadow-md"
                      />
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Thread */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> Conversation History
              </h3>
              <div className="space-y-6">
                {ticket.messages?.map((msg: any) => {
                  const isAdmin = msg.sender_id.startsWith('ADMIN')
                  return (
                    <div key={msg.id} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-4 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm mt-auto mb-5 ${isAdmin ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                          {isAdmin ? 'AD' : getInitials(ticket.author?.name)}
                        </div>
                        <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-2xl shadow-sm ${isAdmin
                              ? 'bg-brand-600 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.message}</p>
                          </div>
                          <span className="text-xs font-medium text-slate-400 mt-2 px-1">
                            {isAdmin ? 'Admin' : ticket.author?.name} • {new Date(msg.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} className="h-2" />
              </div>
              </div>
            </div>

            {/* Quick Reply Box */}
            {ticket.status !== 'Closed' && ticket.status !== 'Resolved' ? (
              <ReplyBox 
                onSend={async (msg) => {
                  await handleSendReply(msg)
                }}
                loading={isSending}
                isAdmin={true}
                value={replyText}
                onChange={setReplyText}
              />
            ) : (
              <div className="pt-4 border-t border-slate-100 shrink-0 mt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <h3 className="font-bold text-slate-600 mb-1">Ticket Closed</h3>
                  <p className="text-slate-500 text-sm">You cannot reply to a closed or resolved ticket.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Col - AI Assistant & Meta */}
        <div className="w-96 space-y-6 shrink-0 h-[85vh] overflow-y-auto pr-2 pb-10">

          {/* AI Assistant Card */}
          <div className="bg-gradient-to-b from-brand-50 to-white rounded-3xl p-7 border border-brand-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center mb-6 text-brand-700 relative z-10">
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mr-3 border border-brand-100">
                <Bot className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">AI Assistant</h3>
              </div>
            </div>

            {ticket.priority && (
              <div className="mb-6 bg-white p-4 rounded-2xl border border-brand-100 shadow-sm relative z-10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Priority Analysis</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${ticket.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                    ticket.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                  {ticket.priority === 'Critical' && <ShieldAlert className="w-3 h-3 mr-1.5" />}
                  {ticket.priority === 'High' && <AlertTriangle className="w-3 h-3 mr-1.5" />}
                  {ticket.priority} Score
                </span>
              </div>
            )}

            <div className="relative z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Smart Response Draft</span>
              {!draft ? (
                <button
                  onClick={async () => {
                    setIsGeneratingDraft(true)
                    try {
                      const res = await api.post(`/tickets/${id}/draft`)
                      setDraft(res.data.draft_response)
                    } finally {
                      setIsGeneratingDraft(false)
                    }
                  }}
                  disabled={isGeneratingDraft}
                  className="w-full py-4 text-sm font-bold text-brand-700 bg-white border-2 border-brand-200 border-dashed rounded-2xl hover:bg-brand-50 transition-all flex items-center justify-center shadow-sm"
                >
                  {isGeneratingDraft ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bot className="w-5 h-5 mr-2" />}
                  {isGeneratingDraft ? 'Analyzing Ticket...' : 'Generate AI Draft'}
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="w-full text-sm p-4 bg-white rounded-2xl border border-brand-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none shadow-inner leading-relaxed"
                  />
                  <button
                    onClick={async () => {
                      setReplyText(draft)
                      setDraft('')
                      await api.put(`/tickets/${id}`, { ai_draft_response: '' })
                    }}
                    className="w-full py-3 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-50 transition-colors shadow-sm flex justify-center items-center"
                  >
                    Use This Draft
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Management Card */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-6 tracking-tight border-b border-slate-100 pb-4">Ticket Settings</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category (Override)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="Royalty & Payments">Royalty & Payments</option>
                  <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
                  <option value="Printing & Quality">Printing & Quality</option>
                  <option value="Distribution & Availability">Distribution</option>
                  <option value="Book Status & Production Updates">Production Updates</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority (Override)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full text-sm font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned To</label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsAssignOpen(!isAssignOpen)}
                      className="w-full flex items-center justify-between text-sm font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer text-slate-700"
                    >
                      <span className="truncate">
                        {assignedTo
                          ? admins.find(a => a.id === assignedTo)?.name || assignedTo
                          : '-- Unassigned --'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {isAssignOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50">
                          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search admin name..."
                            value={assignSearch}
                            onChange={(e) => setAssignSearch(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none text-slate-700"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                          <button
                            type="button"
                            onClick={async () => {
                              setAssignedTo('')
                              setIsAssignOpen(false)
                              setAssignSearch('')
                              await api.put(`/tickets/${id}`, { assigned_to: null })
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors truncate"
                          >
                            -- Unassigned --
                          </button>
                          {admins
                            .filter(a => a.name.toLowerCase().includes(assignSearch.toLowerCase()) || a.id.toLowerCase().includes(assignSearch.toLowerCase()))
                            .map(admin => (
                              <button
                                key={admin.id}
                                type="button"
                                onClick={async () => {
                                  setAssignedTo(admin.id)
                                  setIsAssignOpen(false)
                                  setAssignSearch('')
                                  await api.put(`/tickets/${id}`, { assigned_to: admin.id })
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors truncate flex items-center justify-between"
                              >
                                <span>{admin.name}</span>
                                <span className="text-xs text-slate-400">{admin.id}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {assignedTo === currentUserId ? (
                    <button
                      onClick={async () => {
                        setAssignedTo('')
                        await api.put(`/tickets/${id}`, { assigned_to: null })
                      }}
                      className="flex items-center px-4 py-3 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors whitespace-nowrap shadow-sm shrink-0"
                    >
                      <UserMinus className="w-4 h-4 mr-1.5 text-slate-500" />
                      Unassign
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setAssignedTo(currentUserId)
                        await api.put(`/tickets/${id}`, { assigned_to: currentUserId })
                      }}
                      className="flex items-center px-4 py-3 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors whitespace-nowrap shadow-sm shrink-0"
                    >
                      <UserCheck className="w-4 h-4 mr-1.5" />
                      Assign to Me
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Notes</label>
                <textarea
                  rows={4}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Private notes (authors cannot see this)..."
                  className="w-full text-sm p-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none placeholder-amber-700/30"
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={saved}
                className={`w-full flex justify-center items-center py-3.5 text-sm font-bold rounded-xl transition-all shadow-sm ${saved
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-brand-600'
                  }`}
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Settings Saved
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2 text-slate-400" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
