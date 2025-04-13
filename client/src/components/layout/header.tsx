import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CuLogo from "@/assets/icons/CuLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Mock user data for the demo
  const user = {
    name: 'Somchai P.',
    studentId: '6XXXXXXXX',
    profileImage: null
  };
  
  const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');
    
    // Show logout toast
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to auth page
    navigate('/auth');
  };
  
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar>
                        {user?.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-primary text-white">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.studentId}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/preferences')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
