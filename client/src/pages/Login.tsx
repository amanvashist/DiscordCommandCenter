import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginCredentials, AuthResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";

interface LoginProps {
  onLoginSuccess: (user: { id: number; username: string; isAdmin: boolean }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      const response = await login(data);
      
      if (response.success && response.user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.user.username}!`,
          variant: "default",
        });
        
        onLoginSuccess(response.user);
      } else {
        toast({
          title: "Login failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-discord-darkest p-4">
      <Card className="w-full max-w-md border-gray-800 bg-discord-dark">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-discord-blue flex items-center justify-center text-white font-bold">
              <i className="ri-robot-line text-3xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Poppy AI Bot</CardTitle>
          <CardDescription className="text-discord-light">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-discord-lighter">Username</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-discord-darkest border-gray-700 text-discord-lighter focus:border-discord-blue" 
                        placeholder="Enter your username" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-discord-lighter">Password</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-discord-darkest border-gray-700 text-discord-lighter focus:border-discord-blue" 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-discord-blue hover:bg-opacity-80"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              <div className="text-center text-discord-light text-sm mt-4">
                <p>Default credentials: admin / admin123</p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
