// src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase/supabase";
import { Button } from "../components/ui/button";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onLogout={handleLogout} />
    </div>
  );
}
