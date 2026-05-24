import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'
import type { User } from '../types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setTokens: (access: string, refresh: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (access, refresh) => {
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
      },

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        const { access_token, refresh_token } = data.data.tokens
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true,
        })
        await get().fetchMe()
      },

      register: async (email, password, fullName) => {
        const { data } = await api.post('/auth/register', {
          email,
          password,
          full_name: fullName,
        })
        const { access_token, refresh_token } = data.data.tokens
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          isAuthenticated: true,
        })
        await get().fetchMe()
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          // ignore
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
          })
        }
      },

      fetchMe: async () => {
        const { data } = await api.get('/users/me')
        set({ user: data.data })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)