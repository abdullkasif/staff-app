// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/supabase'
import { LoginForm } from '../components/auth/LoginForm' // Adjust path if needed

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
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
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