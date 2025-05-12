import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/Dashboard";
import UserConfig from "@/pages/UserConfig";
import Commands from "@/pages/Commands";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { checkAuthStatus } from "@/lib/auth";

function App() {
  // State and hooks
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ username: string; isAdmin: boolean } | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        const authResult = await checkAuthStatus();
        console.log("Auth result:", authResult);
        
        setIsAuthenticated(authResult.success);
        
        if (authResult.success && authResult.user) {
          setUserInfo({
            username: authResult.user.username,
            isAdmin: authResult.user.isAdmin
          });
          console.log("User authenticated:", authResult.user);
        } else {
          console.log("Auth failed - no success or user");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle redirects when authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && location !== "/login") {
        console.log("Redirecting to login");
        setLocation("/login");
      } else if (isAuthenticated && location === "/login") {
        console.log("Redirecting to home");
        setLocation("/");
      }
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-discord-darkest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord-blue"></div>
      </div>
    );
  }

  // Render main app
  return (
    <TooltipProvider>
      <Toaster />
      {isAuthenticated ? (
        // Authenticated view with sidebar and header
        <div className="flex h-screen bg-discord-darkest text-white">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              title={
                location === "/" ? "Dashboard" : 
                location === "/users" ? "User Configuration" : 
                location === "/commands" ? "Commands" : 
                "Poppy Bot"
              }
              userInfo={userInfo}
              onLogout={() => {
                setIsAuthenticated(false);
                setUserInfo(null);
              }}
            />
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/users">
                {userInfo?.isAdmin ? <UserConfig /> : <NotFound />}
              </Route>
              <Route path="/commands" component={Commands} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      ) : (
        // Login view
        <Switch>
          <Route path="/login">
            <Login onLoginSuccess={(user) => {
              console.log("Login success, setting auth state:", user);
              setIsAuthenticated(true);
              setUserInfo({
                username: user.username,
                isAdmin: user.isAdmin
              });
            }} />
          </Route>
          <Route>
            <Login onLoginSuccess={(user) => {
              console.log("Login success from catchall route:", user);
              setIsAuthenticated(true);
              setUserInfo({
                username: user.username,
                isAdmin: user.isAdmin
              });
            }} />
          </Route>
        </Switch>
      )}
    </TooltipProvider>
  );
}

export default App;