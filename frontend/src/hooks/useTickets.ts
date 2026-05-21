import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export function useTickets(pollIntervalMs: number = 0) {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    try {
      const res = await api.get('/tickets/')
      setTickets(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    if (pollIntervalMs > 0) {
      const interval = setInterval(fetchTickets, pollIntervalMs)
      return () => clearInterval(interval)
    }
  }, [fetchTickets, pollIntervalMs])

  return { tickets, loading, refetch: fetchTickets }
}

export function useTicket(id: string | undefined) {
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchTicket = useCallback(async () => {
    if (!id) return
    try {
      const res = await api.get(`/tickets/${id}`)
      setTicket(res.data)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  return { ticket, setTicket, loading, refetch: fetchTicket }
}
