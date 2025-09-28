import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Login
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          }
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          }
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // Remove token from API headers
        delete api.defaults.headers.common['Authorization']
      },

      // Check authentication
      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          // Set token in headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          const response = await api.get('/auth/me')
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          // Token is invalid, logout
          get().logout()
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true })
        try {
          const response = await api.put('/auth/profile', profileData)
          set({
            user: response.data.user,
            isLoading: false
          })
          return { success: true, user: response.data.user }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Profile update failed' 
          }
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        set({ isLoading: true })
        try {
          await api.post('/auth/change-password', passwordData)
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Password change failed' 
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

export { useAuthStore }
export default useAuthStore
