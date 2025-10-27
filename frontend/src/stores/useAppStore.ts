import { create } from 'zustand'
import { DbType } from '@/types'

interface AppState {
  selectedDbType: DbType
  setSelectedDbType: (dbType: DbType) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  toast: { message: string; type: 'success' | 'error' } | null
  showToast: (message: string, type: 'success' | 'error') => void
  clearToast: () => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedDbType: DbType.MySQL,
  setSelectedDbType: (dbType) => set({ selectedDbType: dbType }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  toast: null,
  showToast: (message, type) => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}))
