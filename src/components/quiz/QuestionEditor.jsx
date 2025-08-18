// src/components/quiz/QuestionEditor.jsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle } from 'lucide-react'

const OPTIONS = ['A', 'B', 'C', 'D']

export function QuestionEditor({ question, index, onChange, onDelete }) {
  const handleChange = (field, value) => {
    onChange({ ...question, [field]: value })
  }

  const handleOptionChange = (optionKey, value) => {
    const newOptions = { ...question.options, [optionKey]: value }
    handleChange('options', newOptions)
  }

  return (
    <div className="border rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-primary font-bold">{index + 1}</span>
          </div>
          <h3 className="text-lg font-semibold">Question {index + 1}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="rounded-full hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete question"
        >
          <Trash2 className="size-5" />
        </Button>
      </div>

      {/* Question Text */}
      <div className="space-y-4 mb-6">
        <Label className="text-base">Question Text</Label>
        <Textarea
          value={question.questionText || ''}
          onChange={(e) => handleChange('questionText', e.target.value)}
          placeholder="Enter your question here..."
          className="min-h-[100px] text-base p-4"
        />
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        <Label className="text-base">Answer Options</Label>
        <div className="space-y-3">
          {OPTIONS.map((option) => (
            <div key={option} className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <span className="font-medium">{option}</span>
              </div>
              <Input
                value={question.options?.[option] || ''}
                onChange={(e) => handleOptionChange(option, e.target.value)}
                placeholder={`Option ${option}...`}
                className="flex-1 py-5 text-base"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Correct Answer */}
      <div className="space-y-4">
        <Label className="text-base">Correct Answer</Label>
        <div className="flex flex-wrap gap-3">
          {OPTIONS.map((option) => (
            <Button
              key={option}
              variant={question.correctAnswer === option ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleChange('correctAnswer', option)}
              className={`gap-2 px-6 py-5 text-base ${question.correctAnswer === option ? 'shadow-md' : ''}`}
            >
              {question.correctAnswer === option && (
                <CheckCircle className="size-5" />
              )}
              Option {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}