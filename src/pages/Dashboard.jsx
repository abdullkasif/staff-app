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
      const {  data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          id,
          title,
          subject_code,
          subject_name,
          semester,
          is_published,
          created_at,
          access_codes ( code, expires_at )
        `)
        .eq("staff_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
  try {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw error;
    
    // Refresh the quiz list
    fetchQuizzes();
    
    // Show success message (you might want to add toast notifications)
    toast.success('Quiz deleted successfully');
  } catch (error) {
    console.error('Error deleting quiz:', error);
    toast.error('Failed to delete quiz');
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={handleLogout} />
      
      {/* Quiz List Section */}
      <div className="container px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <QuizList 
            quizzes={quizzes} 
            loading={loading} 
            onRefresh={fetchQuizzes}
            onDelete={handleDeleteQuiz}
          />
        </div>
      </div>
    </div>
  );
}