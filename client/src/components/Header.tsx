import { useState } from "react";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  userInfo: { username: string; isAdmin: boolean } | null;
  onLogout: () => void;
}

export default function Header({ title, userInfo, onLogout }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      onLogout();
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "An error occurred during logout",
        variant: "destructive",
      });
    }
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="bg-discord-dark p-4 border-b border-discord-darkest flex items-center justify-between">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <i className="ri-notification-3-line text-xl text-discord-light cursor-pointer hover:text-white transition-colors"></i>
          <span className="absolute -top-1 -right-1 bg-discord-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
        </div>
        <div className="relative">
          <div 
            className="bg-discord-blue h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
            onClick={toggleDropdown}
          >
            <span className="text-sm font-semibold">
              {userInfo?.username ? userInfo.username.substring(0, 2).toUpperCase() : "?"}
            </span>
          </div>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-discord-darker border border-gray-700 rounded-md shadow-lg z-10">
              <div className="p-3 border-b border-gray-700">
                <p className="font-medium text-discord-lighter">{userInfo?.username || "User"}</p>
                <p className="text-xs text-discord-light">{userInfo?.isAdmin ? "Administrator" : "Regular User"}</p>
              </div>
              <div className="p-1">
                <button 
                  className="w-full text-left px-3 py-2 text-discord-light hover:bg-discord-dark hover:text-white transition-colors rounded-sm flex items-center"
                  onClick={handleLogout}
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
