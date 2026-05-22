import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import AuthorDashboard from '@/pages/author/Dashboard'
import AuthorTickets from '@/pages/author/Tickets'
import AuthorTicketDetail from '@/pages/author/TicketDetail'
import NewTicket from '@/pages/author/NewTicket'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminTicketDetail from '@/pages/admin/TicketDetail'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Author Routes */}
        <Route path="/author" element={<ProtectedRoute><AuthorDashboard /></ProtectedRoute>} />
        <Route path="/author/tickets" element={<ProtectedRoute><AuthorTickets /></ProtectedRoute>} />
        <Route path="/author/tickets/new" element={<ProtectedRoute><NewTicket /></ProtectedRoute>} />
        <Route path="/author/tickets/:id" element={<ProtectedRoute><AuthorTicketDetail /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tickets/:id" element={<ProtectedRoute><AdminTicketDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
