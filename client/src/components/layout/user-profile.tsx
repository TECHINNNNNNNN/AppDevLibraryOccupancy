import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = "" }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className={`px-3 py-2 ${className}`}>
      <div className="flex items-center">
        <Avatar className="h-8 w-8">
          {user.profileImage ? (
            <AvatarImage src={user.profileImage} alt={user.name} />
          ) : (
            <AvatarFallback className="bg-primary text-white">{user.name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700">{user.name}</p>
          <p className="text-xs font-medium text-gray-500">{user.studentId}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={() => logout()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserProfile;
