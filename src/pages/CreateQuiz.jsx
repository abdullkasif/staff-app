// src/pages/CreateQuiz.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/supabase";
import { QuizBuilder } from "../components/quiz/QuizBuilder";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = "quiz_builder_draft";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const saveAttempted = useRef(false); // Prevent duplicate saves

  const handleSave = async (quizData) => {
    console.log("📍 CreateQuiz: handleSave called with data", quizData);

    // Prevent duplicate calls with better logging
    if (isSaving) {
      console.log("📍 CreateQuiz: Save already in progress");
      toast.info("Save already in progress...");
      return;
    }

    if (saveAttempted.current) {
      console.log("📍 CreateQuiz: Save already attempted");
      toast.info("Save already attempted...");
      return;
    }

    saveAttempted.current = true;
    setIsSaving(true);

    try {
      // Validate required fields
      if (!quizData.title?.trim()) {
        toast.error("Please enter a quiz title");
        saveAttempted.current = false;
        setIsSaving(false);
        return;
      }

      if (!quizData.questions || quizData.questions.length === 0) {
        toast.error("Please add at least one question");
        saveAttempted.current = false;
        setIsSaving(false);
        return;
      }

      // Validate questions
      const incompleteQuestion = quizData.questions.find(
        (q) =>
          !q.questionText?.trim() ||
          !q.options?.A?.trim() ||
          !q.options?.B?.trim() ||
          !q.options?.C?.trim() ||
          !q.options?.D?.trim() ||
          !q.correctAnswer
      );

      if (incompleteQuestion) {
        toast.error("Please complete all questions before saving");
        saveAttempted.current = false;
        setIsSaving(false);
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Authentication error. Please log in again.");
        saveAttempted.current = false;
        setIsSaving(false);
        navigate("/login");
        return;
      }

      // Check if user is staff
      const userRole = user?.user_metadata?.user_role;
      if (userRole !== "staff") {
        toast.error("Unauthorized access");
        saveAttempted.current = false;
        setIsSaving(false);
        navigate("/login");
        return;
      }

      console.log("📍 CreateQuiz: Saving quiz data", quizData);

      // 1. Insert quiz metadata
      const { data: quizInsertResult, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          staff_id: user.id,
          degree: quizData.degree || "",
          semester: quizData.semester || null,
          subject_code: quizData.subjectCode || "",
          subject_name: quizData.subjectName || "",
          title: quizData.title,
          timer: quizData.timer || 30,
          is_published: false,
        })
        .select();

      if (quizError) {
        console.error("📍 CreateQuiz: Quiz insert error", quizError);
        throw new Error(`Failed to create quiz: ${quizError.message}`);
      }

      console.log("📍 CreateQuiz: Quiz insert result", quizInsertResult);

      // Extract quiz ID with multiple fallback methods
      let quizId = null;

      // Method 1: Direct data array access
      if (
        Array.isArray(quizInsertResult) &&
        quizInsertResult.length > 0 &&
        quizInsertResult[0].id
      ) {
        quizId = quizInsertResult[0].id;
      }
      // Method 2: Single object access (if select().single() was used)
      else if (quizInsertResult && quizInsertResult.id) {
        quizId = quizInsertResult.id;
      }
      // Method 3: Check for data property
      else if (
        quizInsertResult &&
        quizInsertResult.data &&
        Array.isArray(quizInsertResult.data) &&
        quizInsertResult.data[0] &&
        quizInsertResult.data[0].id
      ) {
        quizId = quizInsertResult.data[0].id;
      }

      if (!quizId) {
        console.error(
          "📍 CreateQuiz: Could not extract quiz ID. Full response:",
          quizInsertResult
        );
        throw new Error(
          "Failed to get quiz ID after creation. Please check the console logs."
        );
      }

      console.log("📍 CreateQuiz: Quiz ID extracted successfully:", quizId);

      // 2. Insert questions and create quiz_questions links
      // First, insert all unique questions
      const questionsToInsert = quizData.questions.map((q) => ({
        staff_id: user.id,
        question_text: q.questionText,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_answer: q.correctAnswer,
      }));

      console.log("📍 CreateQuiz: Inserting questions", questionsToInsert);

      const { data: insertedQuestions, error: questionsError } = await supabase
        .from("questions")
        .insert(questionsToInsert)
        .select();

      if (questionsError) {
        console.error("📍 CreateQuiz: Questions insert error", questionsError);
        throw new Error(`Failed to save questions: ${questionsError.message}`);
      }

      if (!insertedQuestions || insertedQuestions.length === 0) {
        throw new Error("No questions were inserted. Please try again.");
      }

      console.log("📍 CreateQuiz: Questions inserted", insertedQuestions);

      // 3. Create quiz_questions links
      const quizQuestionsToInsert = insertedQuestions.map((q, index) => ({
        quiz_id: quizId,
        question_id: q.id,
        question_order: index + 1,
        marks: 1,
      }));
      console.log(
        "📍 CreateQuiz: Creating quiz_questions links",
        quizQuestionsToInsert
      );

      const { error: quizQuestionsError } = await supabase
        .from("quiz_questions")
        .insert(quizQuestionsToInsert);

      if (quizQuestionsError) {
        console.error(
          "📍 CreateQuiz: Quiz questions insert error",
          quizQuestionsError
        );
        throw new Error(
          `Failed to link questions to quiz: ${quizQuestionsError.message}`
        );
      }

      // Success - Clear draft and redirect
      console.log("📍 CreateQuiz: Clearing localStorage draft");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.success("Quiz saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("📍 CreateQuiz: Error saving quiz", error);
      toast.error(error.message || "Failed to save quiz. Please try again.");
      saveAttempted.current = false; // Allow retry on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <QuizBuilder onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
