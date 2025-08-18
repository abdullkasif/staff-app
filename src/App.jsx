// src/App.jsx
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const checkProfileAndRedirect = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, department')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile check error:', error)
        navigate('/profile-setup')
        return
      }

      if (!profile?.full_name || !profile?.department) {
        navigate('/profile-setup')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Profile check failed:', error)
      navigate('/profile-setup')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session) {
        await checkProfileAndRedirect(session.user.id)
      } else {
        navigate('/login')
      }
      
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        
        if (session) {
          checkProfileAndRedirect(session.user.id)
        } else {
          navigate('/login')
        }
      }
    )

    checkAuth()

    return () => {
      subscription?.unsubscribe()
    }
  }, [navigate])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<div>Redirecting...</div>} />
    </Routes>
  )
}

export default App