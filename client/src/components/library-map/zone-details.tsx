import React from 'react';
import { LibraryZone } from '@/assets/library-map';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Cpu, 
  Printer, 
  BookOpen, 
  VolumeX, 
  Wifi, 
  EthernetPort,
  MonitorSmartphone 
} from 'lucide-react';

interface ZoneDetailsProps {
  zone: LibraryZone;
}

const getStatusColor = (percentage: number) => {
  if (percentage < 50) return "bg-green-500";
  if (percentage < 80) return "bg-amber-500";
  return "bg-red-500";
};

const getStatusText = (percentage: number) => {
  if (percentage < 50) return "Available";
  if (percentage < 80) return "Filling up";
  return "Nearly full";
};

const getStatusBadgeColors = (percentage: number) => {
  if (percentage < 50) return "bg-green-100 text-green-800";
  if (percentage < 80) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

// Map zone resources
const zoneResources = {
  1: [
    { name: 'Reading Desks', icon: BookOpen, count: 80 },
    { name: 'Power Outlets', icon: EthernetPort, count: 60 },
    { name: 'Quiet Area', icon: VolumeX, count: 1 },
    { name: 'Wi-Fi', icon: Wifi, count: 1 }
  ],
  2: [
    { name: 'Computers', icon: Cpu, count: 40 },
    { name: 'Printers', icon: Printer, count: 2 },
    { name: 'Scanners', icon: MonitorSmartphone, count: 1 },
    { name: 'Power Outlets', icon: EthernetPort, count: 50 }
  ],
  3: [
    { name: 'Group Tables', icon: Users, count: 15 },
    { name: 'Whiteboards', icon: BookOpen, count: 8 },
    { name: 'Power Outlets', icon: EthernetPort, count: 40 },
    { name: 'Wi-Fi', icon: Wifi, count: 1 }
  ],
  4: [
    { name: 'Silent Desks', icon: VolumeX, count: 40 },
    { name: 'Power Outlets', icon: EthernetPort, count: 20 },
    { name: 'Wi-Fi', icon: Wifi, count: 1 }
  ]
};

const ZoneDetails: React.FC<ZoneDetailsProps> = ({ zone }) => {
  // Get resources for this zone
  const resources = zoneResources[zone.id as keyof typeof zoneResources] || [];
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">{zone.name}</h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-500">Occupancy</span>
          <Badge variant="outline" className={getStatusBadgeColors(zone.percentage)}>
            {getStatusText(zone.percentage)}
          </Badge>
        </div>
        <Progress
          value={zone.percentage}
          className="h-2 bg-gray-200"
          indicatorClassName={getStatusColor(zone.percentage)}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{zone.current} / {zone.capacity} seats occupied</span>
          <span>{zone.percentage}%</span>
        </div>
      </div>
      
      <div className="border-t pt-3">
        <h4 className="text-sm font-medium mb-2">Available Resources</h4>
        <div className="grid grid-cols-2 gap-2">
          {resources.map((resource) => (
            <div key={resource.name} className="flex items-center gap-2 text-sm text-gray-700">
              <resource.icon className="h-4 w-4 text-primary-600" />
              <span>
                {resource.name}
                {resource.count > 1 && <span className="text-gray-500 ml-1">({resource.count})</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t mt-3 pt-3">
        <h4 className="text-sm font-medium mb-2">Best Times to Visit</h4>
        <div className="text-sm text-gray-700">
          <p>Morning: 8:00 - 10:00</p>
          <p>Afternoon: 15:00 - 17:00</p>
          <p>Evening: After 19:00</p>
        </div>
      </div>
    </div>
  );
};

export default ZoneDetails;
