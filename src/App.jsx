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
    let mounted = true

    const initializeApp = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(currentSession)
      } catch (error) {
        console.error('App initialization error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (!session) navigate('/login')
      }
    )

    initializeApp()

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [navigate])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<ProtectedRoute allowPublic>{<Login />}</ProtectedRoute>} />
        <Route path="/profile-setup" element={<ProtectedRoute allowPublic>{<ProfileSetup />}</ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute>{<Dashboard />}</ProtectedRoute>} />
        <Route path="/create-quiz" element={<ProtectedRoute>{<CreateQuiz />}</ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute>{<Dashboard />}</ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
