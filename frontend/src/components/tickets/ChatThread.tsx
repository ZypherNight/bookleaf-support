import { useRef, useEffect, useState } from 'react'
import { ShieldCheck, Paperclip } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'

interface Message {
  id: number
  sender_id: string
  message: string
  created_at: string
}

interface ChatThreadProps {
  description: string
  created_at: string
  messages: Message[]
  authorName: string
  getInitials: (name: string) => string
  attachment_url?: string | null
}

export default function ChatThread({ description, created_at, messages, authorName, getInitials, attachment_url }: ChatThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showAttachment, setShowAttachment] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }, [messages])

  return (
    <div className="p-8 bg-slate-50/30 flex-1 overflow-y-auto">
      <div className="space-y-8">
        {/* Initial Ticket Description */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 border border-brand-200 flex items-center justify-center shrink-0 shadow-sm">
            <span className="font-black text-brand-700 text-lg">{getInitials(authorName)}</span>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-3xl rounded-tl-sm p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-slate-900">{authorName}</span>
              <span className="text-xs font-semibold text-slate-400">{new Date(created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {description}
            </p>

            {attachment_url && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowAttachment(!showAttachment)}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${showAttachment
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100'
                    }`}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  {showAttachment ? 'Hide Attachment' : 'View Attachment'}
                </button>

                {showAttachment && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    {attachment_url.match(/\.(jpg|jpeg|png)$/i) ? (
                      <img
                        src={`${BACKEND_URL}${attachment_url}`}
                        alt="Ticket attachment"
                        className="max-w-full rounded-2xl border border-slate-200 shadow-md"
                      />
                    ) : attachment_url.match(/\.pdf$/i) ? (
                      <embed
                        src={`${BACKEND_URL}${attachment_url}`}
                        type="application/pdf"
                        className="w-full h-[600px] rounded-2xl border border-slate-200 shadow-md"
                      />
                    ) : (
                      <a href={`${BACKEND_URL}${attachment_url}`} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-sm font-semibold">
                        Download Attachment
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {messages?.map((msg) => {
          const isAdmin = msg.sender_id.startsWith('ADMIN')
          return (
            <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${
                isAdmin 
                  ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-gradient-to-br from-brand-100 to-brand-50 border-brand-200 text-brand-700'
              }`}>
                {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <span className="font-black text-lg">{getInitials(authorName)}</span>}
              </div>
              <div className={`flex-1 border rounded-3xl p-6 shadow-sm ${
                isAdmin 
                  ? 'bg-emerald-50/50 border-emerald-100 rounded-tr-sm' 
                  : 'bg-white border-slate-200 rounded-tl-sm'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`font-bold ${isAdmin ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {isAdmin ? 'BookLeaf Support' : authorName}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className={`whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-emerald-800' : 'text-slate-700'}`}>
                  {msg.message}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>
    </div>
  )
}
