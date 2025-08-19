// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/supabase'
import { LoginForm } from '../components/auth/LoginForm'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/profile-setup`,
        data: {
          user_role: 'staff'
        }
      },
    })

    if (error) {
      console.error('Login error:', error)
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile-setup`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      })

      if (error) {
        console.error('Google login error:', error)
        setMessage(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Google login exception:', error)
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-card p-4">
      <div className="w-full max-w-md">
        <div className="bg-background shadow-lg rounded-lg border border-border">
          <div className="px-8 py-6">
            <LoginForm
              onSubmit={handleMagicLinkLogin}
              onGoogleLogin={handleGoogleLogin}
              onEmailChange={(e) => setEmail(e.target.value)}
              email={email}
              loading={loading}
              message={message}
            />
          </div>
        </div>
      </div>
    </div>
  )
}