import { useState } from "react";
import { BotUser } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserListProps {
  users: BotUser[];
  isLoading: boolean;
  onEdit: (user: BotUser) => void;
}

export default function UserList({ users, isLoading, onEdit }: UserListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/bot-users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot-users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteClick = (id: number) => {
    setDeleteUserId(id);
    setIsDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (deleteUserId !== null) {
      deleteMutation.mutate(deleteUserId);
    }
    setIsDialogOpen(false);
    setDeleteUserId(null);
  };
  
  const cancelDelete = () => {
    setIsDialogOpen(false);
    setDeleteUserId(null);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-indigo-500", "bg-pink-500", "bg-orange-500", "bg-green-500", 
      "bg-purple-500", "bg-yellow-500", "bg-blue-500", "bg-red-500"
    ];
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  if (isLoading) {
    return (
      <div className="bg-discord-dark rounded-lg overflow-hidden shadow-lg border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-discord-darker rounded w-1/4"></div>
          <div className="h-12 bg-discord-darker rounded"></div>
          <div className="h-12 bg-discord-darker rounded"></div>
          <div className="h-12 bg-discord-darker rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-discord-dark rounded-lg overflow-hidden shadow-lg border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-discord-darker text-discord-light text-left">
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Model</th>
                <th className="p-4 font-medium">API Key</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-discord-darker transition-colors">
                    <td className="p-4 flex items-center">
                      <div className={`h-8 w-8 rounded-full ${getAvatarColor(user.username)} flex items-center justify-center mr-3`}>
                        <span className="text-sm font-semibold">{getInitials(user.username)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-discord-light">{user.role}</div>
                      </div>
                    </td>
                    <td className="p-4 text-discord-lighter">{user.model}</td>
                    <td className="p-4 text-discord-lighter">
                      <span className="bg-discord-darkest px-2 py-1 rounded text-sm">••••••••••••</span>
                    </td>
                    <td className="p-4">
                      <span className={`${user.isActive ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'} text-xs px-2 py-1 rounded-full`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          className="text-discord-blue hover:text-discord-lighter transition-colors"
                          onClick={() => onEdit(user)}
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </button>
                        <button 
                          className="text-discord-red hover:text-discord-lighter transition-colors"
                          onClick={() => handleDeleteClick(user.id)}
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-discord-light">
                    No users found. Add a new user to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-discord-darker p-4 flex items-center justify-between">
          <div className="text-sm text-discord-light">
            {users.length > 0 ? (
              `Showing 1-${users.length} of ${users.length} users`
            ) : (
              "No users found"
            )}
          </div>
          <div className="flex space-x-2">
            <button className="bg-discord-dark text-discord-light px-3 py-1 rounded disabled:opacity-50" disabled>
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <button className="bg-discord-blue text-white px-3 py-1 rounded">1</button>
            <button className="bg-discord-dark text-discord-light px-3 py-1 rounded disabled:opacity-50" disabled>
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-discord-dark border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-discord-light">
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-discord-darker text-discord-light hover:bg-discord-darkest hover:text-white border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-discord-red text-white hover:bg-opacity-80"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
