import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { Send, Loader2, ChevronLeft, Paperclip, X } from 'lucide-react'

export default function NewTicket() {
  const [books, setBooks] = useState<any[]>([])
  const [bookId, setBookId] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    api.get('/books').then(res => setBooks(res.data))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let attachmentUrl = null

      // Upload file first if one is selected
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        attachmentUrl = uploadRes.data.url
      }

      await api.post('/tickets', {
        book_id: bookId || null,
        subject,
        description,
        attachment_url: attachmentUrl
      })
      navigate('/author/tickets')
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <Layout role="author">
      <div className="p-8 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/author/tickets')}
          className="flex items-center text-slate-500 hover:text-slate-900 font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Tickets
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Submit a Support Query</h1>
        
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Related Book (Optional)</label>
              <select 
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">General / Account Level</option>
                {books.map(b => (
                  <option key={b.book_id} value={b.book_id}>{b.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <input 
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe your issue"
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Description</label>
              <textarea 
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible..."
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Attachment (Optional)</label>
              {file ? (
                <div className="flex items-center justify-between px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl">
                  <div className="flex items-center">
                    <Paperclip className="w-4 h-4 text-brand-600 mr-2" />
                    <span className="text-sm text-brand-700 font-medium">{file.name}</span>
                    <span className="text-xs text-brand-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button type="button" onClick={() => setFile(null)} className="text-brand-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-500">PNG, JPG, PDF (MAX. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-end items-center border-t border-slate-100">
              <button 
                type="button"
                onClick={() => navigate('/author/tickets')}
                className="px-6 py-3 text-slate-500 hover:text-slate-700 font-medium mr-4 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors font-medium disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
