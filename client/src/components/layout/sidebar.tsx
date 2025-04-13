import React from 'react';
import { Link, useLocation } from "wouter";
import CuLogo from "@/assets/icons/CuLogo";
import {
  LayoutDashboard,
  BarChart,
  Users,
  Map,
  Settings,
  Shield,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Sidebar: React.FC = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Mock user data for the demo
  const user = {
    name: 'Somchai P.',
    studentId: '6XXXXXXXX',
    profileImage: null,
    role: 'admin' // For demo purposes, set as admin to show admin panel
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Social Seating', href: '/social-seating', icon: Users },
    { name: 'Library Map', href: '/library-map', icon: Map },
    { name: 'Preferences', href: '/preferences', icon: Settings },
  ];

  // Admin link only visible for admin users
  const adminLinks = [
    { name: 'Admin Panel', href: '/admin', icon: Shield }
  ];

  const handleLogout = () => {
    // Clear the session
    sessionStorage.removeItem('isLoggedIn');
    
    // Show toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Navigate to login page
    navigate('/auth');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
      <div className="mb-6 flex items-center">
        <CuLogo className="mr-3" />
        <h1 className="font-heading font-bold text-lg text-gray-900">CU Library Tracker</h1>
      </div>
      
      <nav className="space-y-1 mt-4">
        {navigation.map((item) => {
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'text-primary bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        {/* Admin links - only shown for admin users */}
        {user.role === 'admin' && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </p>
              </div>
            </div>
            
            {adminLinks.map((item) => {
              const isActive = location === item.href;
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'text-primary bg-primary-50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="px-3 py-2">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              {user?.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-primary text-white">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              )}
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name || 'Guest'}</p>
              <p className="text-xs font-medium text-gray-500">{user?.studentId || ''}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
