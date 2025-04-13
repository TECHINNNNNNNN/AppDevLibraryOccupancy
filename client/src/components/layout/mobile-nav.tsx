import React from 'react';
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  BarChart,
  Users,
  Map
} from "lucide-react";

const MobileNav: React.FC = () => {
  const [location] = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Seats', href: '/social-seating', icon: Users },
    { name: 'Map', href: '/library-map', icon: Map },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <nav className="flex justify-around px-4 py-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`px-3 py-2 text-sm font-medium flex flex-col items-center justify-center ${
                isActive ? 'text-primary' : 'text-gray-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav;
