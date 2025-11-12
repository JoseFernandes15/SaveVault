import { useState, useEffect } from 'react'
import { Game, GameSave } from '@/types'
import { toast } from '@/hooks/use-toast'

const STORAGE_KEY = 'games_data'
const API_BASE = "https://save-vault.zepedrofernandessampaio.workers.dev";

export const useGames = () => {
  const [games, setGames] = useState<Game[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')

  // Helper de requisições autenticadas
  async function api(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  // Sync localStorage sempre que games mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
  }, [games])

  // Normalize games coming from API to ensure expected shape
  function normalizeGames(data: any[]): Game[] {
    return data.map(g => {
      // parse/cuidar se g.saves vier como string JSON ou já como array
      let saves: any[] = []
      try {
        saves = Array.isArray(g.saves) ? g.saves : JSON.parse(g.saves || '[]')
      } catch {
        saves = []
      }

      // filtra entradas nulas/inválidas (evita saves com apenas uploadedAt, undefined id, etc.)
      saves = saves.filter(s => s && (s.id != null || s.fileData || s.fileName || s.name))

      return {
        id: String(g.id),
        name: g.name,
        coverImage: g.coverUrl ? `https://${g.coverUrl}` : '',
        saves,
        createdAt: g.createdAt ?? new Date().toISOString(),
      }
    })
  }

  // Buscar lista do backend ao iniciar
  useEffect(() => {
    if (!token) return
    setLoading(true)
    api('/api/games')
      .then(data => setGames(normalizeGames(data)))
      .catch(err => console.error('Erro ao buscar jogos:', err))
      .finally(() => setLoading(false))
  }, [token])

  // CRUD
  const addGame = async (name: string, coverImage: string) => {
    try {
      const res = await api('/api/games', {
        method: 'POST',
        body: JSON.stringify({ name, coverImage }),
      })
      if (res.success) {
        const updated = await api('/api/games')
        setGames(normalizeGames(updated))
        toast({ title: 'Game added successfully!' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error adding game' })
    }
  }

  const updateGame = async (id: string, name: string, coverImage: string) => {
    try {
      const res = await api(`/api/games/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, coverImage }),
      })
      if (res.success) {
        const updated = await api('/api/games')
        setGames(normalizeGames(updated))
        toast({ title: 'Game updated successfully!' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error updating game' })
    }
  }

  const deleteGame = async (id: string) => {
    try {
      const res = await api(`/api/games/${id}`, { method: 'DELETE' })
      if (res.success) {
        setGames(prev => prev.filter(g => g.id !== id))
        toast({ title: 'Game deleted successfully!' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error deleting game' })
    }
  }

  const addSave = async (gameId: string, save: Omit<GameSave, 'id' | 'uploadedAt'>) => {
    try {
      const res = await api(`/api/games/${gameId}/saves`, {
        method: 'POST',
        body: JSON.stringify(save),
      })
      if (res.success) {
        const updated = await api('/api/games')
        setGames(normalizeGames(updated))
        toast({ title: 'Save added successfully!' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error adding save' })
    }
  }

  const updateSave = async (gameId: string, saveId: string, updates: Partial<GameSave>) => {
    try {
      const res = await api(`/api/saves/${saveId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
      if (res.success) {
        const updated = await api('/api/games')
        setGames(normalizeGames(updated))
        toast({ title: 'Save updated successfully!' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error updating save' })
    }
  }

  const deleteSave = async (gameId: string, saveId: string) => {
    try {
      const res = await api(`/api/saves/${saveId}`, { method: 'DELETE' })
      if (res.success) {
        const updated = await api('/api/games')
        setGames(normalizeGames(updated))
        toast({ title: 'Save deleted successfully!' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Error deleting save' })
    }
  }

  return {
    games,
    loading,
    addGame,
    updateGame,
    deleteGame,
    addSave,
    updateSave,
    deleteSave,
  }
}
