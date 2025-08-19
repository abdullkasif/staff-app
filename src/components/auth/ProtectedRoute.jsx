import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/supabase'

export default function ProtectedRoute({ children, allowPublic = false }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        // Not logged in → redirect to login (unless route is public)
        if (!session) {
          if (!allowPublic) navigate('/login')
          setLoading(false)
          return
        }

        // Logged in user
        const userRole = session.user?.user_metadata?.user_role

        // Fetch staff profile
        const { data: profile } = await supabase
          .from('staff_profiles')
          .select('full_name, department')
          .eq('id', session.user.id)
          .single()

        const hasCompleteProfile = profile?.full_name && profile?.department

        if (allowPublic) {
          // If user visits /login or /profile-setup but already has profile → dashboard
          if (hasCompleteProfile) {
            navigate('/dashboard')
          }
          setLoading(false)
          return
        }

        // Protected routes
        if (userRole !== 'staff' && !hasCompleteProfile) {
          navigate('/profile-setup')
          setLoading(false)
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Protected route check failed:', error)
        navigate('/login')
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate, allowPublic])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Checking access...</div>
  }

  return children
}
