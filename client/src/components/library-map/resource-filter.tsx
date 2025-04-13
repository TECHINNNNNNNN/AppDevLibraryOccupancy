import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Cpu, 
  Printer, 
  BookOpen, 
  VolumeX, 
  Wifi, 
  EthernetPort,
  Users,
  MonitorSmartphone 
} from 'lucide-react';

interface ResourceFilterProps {
  selectedResource: string | null;
  onSelectResource: (resource: string | null) => void;
}

const resources = [
  { id: null, name: 'All Resources', icon: Wifi },
  { id: 'computers', name: 'Computers', icon: Cpu },
  { id: 'printers', name: 'Printers', icon: Printer },
  { id: 'quiet', name: 'Quiet Areas', icon: VolumeX },
  { id: 'group', name: 'Group Tables', icon: Users },
  { id: 'power', name: 'Power Outlets', icon: EthernetPort },
  { id: 'scanners', name: 'Scanners', icon: MonitorSmartphone }
];

const ResourceFilter: React.FC<ResourceFilterProps> = ({ 
  selectedResource, 
  onSelectResource 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filter by Resource</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          defaultValue={selectedResource || ''} 
          onValueChange={(value) => onSelectResource(value === '' ? null : value)}
        >
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id || 'all'} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={resource.id || ''} 
                  id={`resource-${resource.id || 'all'}`} 
                />
                <Label 
                  htmlFor={`resource-${resource.id || 'all'}`} 
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <resource.icon className="h-4 w-4 text-primary-600" />
                  {resource.name}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ResourceFilter;
