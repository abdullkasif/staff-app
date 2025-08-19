// src/pages/ProfileSetup.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from '../lib/utils'
import { toast } from 'sonner'

const DEPARTMENTS = [
  'Computer Science (Aided)',
  'Computer Science (Self-Finance)',
  'Information Technology',
  'Computer Application'
]

export default function ProfileSetup() {
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Prefill existing data if available
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('full_name, department')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (profile.full_name) setFullName(profile.full_name)
        if (profile.department) setDepartment(profile.department)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
  }

  fetchProfile()
}, [navigate])
  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!department) {
      setError('Department selection is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const {  data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not found. Please log in again.')
        navigate('/login')
        return
      }

      // Insert or update staff profile
      const { error: upsertError } = await supabase
        .from('staff_profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          department: department.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (upsertError) throw upsertError

      // For Google users, update user metadata
      const userRole = user?.user_metadata?.user_role;
      if (!userRole) {
        await supabase.auth.updateUser({
          data: {
            user_role: 'staff'
          }
        })
      }

      toast.success('Profile updated successfully!')
      navigate('/dashboard')
    } catch (err) {
      console.error('Staff profile update error:', err)
      setError(err.message || 'Failed to update profile')
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-card p-4">
      <div className="w-full max-w-md">
        <div className="bg-background shadow-lg rounded-lg border border-border">
          <div className="px-8 py-6">
            <div className={cn("flex flex-col gap-6")}>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <GalleryVerticalEnd className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
                    <p className="text-sm text-muted-foreground">
                      Help us personalize your experience
                    </p>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="py-5"
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="department">Department</Label>
                      <Select value={department} onValueChange={setDepartment} required>
                        <SelectTrigger className="py-5">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full py-5" 
                      disabled={loading || !fullName.trim() || !department}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Continue to Dashboard'
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="text-center text-xs text-balance text-muted-foreground">
                Make sure to provide accurate information as it will be used for official purposes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}