import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import QRScanPage from './pages/QRScanPage'
import BatchDetailsPage from './pages/BatchDetailsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/scan" element={
              <ProtectedRoute>
                <QRScanPage />
              </ProtectedRoute>
            } />
            
            <Route path="/batch/:batchId" element={
              <ProtectedRoute>
                <BatchDetailsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App


