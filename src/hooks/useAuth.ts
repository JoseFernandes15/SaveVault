import { useEffect, useState } from 'react'

const API_BASE = "https://save-vault.zepedrofernandessampaio.workers.dev";

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch(`${API_BASE}/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        if (data.valid) setUser(data.user)
        else localStorage.removeItem('token')
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
