import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import AuthorDashboard from '@/pages/author/Dashboard'
import AuthorTickets from '@/pages/author/Tickets'
import AuthorTicketDetail from '@/pages/author/TicketDetail'
import NewTicket from '@/pages/author/NewTicket'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminTicketDetail from '@/pages/admin/TicketDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Author Routes */}
        <Route path="/author" element={<AuthorDashboard />} />
        <Route path="/author/tickets" element={<AuthorTickets />} />
        <Route path="/author/tickets/new" element={<NewTicket />} />
        <Route path="/author/tickets/:id" element={<AuthorTicketDetail />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
