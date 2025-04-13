import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import LibraryMapSvg, { LibraryZone } from '@/assets/library-map';
import ZoneDetails from '@/components/library-map/zone-details';
import ResourceFilter from '@/components/library-map/resource-filter';
import { useSocket, sendSocketMessage } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

const LibraryMapPage: React.FC = () => {
  const [_, params] = useLocation();
  const queryParams = new URLSearchParams(params);
  const initialZoneId = queryParams.get('zone') ? parseInt(queryParams.get('zone')!) : null;
  
  const [selectedZone, setSelectedZone] = useState<LibraryZone | null>(null);
  const [selectedView, setSelectedView] = useState('occupancy');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [zones, setZones] = useState<LibraryZone[]>([
    { id: 1, name: 'Zone A - Reading Area', current: 32, capacity: 100, percentage: 32 },
    { id: 2, name: 'Zone B - Computer Lab', current: 47, capacity: 50, percentage: 94 },
    { id: 3, name: 'Zone C - Group Study', current: 54, capacity: 80, percentage: 68 },
    { id: 4, name: 'Zone D - Quiet Zone', current: 22, capacity: 40, percentage: 55 }
  ]);
  
  const { toast } = useToast();
  
  // Socket connection
  const { subscribe } = useSocket(() => {
    sendSocketMessage('getOccupancy');
  });
  
  useEffect(() => {
    // Find the initially selected zone if any
    if (initialZoneId !== null) {
      const zone = zones.find(z => z.id === initialZoneId);
      if (zone) {
        setSelectedZone(zone);
      }
    }
  }, [initialZoneId, zones]);
  
  // Subscribe to socket updates
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      if (message.type === 'occupancyUpdate' && message.data.zones) {
        setZones(message.data.zones);
        
        // Update selected zone if any
        if (selectedZone) {
          const updatedZone = message.data.zones.find((z: LibraryZone) => z.id === selectedZone.id);
          if (updatedZone) {
            setSelectedZone(updatedZone);
          }
        }
      } else if (message.type === 'initialData' && message.data.occupancy?.zones) {
        setZones(message.data.occupancy.zones);
      }
    });
    
    return () => unsubscribe();
  }, [subscribe, selectedZone]);
  
  const handleZoneClick = (zoneId: number) => {
    const zone = zones.find(z => z.id === zoneId);
    setSelectedZone(zone || null);
  };
  
  const handleResourceFilter = (resource: string | null) => {
    setSelectedResource(resource);
    toast({
      title: resource ? `Filtering by ${resource}` : 'All resources shown',
      description: 'Resource filtering is a demo feature.',
    });
  };
  
  // Zone status badges
  const statusBadges = (
    <div className="flex space-x-2">
      <Badge variant="outline" className="bg-green-100 text-green-800">
        <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
        Available
      </Badge>
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
        <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span>
        Filling up
      </Badge>
      <Badge variant="outline" className="bg-red-100 text-red-800">
        <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span>
        Nearly full
      </Badge>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Library Map" 
        subtitle="Interactive map showing different zones and available resources"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
              <CardTitle className="text-lg font-medium text-gray-900">
                {selectedView === 'occupancy' ? 'Current Occupancy Map' : 'Available Resources Map'}
              </CardTitle>
              <div className="flex items-center space-x-4">
                <Tabs value={selectedView} onValueChange={setSelectedView}>
                  <TabsList>
                    <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                  </TabsList>
                </Tabs>
                {statusBadges}
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="w-full h-[600px] bg-gray-50 rounded-lg p-4 overflow-hidden relative">
                <LibraryMapSvg 
                  zones={zones} 
                  onZoneClick={handleZoneClick} 
                />
                
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">Current Highlights</div>
                  <div className="mt-1 text-xs text-gray-500">Computer Lab (Zone B) is nearly full</div>
                  <div className="mt-1 text-xs text-gray-500">Best seating: Zone A (Reading Area)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Zone Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedZone ? (
                <ZoneDetails zone={selectedZone} />
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Select a zone on the map to see details
                </div>
              )}
            </CardContent>
          </Card>
          
          <ResourceFilter 
            selectedResource={selectedResource} 
            onSelectResource={handleResourceFilter}
          />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <h4 className="text-sm font-medium">Zone Colors</h4>
                  {statusBadges}
                </div>
                
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium mb-2">Zone Types</h4>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span className="text-sm text-gray-600">Reading Area</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                      <span className="text-sm text-gray-600">Computer Lab</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                      <span className="text-sm text-gray-600">Group Study</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
                      <span className="text-sm text-gray-600">Quiet Zone</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full gap-2">
            <FileDown className="h-4 w-4" />
            Download Map PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LibraryMapPage;
