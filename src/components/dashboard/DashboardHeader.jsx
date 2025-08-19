// src/components/dashboard/DashboardHeader.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/supabase";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Plus } from "lucide-react";

export default function DashboardHeader({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const {  data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, department")
          .eq("id", user.id)
          .single();

        if (!error) {
          setProfile(data);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleCreateQuiz = () => {
    navigate("/create-quiz");
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Enhanced Top Header Bar */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <span className="text-sm font-bold">SA</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">StaffApp</h1>
              <p className="text-xs text-muted-foreground -mt-1">Quiz Management</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            aria-label="Logout"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </header>

      {/* Perfectly Symmetrical Profile Section */}
      <div className="border-b bg-muted/30">
        <div className="container px-4 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
              {/* Left: Profile Info - Perfectly Centered */}
              <div className="flex items-center gap-6">
                {/* Avatar with perfect alignment */}
                <div className="flex items-center justify-center">
                  <Avatar className="size-20 ring-4 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarImage src={null} alt={profile?.full_name || "Staff"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Profile Text - Perfectly aligned */}
                <div className="flex flex-col justify-center min-h-[80px]">
                  <h1 className="text-2xl font-bold leading-none">
                    {profile?.full_name || "Loading..."}
                  </h1>
                  <p className="text-muted-foreground text-base mt-1">
                    {user?.email || "Loading email..."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile?.department || "Loading department..."}
                  </p>
                </div>
              </div>

              {/* Right: CTA Button - Perfectly Centered */}
              <div className="flex items-center justify-center min-h-[80px]">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleCreateQuiz}
                >
                  <Plus className="size-5 mr-2" />
                  Create Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}