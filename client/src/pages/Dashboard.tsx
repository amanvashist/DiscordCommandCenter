import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BotUser } from "@shared/schema";

export default function Dashboard() {
  const { data: botUsers, isLoading } = useQuery<BotUser[]>({
    queryKey: ['/api/bot-users'],
  });

  // Calculate statistics
  const totalUsers = botUsers?.length || 0;
  const activeUsers = botUsers?.filter(user => user.isActive).length || 0;
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = botUsers?.filter(user => user.role === 'Admin').length || 0;

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-discord-dark border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-discord-light">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-discord-darker animate-pulse rounded"></div>
              ) : (
                totalUsers
              )}
            </div>
            <p className="text-xs text-discord-light mt-1">Discord users with Poppy AI access</p>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-dark border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-discord-light">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {isLoading ? (
                <div className="h-8 w-16 bg-discord-darker animate-pulse rounded"></div>
              ) : (
                activeUsers
              )}
            </div>
            <p className="text-xs text-discord-light mt-1">Users with enabled access</p>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-dark border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-discord-light">Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {isLoading ? (
                <div className="h-8 w-16 bg-discord-darker animate-pulse rounded"></div>
              ) : (
                inactiveUsers
              )}
            </div>
            <p className="text-xs text-discord-light mt-1">Users with disabled access</p>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-dark border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-discord-light">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-discord-blue">
              {isLoading ? (
                <div className="h-8 w-16 bg-discord-darker animate-pulse rounded"></div>
              ) : (
                adminUsers
              )}
            </div>
            <p className="text-xs text-discord-light mt-1">Users with admin privileges</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="bg-discord-dark border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <i className="ri-information-line mr-2 text-discord-blue"></i>
              Bot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-discord-light">Discord Connection</span>
                <span className="bg-green-900 bg-opacity-30 text-green-400 text-xs px-2 py-1 rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-discord-light">Poppy AI API</span>
                <span className="bg-green-900 bg-opacity-30 text-green-400 text-xs px-2 py-1 rounded-full">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-discord-light">Bot Version</span>
                <span className="text-discord-lighter">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-discord-light">Uptime</span>
                <span className="text-discord-lighter">3d 12h 45m</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-dark border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <i className="ri-line-chart-line mr-2 text-discord-blue"></i>
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-discord-light">/ask Command</span>
                <span className="text-discord-lighter">328 uses today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-discord-light">/summary Command</span>
                <span className="text-discord-lighter">96 uses today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-discord-light">Total API Calls</span>
                <span className="text-discord-lighter">24,187 this month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-discord-light">Average Response Time</span>
                <span className="text-discord-lighter">2.4s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <footer className="mt-auto p-4 text-center text-discord-light text-sm border-t border-discord-darkest mt-6">
        <p>Poppy AI Discord Bot Dashboard &copy; {new Date().getFullYear()} | v1.0.0</p>
      </footer>
    </main>
  );
}
