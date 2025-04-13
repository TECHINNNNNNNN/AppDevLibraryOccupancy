import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CuLogo from "@/assets/icons/CuLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

const Header: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <CuLogo className="mr-2" />
              <h1 className="font-heading font-bold text-lg text-gray-900">Library Tracker</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </Button>
              <div className="ml-3 relative md:hidden">
                <Avatar className="h-8 w-8">
                  {user?.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-white">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
