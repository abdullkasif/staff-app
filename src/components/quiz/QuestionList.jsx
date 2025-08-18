// src/components/quiz/QuestionList.jsx
import { QuestionEditor } from './QuestionEditor'
import { Button } from '@/components/ui/button'
import { Plus, FileQuestion } from 'lucide-react'

const DEFAULT_QUESTION = {
  questionText: '',
  options: { A: '', B: '', C: '', D: '' },
  correctAnswer: ''
}

export function QuestionList({ questions, onChange }) {
  const addQuestion = () => {
    onChange([...questions, { ...DEFAULT_QUESTION }])
  }

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    onChange(newQuestions)
  }

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    onChange(newQuestions)
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileQuestion className="size-5 text-primary" />
          <h2 className="text-2xl font-bold">Questions</h2>
        </div>
        <p className="text-muted-foreground">
          Add multiple choice questions with correct answers
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <FileQuestion className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first question to get started
            </p>
            <Button onClick={addQuestion} className="gap-2">
              <Plus className="size-4" />
              Add First Question
            </Button>
          </div>
        ) : (
          questions.map((question, index) => (
            <QuestionEditor
              key={index}
              index={index}
              question={question}
              onChange={(updated) => updateQuestion(index, updated)}
              onDelete={() => deleteQuestion(index)}
            />
          ))
        )}
      </div>

      {/* Add Question Button */}
      {questions.length > 0 && (
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={addQuestion}
            className="w-full gap-2 py-6 text-base"
          >
            <Plus className="size-5" />
            Add Another Question
          </Button>
        </div>
      )}
    </div>
  )
}