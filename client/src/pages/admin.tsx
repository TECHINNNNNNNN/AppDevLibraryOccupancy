import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileDown, Users, Settings, Bell, Database } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import { useSocket, sendSocketMessage } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

interface Zone {
  id: number;
  name: string;
  capacity: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

interface Announcement {
  id: number;
  message: string;
  expiryDate: string;
  priority: string;
  active: boolean;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('capacity');
  const [zones, setZones] = useState<Zone[]>([
    { id: 1, name: 'Zone A - Reading Area', capacity: 100 },
    { id: 2, name: 'Zone B - Computer Lab', capacity: 50 },
    { id: 3, name: 'Zone C - Group Study', capacity: 80 },
    { id: 4, name: 'Zone D - Quiet Zone', capacity: 40 }
  ]);
  const [totalCapacity, setTotalCapacity] = useState(270);
  const [editingZone, setEditingZone] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Somchai P.', email: 'somchai.p@student.chula.ac.th', role: 'User', lastActive: '2023-05-15 14:23' },
    { id: 2, name: 'Apinya L.', email: 'apinya.l@chula.ac.th', role: 'Admin', lastActive: '2023-05-15 10:45' },
    { id: 3, name: 'Tanawat K.', email: 'tanawat.k@student.chula.ac.th', role: 'User', lastActive: '2023-05-14 18:30' },
    { id: 4, name: 'Sirada C.', email: 'sirada.c@student.chula.ac.th', role: 'User', lastActive: '2023-05-15 12:10' },
    { id: 5, name: 'Pattarapol S.', email: 'pattarapol.s@student.chula.ac.th', role: 'Moderator', lastActive: '2023-05-15 09:17' }
  ]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { 
      id: 1, 
      message: 'Library will close early at 8 PM today for maintenance', 
      expiryDate: '2023-05-15', 
      priority: 'High',
      active: true
    },
    { 
      id: 2, 
      message: 'Group study zone will be under renovation next week', 
      expiryDate: '2023-05-20', 
      priority: 'Medium',
      active: true
    },
    { 
      id: 3, 
      message: 'New books available in Engineering section', 
      expiryDate: '2023-06-01', 
      priority: 'Low',
      active: true
    }
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    message: '',
    expiryDate: '',
    priority: 'Medium'
  });
  
  const { toast } = useToast();
  
  // Socket connection
  const { subscribe } = useSocket(() => {
    sendSocketMessage('getAdminData');
  });
  
  useEffect(() => {
    // Subscribe to socket updates
    const unsubscribe = subscribe((message) => {
      if (message.type === 'capacityUpdate') {
        setZones(message.data.zones);
        setTotalCapacity(message.data.totalCapacity);
      }
    });
    
    return () => unsubscribe();
  }, [subscribe]);
  
  const handleCapacityChange = (zoneId: number, capacity: number) => {
    const updatedZones = zones.map(zone => 
      zone.id === zoneId ? { ...zone, capacity } : zone
    );
    
    setZones(updatedZones);
  };
  
  const saveCapacityChanges = () => {
    // In a real app, this would send changes to the backend
    const newTotalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);
    setTotalCapacity(newTotalCapacity);
    setEditingZone(null);
    
    // Emit update via socket
    sendSocketMessage('updateCapacity', {
      totalCapacity: newTotalCapacity,
      zoneCapacities: zones.reduce((obj, zone) => ({
        ...obj,
        [zone.id]: zone.capacity
      }), {})
    });
    
    toast({
      title: 'Capacity settings updated',
      description: 'Library capacity settings have been saved successfully.',
    });
  };
  
  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.message || !newAnnouncement.expiryDate) {
      toast({
        title: 'Incomplete announcement',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    const announcement: Announcement = {
      id: announcements.length + 1,
      message: newAnnouncement.message,
      expiryDate: newAnnouncement.expiryDate,
      priority: newAnnouncement.priority,
      active: true
    };
    
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({
      message: '',
      expiryDate: '',
      priority: 'Medium'
    });
    
    toast({
      title: 'Announcement created',
      description: 'Your announcement has been published to the dashboard.',
    });
  };
  
  const toggleAnnouncementStatus = (id: number) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, active: !announcement.active } 
          : announcement
      )
    );
    
    toast({
      title: 'Announcement status updated',
      description: 'The announcement status has been toggled.',
    });
  };
  
  const handleExportData = (dataType: string) => {
    toast({
      title: `Exporting ${dataType} data`,
      description: 'Your export is being prepared and will download shortly.',
    });
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admin Panel" 
        subtitle="Manage library settings, users, and announcements"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleExportData('all')}
          >
            <FileDown className="h-4 w-4" />
            Export All Data
          </Button>
        }
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capacity">
            <Settings className="h-4 w-4 mr-2" />
            Capacity
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Bell className="h-4 w-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Database className="h-4 w-4 mr-2" />
            System Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="capacity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Total Library Capacity: {totalCapacity}</h3>
                  <Button 
                    onClick={() => editingZone ? saveCapacityChanges() : setEditingZone(0)}
                  >
                    {editingZone !== null ? 'Save Changes' : 'Edit Capacity'}
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead className="text-right">Capacity</TableHead>
                      {editingZone !== null && <TableHead></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map(zone => (
                      <TableRow key={zone.id}>
                        <TableCell>{zone.name}</TableCell>
                        <TableCell className="text-right">
                          {editingZone !== null ? (
                            <Input
                              type="number"
                              value={zone.capacity}
                              onChange={(e) => handleCapacityChange(zone.id, parseInt(e.target.value))}
                              className="w-24 ml-auto"
                              min="1"
                            />
                          ) : (
                            zone.capacity
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {editingZone !== null && (
                  <div className="text-sm text-gray-500 mt-2">
                    * Changes will not take effect until you save them.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {users.length} users
                  </div>
                  <Button variant="outline" onClick={() => handleExportData('users')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Users
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="announcements" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Announcement Message
                    </label>
                    <Input
                      value={newAnnouncement.message}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                      placeholder="Enter announcement message"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <Input
                        type="date"
                        value={newAnnouncement.expiryDate}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, expiryDate: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleCreateAnnouncement}
                >
                  Publish Announcement
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map(announcement => (
                    <TableRow key={announcement.id}>
                      <TableCell>{announcement.message}</TableCell>
                      <TableCell>{announcement.expiryDate}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          announcement.priority === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : announcement.priority === 'Medium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {announcement.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {announcement.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleAnnouncementStatus(announcement.id)}
                        >
                          {announcement.active ? 'Disable' : 'Enable'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing last 100 system events
                  </div>
                  <Button variant="outline" onClick={() => handleExportData('logs')}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-96 overflow-y-auto font-mono text-xs">
                  <div className="text-gray-500">[2023-05-15 14:23:45] INFO: User login: somchai.p@student.chula.ac.th</div>
                  <div className="text-gray-500">[2023-05-15 14:22:30] INFO: Library capacity updated: Zone B - 50 → 55</div>
                  <div className="text-green-600">[2023-05-15 14:20:12] SUCCESS: System backup completed</div>
                  <div className="text-gray-500">[2023-05-15 14:15:33] INFO: Occupancy update: Current: 155, Capacity: 270</div>
                  <div className="text-yellow-600">[2023-05-15 14:10:27] WARNING: Zone B approaching capacity (94%)</div>
                  <div className="text-gray-500">[2023-05-15 14:05:18] INFO: New announcement created: ID #2</div>
                  <div className="text-red-600">[2023-05-15 14:00:55] ERROR: Database connection timeout</div>
                  <div className="text-gray-500">[2023-05-15 13:55:32] INFO: User login: apinya.l@chula.ac.th</div>
                  <div className="text-gray-500">[2023-05-15 13:50:17] INFO: User logout: pattarapol.s@student.chula.ac.th</div>
                  <div className="text-gray-500">[2023-05-15 13:45:09] INFO: User post created: ID #15</div>
                  <div className="text-gray-500">[2023-05-15 13:40:28] INFO: Occupancy update: Current: 142, Capacity: 270</div>
                  <div className="text-gray-500">[2023-05-15 13:35:41] INFO: User login: pattarapol.s@student.chula.ac.th</div>
                  <div className="text-gray-500">[2023-05-15 13:30:22] INFO: User profile updated: ID #5</div>
                  <div className="text-yellow-600">[2023-05-15 13:25:19] WARNING: API rate limit reached for client 192.168.1.105</div>
                  <div className="text-gray-500">[2023-05-15 13:20:34] INFO: Occupancy update: Current: 137, Capacity: 270</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel; 