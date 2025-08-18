// src/App.jsx
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase/supabase'
import { Toaster } from 'sonner'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import CreateQuiz from './pages/CreateQuiz'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('📍 App useEffect running')
    
    let mounted = true

    const initializeApp = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        setSession(currentSession)
        setLoading(false)
      } catch (error) {
        console.error('App initialization error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('📍 Auth state changed:', event)
        
        setSession(session)
        
        if (event === 'SIGNED_OUT') {
          navigate('/login')
        }
      }
    )

    initializeApp()

    // Cleanup function
    return () => {
      console.log('📍 Cleaning up auth subscription')
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route 
          path="/login" 
          element={
            <ProtectedRoute allowPublic={true}>
              <Login />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile-setup" 
          element={
            <ProtectedRoute allowPublic={true}>
              <ProfileSetup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-quiz" 
          element={
            <ProtectedRoute>
              <CreateQuiz />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  )
}

export default App