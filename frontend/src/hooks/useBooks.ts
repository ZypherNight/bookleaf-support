import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export function useBooks() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBooks = useCallback(async () => {
    try {
      const res = await api.get('/books')
      setBooks(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return { books, loading, refetch: fetchBooks }
}
