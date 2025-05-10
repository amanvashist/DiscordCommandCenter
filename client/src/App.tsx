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
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ username: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await checkAuthStatus();
        setIsAuthenticated(authResult.success);
        if (authResult.success && authResult.user) {
          setUserInfo({
            username: authResult.user.username,
            isAdmin: authResult.user.isAdmin
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-discord-darkest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated && location !== "/login") {
    setLocation("/login");
    return null;
  }

  return (
    <TooltipProvider>
      <Toaster />
      {isAuthenticated && location !== "/login" ? (
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
              onLogout={() => setIsAuthenticated(false)}
            />
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/users" component={UserConfig} />
              <Route path="/commands" component={Commands} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      ) : (
        <Switch>
          <Route path="/login">
            <Login onLoginSuccess={(user) => {
              setIsAuthenticated(true);
              setUserInfo({
                username: user.username,
                isAdmin: user.isAdmin
              });
              setLocation("/");
            }} />
          </Route>
        </Switch>
      )}
    </TooltipProvider>
  );
}

export default App;
