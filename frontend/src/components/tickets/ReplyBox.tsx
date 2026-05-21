import { useState } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'

interface ReplyBoxProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
  loading?: boolean
  isAdmin?: boolean
  value?: string
  onChange?: (val: string) => void
}

export default function ReplyBox({ onSend, disabled, loading, isAdmin, value, onChange }: ReplyBoxProps) {
  const [internalReplyText, setInternalReplyText] = useState('')

  const replyText = value !== undefined ? value : internalReplyText
  const setReplyText = (val: string) => {
    if (onChange) onChange(val)
    setInternalReplyText(val)
  }

  const handleSend = async () => {
    if (!replyText.trim() || disabled) return
    await onSend(replyText)
    setReplyText('')
  }

  if (isAdmin) {
    return (
      <div className="pt-4 border-t border-slate-100 shrink-0 mt-2">
        <div className="bg-white border border-slate-200 p-2 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-300 transition-all">
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply to the author here..."
            className="w-full bg-transparent px-4 py-3 outline-none resize-none text-slate-700 min-h-[60px]"
          />
          <div className="flex justify-between items-center mt-2 px-2 pb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Internal Reply
            </span>
            <button 
              onClick={handleSend}
              disabled={!replyText.trim() || loading || disabled}
              className="bg-brand-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send Reply
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 bg-white border-t border-slate-100 shrink-0">
      <div className="bg-white border border-slate-200 p-2 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-300 transition-all">
        <textarea
          className="w-full bg-transparent px-4 py-3 outline-none resize-none text-slate-700 min-h-[60px]"
          placeholder="Type your reply here..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
        />
        <div className="flex justify-between items-center px-4 pb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <MessageSquare className="w-4 h-4 mr-1.5" /> Secure Messaging
          </span>
          <button 
            onClick={handleSend}
            disabled={!replyText.trim() || loading || disabled}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md shadow-brand-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Send Reply
          </button>
        </div>
      </div>
    </div>
  )
}
