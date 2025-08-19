// src/components/dashboard/DashboardHeader.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/supabase";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";

export default function DashboardHeader({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
      {/* Top Header Bar */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">SA</span>
            </div>
            <span className="text-lg font-semibold">StaffApp</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </header>

      {/* Symmetrical Profile Section */}
      <div className="container px-4 py-12">
        <div className="mx-auto max-w-md">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar */}
            <Avatar className="size-20 ring-4 ring-primary/10">
              <AvatarImage src={null} alt={profile?.full_name || "Staff"} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">
                {profile?.full_name || "Loading..."}
              </h1>
              <p className="text-muted-foreground">
                {user?.email || "Loading email..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.department || "Department not set"}
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Button 
                size="lg" 
                className="px-8 py-6 text-base shadow-md hover:shadow-lg transition-shadow"
                onClick={handleCreateQuiz}
              >
                + Create New Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}