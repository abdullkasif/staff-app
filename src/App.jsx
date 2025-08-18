// src/App.jsx
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase/supabase'
import { Toaster } from 'sonner'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import CreateQuiz from './pages/CreateQuiz'

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
        // Only navigate to dashboard if we're not already on a protected route
        const currentPath = window.location.pathname
        if (currentPath === '/' || currentPath === '/login') {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Profile check failed:', error)
      navigate('/profile-setup')
    }
  }

  useEffect(() => {
    console.log('📍 App useEffect running')
    
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

    // Set up auth listener - only once
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('📍 Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        
        if (event === 'SIGNED_IN') {
          if (session) {
            checkProfileAndRedirect(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/login')
        }
        // Ignore INITIAL_SESSION and TOKEN_REFRESHED for navigation
      }
    )

    checkAuth()

    // Cleanup function - important!
    return () => {
      console.log('📍 Cleaning up auth subscription')
      subscription?.unsubscribe()
    }
  }, [navigate]) // Add navigate to dependencies

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/" element={<div>Redirecting...</div>} />
      </Routes>
    </>
  )
}

export default App