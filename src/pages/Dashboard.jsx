// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase/supabase";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { QuizList } from "@/components/dashboard/QuizList";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Check if user is staff
      const userRole = user?.user_metadata?.user_role;
      if (userRole !== 'staff') {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select(
          `
          id,
          title,
          subject_code,
          subject_name,
          semester,
          is_published,
          created_at,
          access_codes ( code, expires_at )
        `
        )
        .eq("staff_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);

      if (error) throw error;

      // Refresh the quiz list
      fetchQuizzes();

      toast.success("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <DashboardHeader onLogout={handleLogout} />

      {/* Perfectly aligned Quiz List Section */}
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-8">
          <div className="mx-auto max-w-6xl">
            {/* This is where QuizList will be perfectly aligned */}
            <QuizList
              quizzes={quizzes}
              loading={loading}
              onRefresh={fetchQuizzes}
              onDelete={handleDeleteQuiz}
            />
          </div>
        </div>
      </div>
    </div>
  );
}