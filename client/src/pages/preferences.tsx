import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PageHeader from '@/components/layout/page-header';
import NotificationSettings from '@/components/preferences/notification-settings';
import UserProfileForm from '@/components/preferences/user-profile-form';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// Sample data for demo
const initialPreferences = {
  notifications: {
    enabled: true,
    threshold: 75,
    email: true,
    push: true,
    sms: false
  },
  favorites: {
    zones: ['Zone A', 'Zone C'],
    seatingTypes: ['quiet', 'window']
  },
  profile: {
    name: 'Somchai P.',
    studentId: '6XXXXXXXX',
    email: '6XXXXXXXX@student.chula.ac.th',
    program: 'Computer Engineering',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
};

const Preferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [activeTab, setActiveTab] = useState('notifications');
  
  // Update notification settings
  const handleNotificationUpdate = (notificationSettings: any) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...notificationSettings
      }
    }));
    
    toast({
      title: 'Notification preferences updated',
      description: 'Your notification settings have been saved.'
    });
  };
  
  // Update profile information
  const handleProfileUpdate = (profileData: any) => {
    setPreferences(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileData
      }
    }));
    
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been saved.'
    });
  };
  
  // Update favorite zones
  const handleFavoriteUpdate = (favoriteData: any) => {
    setPreferences(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        ...favoriteData
      }
    }));
    
    toast({
      title: 'Favorites updated',
      description: 'Your favorite settings have been saved.'
    });
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Preferences & Settings" 
        subtitle="Customize your experience with the library occupancy tracker"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <Tabs 
              orientation="vertical" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto w-full bg-transparent justify-start items-start space-y-1">
                <TabsTrigger 
                  value="notifications"
                  className="w-full justify-start px-3 font-normal"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="w-full justify-start px-3 font-normal"
                >
                  User Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="w-full justify-start px-3 font-normal"
                >
                  Favorite Zones
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="w-full justify-start px-3 font-normal"
                >
                  Privacy Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3 space-y-6">
          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationSettings 
                  settings={preferences.notifications} 
                  onUpdate={handleNotificationUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <UserProfileForm 
                  profile={preferences.profile} 
                  onUpdate={handleProfileUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Select your favorite zones to quickly find them or get notified when they have availability.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Favorite Zones</h3>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="zone-a" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.zones.includes('Zone A')}
                            onChange={() => {}}
                          />
                          <label htmlFor="zone-a" className="ml-2 text-sm text-gray-700">Zone A - Reading Area</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="zone-b" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.zones.includes('Zone B')}
                            onChange={() => {}}
                          />
                          <label htmlFor="zone-b" className="ml-2 text-sm text-gray-700">Zone B - Computer Lab</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="zone-c" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.zones.includes('Zone C')}
                            onChange={() => {}}
                          />
                          <label htmlFor="zone-c" className="ml-2 text-sm text-gray-700">Zone C - Group Study</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="zone-d" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.zones.includes('Zone D')}
                            onChange={() => {}}
                          />
                          <label htmlFor="zone-d" className="ml-2 text-sm text-gray-700">Zone D - Quiet Zone</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Favorite Seating Types</h3>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="seat-quiet" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.seatingTypes.includes('quiet')}
                            onChange={() => {}}
                          />
                          <label htmlFor="seat-quiet" className="ml-2 text-sm text-gray-700">Quiet Seating</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="seat-group" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.seatingTypes.includes('group')}
                            onChange={() => {}}
                          />
                          <label htmlFor="seat-group" className="ml-2 text-sm text-gray-700">Group Tables</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="seat-window" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.seatingTypes.includes('window')}
                            onChange={() => {}}
                          />
                          <label htmlFor="seat-window" className="ml-2 text-sm text-gray-700">Window Seats</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="seat-computer" 
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={preferences.favorites.seatingTypes.includes('computer')}
                            onChange={() => {}}
                          />
                          <label htmlFor="seat-computer" className="ml-2 text-sm text-gray-700">Computer Stations</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Control how your information is used and displayed in the application.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Anonymous Posts by Default</h3>
                        <p className="text-xs text-gray-500">Your name and profile will not be shown with your posts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Usage Analytics</h3>
                        <p className="text-xs text-gray-500">Allow the system to collect anonymized usage data</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" checked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Show Online Status</h3>
                        <p className="text-xs text-gray-500">Let others see when you are actively using the app</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
