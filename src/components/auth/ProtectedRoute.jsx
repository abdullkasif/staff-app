// src/components/auth/ProtectedRoute.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/supabase'

export default function ProtectedRoute({ children, allowPublic = false }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Always check session first
        const { data: { session } } = await supabase.auth.getSession()
        
        // If this is a public route (like Login), handle accordingly
        if (allowPublic) {
          // If user is already logged in and tries to access login page, redirect to dashboard
          if (session) {
            // Check if they have a complete profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('full_name, department')
              .eq('id', session.user.id)
              .single()

            if (!error && profile?.full_name && profile?.department) {
              // Profile is complete, redirect to dashboard
              navigate('/dashboard')
              return
            }
            // If profile incomplete, let them stay on the route to be redirected by profile check
          }
          setLoading(false)
          return
        }

        // Regular protected route logic
        // If no session, redirect to login immediately
        if (!session) {
          navigate('/login')
          return
        }

        // If session exists, check profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, department')
          .eq('id', session.user.id)
          .single()

        // Handle profile check results
        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist
            navigate('/profile-setup')
          } else {
            // Other profile error
            console.error('Profile error:', error)
            navigate('/profile-setup')
          }
          return
        }

        // Profile exists, check if complete
        if (!profile?.full_name || !profile?.department) {
          navigate('/profile-setup')
          return
        }

        // All checks passed
        setLoading(false)
      } catch (error) {
        console.error('Protected route check failed:', error)
        navigate('/login')
      }
    }

    checkAuth()
  }, [navigate, allowPublic])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Checking access...</div>
  }

  return children
}