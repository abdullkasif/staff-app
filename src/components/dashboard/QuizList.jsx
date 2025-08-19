// src/components/dashboard/QuizList.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, FileText, Clock, CheckCircle, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function QuizList({ quizzes, loading, onRefresh, onDelete }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Quizzes</h2>
          <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Quizzes</h2>
          <p className="text-muted-foreground">
            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created
          </p>
        </div>
        {quizzes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </Button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="size-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first quiz to get started
          </p>
          <Button onClick={() => navigate("/create-quiz")}>
            + Create Your First Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuizCard({ quiz, onDelete }) {
  const navigate = useNavigate();
  const isPublished = quiz.is_published;
  const accessCode = quiz.access_codes?.[0]?.code;
  const expiresAt = quiz.access_codes?.[0]?.expires_at;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handlePublish = async () => {
    // We'll implement this next
    console.log('Publish quiz:', quiz.id);
    // This will generate access code and mark as published
  };

  const handleDelete = async () => {
    onDelete(quiz.id);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {quiz.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {quiz.subject_code} • Semester {quiz.semester}
              </p>
            </div>
            <Badge 
              variant={isPublished ? "default" : "secondary"} 
              className="ml-2 flex-shrink-0"
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="size-4 mr-2" />
              <span>
                Created {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
              </span>
            </div>
            
            {isPublished && accessCode && (
              <div className="flex items-center">
                <CheckCircle className="size-4 mr-2 text-green-500" />
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  Code: {accessCode}
                </span>
              </div>
            )}
            
            {!isPublished && (
              <div className="flex items-center text-muted-foreground">
                <FileText className="size-4 mr-2" />
                <span>Draft quiz</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 p-4 pt-0">
          {!isPublished ? (
            // Draft mode: Publish + Delete buttons
            <>
              <Button 
                size="default" 
                className="flex-1 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                onClick={handlePublish}
              >
                <CheckCircle className="size-4 mr-1" />
                Publish
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="size-4 mr-1" />
                Delete
              </Button>
            </>
          ) : (
            // Published mode: Results + Delete buttons
            <>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(`/quiz/${quiz.id}/results`)}
              >
                <BarChart3 className="size-4 mr-2" />
                View Results
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz
              <span className="font-semibold"> "{quiz.title}"</span> and all associated
              questions and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}