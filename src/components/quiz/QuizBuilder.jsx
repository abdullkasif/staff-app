// src/components/quiz/QuizBuilder.jsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { QuizInfoForm } from './QuizInfoForm'
import { QuestionList } from './QuestionList'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DEFAULT_QUIZ = {
  degree: '',
  semester: '',
  subjectCode: '',
  subjectName: '',
  title: '',
  timer: 30
}

const LOCAL_STORAGE_KEY = 'quiz_builder_draft'

export function QuizBuilder({ onSave, isSaving }) {
  const [quizInfo, setQuizInfo] = useState(null)
  const [questions, setQuestions] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const navigate = useNavigate()

  // Load saved data on component mount
  useEffect(() => {
    console.log('📍 QuizBuilder: Initializing component')
    
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        console.log('📍 QuizBuilder: Loaded saved data', parsedData)
        setQuizInfo(parsedData.quizInfo || DEFAULT_QUIZ)
        setQuestions(parsedData.questions || [])
      } catch (error) {
        console.error('📍 QuizBuilder: Failed to parse saved data', error)
        setQuizInfo(DEFAULT_QUIZ)
        setQuestions([])
      }
    } else {
      console.log('📍 QuizBuilder: No saved data, using defaults')
      setQuizInfo(DEFAULT_QUIZ)
      setQuestions([])
    }
    
    setIsInitialized(true)
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (isInitialized && quizInfo !== null && questions !== null) {
      const draftData = {
        quizInfo,
        questions
      }
      console.log('📍 QuizBuilder: Saving data to localStorage')
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData))
    }
  }, [quizInfo, questions, isInitialized])

const handleSave = () => {
  // Only call onSave if we have data and not already saving
  if (quizInfo && questions && questions.length > 0) {
    console.log('📍 QuizBuilder: Calling onSave with data')
    const quizData = {
      ...quizInfo,
      questions
    }
    onSave(quizData)
  } else {
    console.log('📍 QuizBuilder: Cannot save - missing data')
  }
}

  const clearDraft = () => {
    if (window.confirm('Clear your saved draft and start over?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      window.location.reload()
    }
  }

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your draft...</p>
        </div>
      </div>
    )
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
              onClick={() => {
                if (window.confirm('Are you sure you want to leave? Your progress will be saved.')) {
                  navigate('/dashboard')
                }
              }}
              className="rounded-full"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Create Quiz</h1>
              <p className="text-xs text-muted-foreground -mt-1">Build your assessment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearDraft}
              className="gap-2"
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || questions.length === 0}
              className="gap-2"
            >
              <Save className="size-4" />
              {isSaving ? 'Saving...' : 'Save Quiz'}
            </Button>
          </div>
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
            {localStorage.getItem(LOCAL_STORAGE_KEY) && (
              <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1">
                <span className="size-2 bg-primary rounded-full"></span>
                Draft auto-saved
              </p>
            )}
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
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">

        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow h-14 w-14 p-0"
          onClick={handleSave}
          disabled={isSaving || questions.length === 0}
          title="Save Quiz"
        >
          {isSaving ? (
            <div className="size-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="size-6" />
          )}
        </Button>
      </div>
    </div>
  )
}