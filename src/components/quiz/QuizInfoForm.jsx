// src/components/quiz/QuizInfoForm.jsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function QuizInfoForm({ value, onChange }) {
  const handleChange = (field, val) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Quiz Information</h2>
        <p className="text-muted-foreground mt-1">
          Enter the basic details for your quiz
        </p>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">Quiz Title</Label>
          <Input
            id="title"
            value={value.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Midterm Assessment - Units 1-3"
            className="text-base py-5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timer" className="text-base">Time Limit (minutes)</Label>
          <Input
            id="timer"
            type="number"
            min="1"
            value={value.timer || ''}
            onChange={(e) => handleChange('timer', parseInt(e.target.value) || '')}
            placeholder="e.g., 30"
            className="text-base py-5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree" className="text-base">Degree Program</Label>
          <Input
            id="degree"
            value={value.degree || ''}
            onChange={(e) => handleChange('degree', e.target.value)}
            placeholder="e.g., B.Sc Computer Science"
            className="text-base py-5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester" className="text-base">Semester</Label>
          <Input
            id="semester"
            type="number"
            min="1"
            max="8"
            value={value.semester || ''}
            onChange={(e) => handleChange('semester', parseInt(e.target.value) || '')}
            placeholder="e.g., 5"
            className="text-base py-5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectCode" className="text-base">Subject Code</Label>
          <Input
            id="subjectCode"
            value={value.subjectCode || ''}
            onChange={(e) => handleChange('subjectCode', e.target.value)}
            placeholder="e.g., CS501"
            className="text-base py-5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectName" className="text-base">Subject Name</Label>
          <Input
            id="subjectName"
            value={value.subjectName || ''}
            onChange={(e) => handleChange('subjectName', e.target.value)}
            placeholder="e.g., Data Structures"
            className="text-base py-5"
          />
        </div>
      </div>
    </div>
  )
}