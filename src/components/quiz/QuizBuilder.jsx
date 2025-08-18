// src/components/quiz/QuizBuilder.jsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { QuizInfoForm } from './QuizInfoForm'
import { QuestionList } from './QuestionList'
import { Save, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DEFAULT_QUIZ = {
  degree: '',
  semester: '',
  subjectCode: '',
  subjectName: '',
  title: '',
  timer: 30
}

export function QuizBuilder({ onSave }) {
  const [quizInfo, setQuizInfo] = useState(DEFAULT_QUIZ)
  const [questions, setQuestions] = useState([])
  const navigate = useNavigate()

  const handleSave = () => {
    const quizData = {
      ...quizInfo,
      questions
    }
    onSave(quizData)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Create Quiz</h1>
              <p className="text-xs text-muted-foreground -mt-1">Build your assessment</p>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={questions.length === 0}
            className="gap-2"
          >
            <Save className="size-4" />
            Save Quiz
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8 pb-24">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Hero Section */}
          <div className="text-center py-6">
            <h1 className="text-3xl font-bold tracking-tight">Quiz Builder</h1>
            <p className="text-muted-foreground mt-2">
              Create engaging assessments for your students
            </p>
          </div>

          {/* Quiz Info Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <QuizInfoForm
              value={quizInfo}
              onChange={setQuizInfo}
            />
          </div>

          {/* Questions Section */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <QuestionList
              questions={questions}
              onChange={setQuestions}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-14 w-14 p-0"
          onClick={handleSave}
          disabled={questions.length === 0}
        >
          <Save className="size-6" />
        </Button>
      </div>
    </div>
  )
}