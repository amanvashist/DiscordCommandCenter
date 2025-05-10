import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UserList from "@/components/UserList";
import UserForm from "@/components/UserForm";
import { BotUser } from "@shared/schema";

export default function UserConfig() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<BotUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Users");

  const { data: botUsers, isLoading } = useQuery<BotUser[]>({
    queryKey: ['/api/bot-users'],
  });

  // Filter users based on search term and role filter
  const filteredUsers = botUsers?.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.discordId.includes(searchTerm);
    
    const matchesRole = 
      roleFilter === "All Users" ||
      (roleFilter === "Administrators" && user.role === "Admin") ||
      (roleFilter === "Regular Users" && user.role === "User");
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: BotUser) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleFormSave = () => {
    // Will be handled by the form component
    setShowForm(false);
    setSelectedUser(null);
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/bot-users'] });
  };

  return (
    <main className="p-4 md:p-6 flex-1 overflow-auto">
      {!showForm ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">User Configuration</h2>
            <button 
              onClick={handleAddUser}
              className="bg-discord-blue hover:bg-opacity-80 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              <i className="ri-add-line mr-1"></i> Add User
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Search & Filter */}
            <div className="bg-discord-darker p-4 rounded-lg flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-discord-light"></i>
                </div>
                <input 
                  type="text" 
                  className="bg-discord-darkest w-full pl-10 pr-4 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter placeholder:text-discord-light" 
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <select 
                  className="bg-discord-darkest px-3 py-2 rounded-md border border-gray-700 focus:border-discord-blue focus:outline-none text-discord-lighter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option>All Users</option>
                  <option>Administrators</option>
                  <option>Regular Users</option>
                </select>
                <button className="bg-discord-dark px-3 py-2 rounded-md border border-gray-700 hover:bg-discord-darker transition-colors">
                  <i className="ri-filter-3-line text-discord-light"></i>
                </button>
              </div>
            </div>
          </div>

          <UserList 
            users={filteredUsers}
            isLoading={isLoading}
            onEdit={handleEditUser}
          />
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <span>User Configuration</span>
              <i className="ri-arrow-right-s-line mx-2"></i>
              <span>{selectedUser ? "Edit User" : "Add User"}</span>
            </h2>
            <button 
              onClick={handleFormClose}
              className="text-discord-lighter hover:text-white transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <UserForm 
            user={selectedUser} 
            onCancel={handleFormClose} 
            onSave={handleFormSave} 
          />
        </div>
      )}
    </main>
  );
}
