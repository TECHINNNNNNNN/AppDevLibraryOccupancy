import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { File, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnnouncementBanner from '@/components/dashboard/announcement-banner';
import OccupancyCard from '@/components/dashboard/occupancy-card';
import AvailableSeatsCard from '@/components/dashboard/available-seats-card';
import RecentEntriesCard from '@/components/dashboard/recent-entries-card';
import WaitTimeCard from '@/components/dashboard/wait-time-card';
import OccupancyChart from '@/components/dashboard/occupancy-chart';
import SocialActivity, { SocialUpdate } from '@/components/dashboard/social-activity';
import LibraryMap from '@/components/dashboard/library-map';
import { useSocket, sendSocketMessage } from '@/lib/socket';
import { LibraryZone } from '@/assets/library-map';

const Dashboard: React.FC = () => {
  const [_, navigate] = useLocation();
  const [occupancy, setOccupancy] = useState({
    current: 237,
    total: 400,
    percentage: 59
  });
  const [zones, setZones] = useState<LibraryZone[]>([
    { id: 1, name: 'Zone A - Reading Area', current: 32, capacity: 100, percentage: 32 },
    { id: 2, name: 'Zone B - Computer Lab', current: 47, capacity: 50, percentage: 94 },
    { id: 3, name: 'Zone C - Group Study', current: 54, capacity: 80, percentage: 68 },
    { id: 4, name: 'Zone D - Quiet Zone', current: 22, capacity: 40, percentage: 55 }
  ]);
  const [announcement, setAnnouncement] = useState('The library will close early at 20:00 today due to system maintenance. Please plan accordingly.');
  const [socialUpdates, setSocialUpdates] = useState<SocialUpdate[]>([
    {
      id: '1',
      user: {
        id: '1',
        name: 'Tanawat K.',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      time: 'Shared a study spot 5 min ago',
      message: 'Found a great quiet spot in Zone C near the windows. Will be here for about 2 hours.',
      type: 'spot_share',
      verifications: 3
    },
    {
      id: '2',
      user: {
        id: '2',
        name: 'Sirinda P.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      time: 'Updated seat status 15 min ago',
      message: 'Group study room 3 is available now. Just left and cleaned up.',
      type: 'update',
      tags: ['Group Room']
    },
    {
      id: '3',
      user: {
        id: '3',
        name: 'Pattarapol S.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      time: 'Posted 32 min ago',
      message: 'Computer stations in Zone B are filling up fast! Only 3 left.',
      type: 'alert',
      tags: ['Computers']
    }
  ]);
  
  // Chart data
  const chartData = {
    labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    values: [45, 87, 156, 201, 245, 267, 310, 345, 290, 234, 178, 145, 120, 98, 65]
  };
  
  // Socket connection
  const { subscribe } = useSocket(() => {
    // Initialize by requesting the current occupancy data
    sendSocketMessage('getOccupancy');
  });
  
  // Subscribe to socket updates
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.type === 'occupancyUpdate') {
        setOccupancy({
          current: message.data.current,
          total: message.data.total,
          percentage: Math.round((message.data.current / message.data.total) * 100)
        });
        
        if (message.data.zones) {
          setZones(message.data.zones);
        }
      } else if (message.type === 'initialData') {
        // Handle initial data
        if (message.data.occupancy) {
          setOccupancy({
            current: message.data.occupancy.current,
            total: message.data.occupancy.total,
            percentage: Math.round((message.data.occupancy.current / message.data.occupancy.total) * 100)
          });
          
          if (message.data.occupancy.zones) {
            setZones(message.data.occupancy.zones);
          }
        }
        
        if (message.data.announcements && message.data.announcements.length > 0) {
          setAnnouncement(message.data.announcements[0].message);
        }
      }
    });
    
    return () => unsubscribe();
  }, [subscribe]);
  
  // Calculate available seats
  const availableSeats = {
    total: occupancy.total - occupancy.current,
    percentChange: 12,
    quiet: 32,
    group: 54,
    computer: 15
  };
  
  // Recent entries data
  const recentEntries = {
    count: 24,
    timeFrame: 'last 15 min',
    percentChange: 12.5,
    compareText: 'increase compared to last hour',
    users: [
      { id: '1', name: 'User 1', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '2', name: 'User 2', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '3', name: 'User 3', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '4', name: 'User 4', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { id: '5', name: 'User 5', avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
    ],
    additionalUsers: 19
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-heading font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{format(new Date(), 'HH:mm')}</span> - Library open until 22:00
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="outline" className="gap-2">
            <File className="h-5 w-5 text-gray-500" />
            Export Data
          </Button>
          <Button className="ml-3 gap-2">
            <Eye className="h-5 w-5" />
            View Library
          </Button>
        </div>
      </div>

      {/* Announcement banner */}
      <AnnouncementBanner message={announcement} />

      {/* Current Occupancy */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <OccupancyCard 
          current={occupancy.current} 
          total={occupancy.total} 
          percentage={occupancy.percentage} 
        />
        
        <AvailableSeatsCard 
          available={availableSeats.total}
          percentChange={availableSeats.percentChange}
          zoneData={{
            quiet: availableSeats.quiet,
            group: availableSeats.group,
            computer: availableSeats.computer
          }}
          onFindSeat={() => navigate('/social-seating')}
        />
        
        <RecentEntriesCard 
          count={recentEntries.count}
          timeFrame={recentEntries.timeFrame}
          percentChange={recentEntries.percentChange}
          compareText={recentEntries.compareText}
          users={recentEntries.users}
          additionalUsers={recentEntries.additionalUsers}
        />
        
        <WaitTimeCard 
          estimatedTime="~5 min"
          bestTimeToVisit="After 17:00"
          trafficLevel="Moderate"
        />
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <OccupancyChart 
          data={chartData}
          onViewAnalytics={() => navigate('/analytics')}
        />
        
        <SocialActivity 
          updates={socialUpdates}
          newUpdatesCount={3}
          onViewAll={() => navigate('/social-seating')}
          onCreatePost={() => navigate('/social-seating')}
        />
      </div>

      {/* Library Map */}
      <LibraryMap 
        zones={zones}
        lastUpdated="2 minutes ago"
        onViewDetailedMap={() => navigate('/library-map')}
        onZoneClick={(zoneId) => navigate(`/library-map?zone=${zoneId}`)}
      />
    </div>
  );
};

export default Dashboard;
