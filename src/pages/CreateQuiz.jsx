// src/pages/CreateQuiz.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/supabase'
import { QuizBuilder } from '../components/quiz/QuizBuilder'
import { toast } from 'sonner'

const LOCAL_STORAGE_KEY = 'quiz_builder_draft'

export default function CreateQuiz() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const saveAttempted = useRef(false) // Prevent duplicate saves

  const handleSave = async (quizData) => {
    // Prevent duplicate calls
    if (isSaving || saveAttempted.current) {
      console.log('📍 CreateQuiz: Save already in progress or completed')
      return
    }
    
    saveAttempted.current = true
    setIsSaving(true)

    try {
      // Validate required fields
      if (!quizData.title?.trim()) {
        toast.error('Please enter a quiz title')
        saveAttempted.current = false
        setIsSaving(false)
        return
      }

      if (!quizData.questions || quizData.questions.length === 0) {
        toast.error('Please add at least one question')
        saveAttempted.current = false
        setIsSaving(false)
        return
      }

      // Validate questions
      const incompleteQuestion = quizData.questions.find(q => 
        !q.questionText?.trim() || 
        !q.options?.A?.trim() || 
        !q.options?.B?.trim() || 
        !q.options?.C?.trim() || 
        !q.options?.D?.trim() || 
        !q.correctAnswer
      )

      if (incompleteQuestion) {
        toast.error('Please complete all questions before saving')
        saveAttempted.current = false
        setIsSaving(false)
        return
      }

      // Get current user
      const {  data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication error. Please log in again.')
        saveAttempted.current = false
        setIsSaving(false)
        navigate('/login')
        return
      }

      console.log('📍 CreateQuiz: Saving quiz data', quizData)

      // 1. Insert quiz metadata
      const { data, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          staff_id: user.id,
          degree: quizData.degree || '',
          semester: quizData.semester || null,
          subject_code: quizData.subjectCode || '',
          subject_name: quizData.subjectName || '',
          title: quizData.title,
          timer: quizData.timer || 30,
          is_published: false
        })
        .select()
        .single()

      if (quizError) {
        console.error('📍 CreateQuiz: Quiz insert error', quizError)
        throw new Error(`Failed to create quiz: ${quizError.message}`)
      }

      console.log('📍 CreateQuiz: Quiz response data', data)

      // Extract quiz ID
      const quizId = data?.id || data?.[0]?.id
      if (!quizId) {
        console.error('📍 CreateQuiz: Could not extract quiz ID from response', data)
        throw new Error('Failed to get quiz ID after creation')
      }

      console.log('📍 CreateQuiz: Quiz ID', quizId)

      // 2. Insert questions
      const questionsToInsert = quizData.questions.map((q, index) => ({
        quiz_id: quizId,
        question_text: q.questionText,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_answer: q.correctAnswer,
        position: index + 1
      }))

      console.log('📍 CreateQuiz: Inserting questions', questionsToInsert)

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) {
        console.error('📍 CreateQuiz: Questions insert error', questionsError)
        throw new Error(`Failed to save questions: ${questionsError.message}`)
      }

      // Success - Clear draft and redirect
      console.log('📍 CreateQuiz: Clearing localStorage draft')
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      toast.success('Quiz saved successfully!')
      navigate('/dashboard')
      
    } catch (error) {
      console.error('📍 CreateQuiz: Error saving quiz', error)
      toast.error(error.message || 'Failed to save quiz. Please try again.')
      saveAttempted.current = false // Allow retry on error
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <QuizBuilder onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}