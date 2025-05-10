import { useState, useEffect } from "react";
import { BotUser, insertBotUserSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface UserFormProps {
  user: BotUser | null;
  onCancel: () => void;
  onSave: () => void;
}

const userFormSchema = insertBotUserSchema.extend({
  // Additional validation can be added here
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserForm({ user, onCancel, onSave }: UserFormProps) {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [temperature, setTemperature] = useState(user?.temperature || "0.7");
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user ? {
      ...user
    } : {
      username: "",
      apiKey: "",
      model: "poppy-v1",
      temperature: "0.7",
      maxTokens: 1024,
      isActive: true,
      role: "User",
      canUseAsk: true,
      canUseSummary: true
    }
  });
  
  // Update form when user prop changes
  useEffect(() => {
    if (user) {
      setTemperature(user.temperature || "0.7");
      form.reset({
        ...user
      });
    }
  }, [user, form]);
  
  const createMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await apiRequest('POST', '/api/bot-users', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; values: UserFormValues }) => {
      const response = await apiRequest('PUT', `/api/bot-users/${data.id}`, data.values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: UserFormValues) => {
    if (user) {
      updateMutation.mutate({ id: user.id, values: data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTemperature(value);
    form.setValue('temperature', value);
  };

  return (
    <div className="bg-discord-dark rounded-lg overflow-hidden shadow-lg border border-gray-800 p-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - User Info */}
          <div className="flex-1">
            <div className="mb-6">
              <h3 className="text-discord-lighter font-medium mb-4">User Information</h3>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  Username
                </label>
                <input 
                  type="text" 
                  className="bg-discord-darkest w-full px-3 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-discord-red text-sm mt-1">{form.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  Username Description
                </label>
                <input 
                  type="text" 
                  className="bg-discord-darkest w-full px-3 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter"
                  placeholder="Optional description or note about this user"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  Role
                </label>
                <select 
                  className="bg-discord-darkest w-full px-3 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter"
                  {...form.register("role")}
                >
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="User">User</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="status" 
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-discord-dark appearance-none cursor-pointer"
                      {...form.register("isActive")}
                    />
                    <label 
                      htmlFor="status" 
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-discord-green cursor-pointer"
                    ></label>
                  </div>
                  <span className="text-sm text-discord-lighter">
                    {form.watch("isActive") ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - API Settings */}
          <div className="flex-1">
            <div className="mb-6">
              <h3 className="text-discord-lighter font-medium mb-4">Poppy AI API Configuration</h3>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"} 
                    className="bg-discord-darkest w-full px-3 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter"
                    {...form.register("apiKey")}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-discord-light hover:text-white"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    <i className={`ri-${showApiKey ? 'eye-off' : 'eye'}-line`}></i>
                  </button>
                </div>
                {form.formState.errors.apiKey && (
                  <p className="text-discord-red text-sm mt-1">{form.formState.errors.apiKey.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  Model
                </label>
                <select 
                  className="bg-discord-darkest w-full px-3 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter"
                  {...form.register("model")}
                >
                  <option value="poppy-v1">poppy-v1</option>
                  <option value="poppy-v2">poppy-v2</option>
                  <option value="poppy-pro">poppy-pro</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  Temperature
                </label>
                <div className="flex items-center">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={temperature}
                    onChange={handleTemperatureChange}
                    className="w-full h-2 bg-discord-darkest rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-discord-lighter">{temperature}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-discord-light text-sm font-medium mb-2">
                  Max Tokens
                </label>
                <input 
                  type="number" 
                  className="bg-discord-darkest w-full px-3 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter"
                  {...form.register("maxTokens", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Command Permissions */}
        <div className="mb-6 border-t border-gray-700 pt-6">
          <h3 className="text-discord-lighter font-medium mb-4">Command Permissions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-discord-darker p-3 rounded-md">
              <div>
                <h4 className="font-medium">/ask</h4>
                <p className="text-sm text-discord-light">Ask questions to Poppy AI</p>
              </div>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="ask_command" 
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-discord-darker appearance-none cursor-pointer"
                  {...form.register("canUseAsk")}
                />
                <label 
                  htmlFor="ask_command" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-discord-green cursor-pointer"
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-discord-darker p-3 rounded-md">
              <div>
                <h4 className="font-medium">/summary</h4>
                <p className="text-sm text-discord-light">Summarize thread content</p>
              </div>
              <div className="relative inline-block w-10 align-middle select-none">
                <input 
                  type="checkbox" 
                  id="summary_command" 
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-discord-darker appearance-none cursor-pointer"
                  {...form.register("canUseSummary")}
                />
                <label 
                  htmlFor="summary_command" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-discord-green cursor-pointer"
                ></label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <button 
            type="button"
            className="px-4 py-2 rounded-md border border-gray-700 text-discord-light hover:bg-discord-darker transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 rounded-md bg-discord-blue text-white hover:bg-opacity-80 transition-colors"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full"></div>
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
