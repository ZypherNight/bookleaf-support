import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import { api } from '@/lib/api'
import { BookOpen, TrendingUp, IndianRupee, ShoppingBag, Award, Clock, Store, BookText, ChevronRight } from 'lucide-react'

export default function AuthorDashboard() {
  const [books, setBooks] = useState<any[]>([])
  const [authorName, setAuthorName] = useState('')
  
  useEffect(() => {
    api.get('/books').then(res => setBooks(res.data))
    api.get('/users/me').then(res => {
      if (res.data && res.data.name) {
        setAuthorName(res.data.name.split(' ')[0])
      }
    }).catch(() => {})
  }, [])

  const totalEarnings = books.reduce((sum, book) => sum + (book.total_royalty_earned || 0), 0)
  const totalCopies = books.reduce((sum, book) => sum + (book.total_copies_sold || 0), 0)
  const totalPending = books.reduce((sum, book) => sum + (book.royalty_pending || 0), 0)

  return (
    <Layout role="author">
      {/* Hero Header Section */}
      <div className="relative bg-slate-900 text-white pb-12 pt-16">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl -mt-24 -mr-24"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <p className="text-brand-300 font-bold tracking-wider uppercase text-sm mb-2 flex items-center">
                <Award className="w-4 h-4 mr-2" /> Author Portal
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome back, {authorName || 'Author'}!
              </h1>
              <p className="text-slate-300 mt-3 max-w-xl text-lg">
                Track your publishing journey, monitor sales, and watch your royalties grow all in one place.
              </p>
            </div>
            
            <button className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center shadow-brand-500/30">
              <BookOpen className="w-5 h-5 mr-2" />
              Publish New Book
            </button>
          </div>

          {/* Aggregate Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 translate-y-20">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/20 text-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <BookText className="w-24 h-24" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Total Published</p>
              <h3 className="text-4xl font-black mb-1">{books.length}</h3>
              <p className="text-sm font-medium text-brand-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" /> Lifetime Books
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/20 text-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <ShoppingBag className="w-24 h-24" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Global Sales</p>
              <h3 className="text-4xl font-black mb-1">{totalCopies.toLocaleString()}</h3>
              <p className="text-sm font-medium text-emerald-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" /> Total Copies Sold
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/20 text-slate-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <IndianRupee className="w-24 h-24" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Total Earnings</p>
              <h3 className="text-4xl font-black mb-1 text-slate-900">₹{totalEarnings.toLocaleString()}</h3>
              <div className="flex items-center text-sm font-medium justify-between pr-8">
                <span className="text-emerald-600">Paid: ₹{(totalEarnings - totalPending).toLocaleString()}</span>
                <span className="text-amber-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> Pending: ₹{totalPending.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-28 pb-16 px-8 max-w-7xl mx-auto bg-slate-50 min-h-[50vh]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Portfolio</h2>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {books.map(book => (
            <div key={book.book_id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 overflow-hidden flex flex-col group">
              
              {/* Fake Book Cover / Header Banner */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest w-max mb-6">
                    {book.genre}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-snug mt-auto mb-2 drop-shadow-md">
                    {book.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-300">{authorName} Author</p>
                </div>
              </div>

              {/* Book Details */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-white relative">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-mono mb-1">ISBN: {book.isbn}</p>
                      {book.publication_date && (
                        <p className="text-xs font-semibold text-slate-500">Published {new Date(book.publication_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm shrink-0 ${
                      book.status.includes('Live') 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Copies Sold</p>
                      <p className="text-xl font-black text-slate-800">{book.total_copies_sold}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">MRP</p>
                      <p className="text-xl font-black text-slate-800">₹{book.mrp || '—'}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-3">Royalty Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Total Earned</span>
                        <span className="font-bold text-emerald-700">₹{book.total_royalty_earned}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">Paid Out</span>
                        <span className="font-bold text-slate-700">₹{book.royalty_paid}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-emerald-200/50">
                        <span className="text-amber-600 font-bold">Pending Payment</span>
                        <span className="font-black text-amber-600">₹{book.royalty_pending}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-xs font-semibold text-slate-500">
                    <Store className="w-4 h-4 mr-2 text-brand-500" />
                    {book.available_on ? (
                      <span className="truncate max-w-[150px] sm:max-w-xs">{book.available_on}</span>
                    ) : 'Distribution Pending'}
                  </div>
                  <button className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center transition-colors">
                    Manage <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {books.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-slate-200 border-dashed">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No books published yet</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Your author journey starts here. Publish your first book and watch your royalties roll in.
              </p>
              <button className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center shadow-brand-500/30">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Your Journey
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
