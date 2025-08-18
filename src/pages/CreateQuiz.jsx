// src/pages/CreateQuiz.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuizBuilder } from '../components/quiz/QuizBuilder'

export default function CreateQuiz() {
  const navigate = useNavigate()

  const handleSave = async (quizData) => {
    // We'll implement this next
    console.log('Saving quiz:', quizData)
    // After saving, redirect to dashboard or quiz list
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <QuizBuilder onSave={handleSave} />
    </div>
  )
}