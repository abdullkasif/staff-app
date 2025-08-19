// src/components/dashboard/QuizList.jsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  BarChart3,
  RefreshCw,
  FileQuestion,
  Plus,
} from "lucide-react";
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

import { toast } from "sonner";
import { supabase } from "@/lib/supabase/supabase";

export function QuizList({ quizzes, loading, onRefresh, onDelete }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Section Header - Perfectly aligned with avatar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="h-7 w-40 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-4 w-32 bg-muted/50 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
        </div>

        {/* Quiz Grid - Perfect alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border-border/50 h-full">
              <CardHeader className="pb-4">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted/50 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="h-6 bg-muted/50 rounded w-1/3 mt-2"></div>
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <div className="h-9 bg-muted rounded-lg flex-1"></div>
                <div className="h-9 bg-muted rounded-lg flex-1"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header - Perfectly aligned with avatar position */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Your Quizzes</h2>
          <p className="text-muted-foreground mt-1">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} created
          </p>
        </div>
        {quizzes.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2 shadow-sm hover:shadow transition-shadow"
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        )}
      </div>

      {quizzes.length === 0 ? (
        /* Empty State - Perfectly Centered */
        <div className="text-center py-12">
          <FileQuestion className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Quizzes yet</h3>
          <p className="text-muted-foreground mb-4">
            create your first quiz to get started
          </p>
          <Button onClick={() => navigate("/create-quiz")} className="gap-2">
            <Plus className="size-4" />
            Create First Quiz
          </Button>
        </div>
      ) : (
        /* Quiz Grid - Perfect alignment with avatar */
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
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // 1. Generate 5-digit access code
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      
      // 2. Set expiry (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      // 3. Save access code to database
      const { error: codeError } = await supabase
        .from('access_codes')
        .insert({
          quiz_id: quiz.id,
          code: code,
          expires_at: expiresAt,
          is_active: true
        });
      
      if (codeError) throw codeError;
      
      // 4. Update quiz status to published
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({ is_published: true })
        .eq('id', quiz.id);
      
      if (quizError) throw quizError;
      
      // 5. Show success and refresh
      toast.success('Quiz published successfully!', {
        description: `Access code: ${code}`
      });
      
      // 6. Refresh the quiz list
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast.error('Failed to publish quiz', {
        description: error.message
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    onDelete(quiz.id);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {quiz.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {quiz.subject_code} • Semester {quiz.semester}
              </p>
            </div>
            <Badge 
              variant={isPublished ? "default" : "secondary"} 
              className="ml-2 flex-shrink-0 shadow-sm"
            >
              {isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4 flex-1">
          <div className="space-y-3">
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="size-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                Created {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
              </span>
            </div>
            
            {isPublished && accessCode && (
              <div className="flex items-center bg-green-50 dark:bg-green-950/20 p-2 rounded-lg">
                <CheckCircle className="size-4 mr-2 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="font-mono text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-green-700 dark:text-green-300 truncate">
                  Code: {accessCode}
                </span>
              </div>
            )}
            
            {!isPublished && (
              <div className="flex items-center bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-lg">
                <FileText className="size-4 mr-2 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Draft in progress
                </span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3 p-4 pt-0">
          {!isPublished ? (
            // Draft mode: Publish + Delete buttons
            <>
              <Button 
                size="default" 
                className="flex-1 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                className="flex-1 border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            // Published mode: Results + Delete buttons
            <>
              <Button 
                size="default" 
                className="flex-1 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                onClick={() => navigate(`/quiz/${quiz.id}/results`)}
              >
                <BarChart3 className="size-4 mr-2" />
                Results
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                className="flex-1 border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete <span className="font-semibold">"{quiz.title}"</span> and all associated questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}