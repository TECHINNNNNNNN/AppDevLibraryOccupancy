import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Computer, Printer, Wifi, Coffee, Lightbulb, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface Resource {
  id: string;
  name: string;
  icon: React.ReactNode;
  zoneIds: number[];
}

interface Zone {
  id: number;
  name: string;
  resources: string[];
}

interface ResourceSearchProps {
  zones: Zone[];
  onZoneSelect: (zoneId: number) => void;
  onResourceSelect?: (resourceId: string) => void;
}

const ResourceSearch: React.FC<ResourceSearchProps> = ({ 
  zones, 
  onZoneSelect,
  onResourceSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  
  // Available resources
  const resources: Resource[] = [
    { 
      id: 'computers', 
      name: 'Computers', 
      icon: <Computer className="h-4 w-4" />,
      zoneIds: zones.filter(z => z.resources.includes('computers')).map(z => z.id)
    },
    { 
      id: 'quiet', 
      name: 'Quiet Area', 
      icon: <Lightbulb className="h-4 w-4" />,
      zoneIds: zones.filter(z => z.resources.includes('quiet_area')).map(z => z.id)
    },
    { 
      id: 'printers', 
      name: 'Printers', 
      icon: <Printer className="h-4 w-4" />,
      zoneIds: zones.filter(z => z.resources.includes('printers')).map(z => z.id)
    },
    { 
      id: 'books', 
      name: 'Book Shelves', 
      icon: <BookOpen className="h-4 w-4" />,
      zoneIds: zones.filter(z => z.resources.includes('books')).map(z => z.id)
    },
    { 
      id: 'wifi', 
      name: 'Strong Wifi', 
      icon: <Wifi className="h-4 w-4" />,
      zoneIds: zones.filter(z => z.resources.includes('wifi')).map(z => z.id)
    },
    { 
      id: 'cafe', 
      name: 'Near Cafe', 
      icon: <Coffee className="h-4 w-4" />,
      zoneIds: zones.filter(z => z.resources.includes('cafe')).map(z => z.id)
    }
  ];
  
  useEffect(() => {
    // Filter zones based on search term and selected resources
    let filtered = [...zones];
    
    // Filter by search term
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(zone => 
        zone.name.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Filter by selected resources
    if (selectedResources.length > 0) {
      filtered = filtered.filter(zone => {
        // Check if zone has all selected resources
        return selectedResources.every(resourceId => {
          const resource = resources.find(r => r.id === resourceId);
          return resource?.zoneIds.includes(zone.id);
        });
      });
    }
    
    setFilteredZones(filtered);
  }, [searchTerm, selectedResources, zones, resources]);
  
  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
    
    if (onResourceSelect) {
      onResourceSelect(resourceId);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedResources([]);
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search for zones..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
        {(searchTerm || selectedResources.length > 0) && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearFilters}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-3 w-3" />
              Resources
              {selectedResources.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {selectedResources.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {resources.map((resource) => (
              <DropdownMenuCheckboxItem
                key={resource.id}
                checked={selectedResources.includes(resource.id)}
                onCheckedChange={() => handleResourceToggle(resource.id)}
              >
                <div className="flex items-center">
                  {resource.icon}
                  <span className="ml-2">{resource.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setSelectedResources([])}
                disabled={selectedResources.length === 0}
              >
                Clear Filters
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {selectedResources.map(resourceId => {
          const resource = resources.find(r => r.id === resourceId);
          return resource ? (
            <Badge key={resourceId} variant="outline" className="flex gap-1 items-center">
              {resource.icon}
              {resource.name}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 p-0" 
                onClick={() => handleResourceToggle(resourceId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ) : null;
        })}
      </div>
      
      {filteredZones.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 mt-2">
          {filteredZones.map((zone) => (
            <Card 
              key={zone.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onZoneSelect(zone.id)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{zone.name}</h3>
                    <div className="flex gap-1 mt-1">
                      {zone.resources.map(resourceId => {
                        const resource = resources.find(r => r.id === resourceId);
                        return resource ? (
                          <div key={resourceId} className="text-gray-500">
                            {resource.icon}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No zones match your search criteria
        </div>
      )}
    </div>
  );
};

export default ResourceSearch; 