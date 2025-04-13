import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LibraryMapSvg, { LibraryZone } from "@/assets/library-map";

interface LibraryMapProps {
  zones: LibraryZone[];
  lastUpdated: string;
  onViewDetailedMap: () => void;
  onZoneClick?: (zoneId: number) => void;
}

const LibraryMap: React.FC<LibraryMapProps> = ({ 
  zones, 
  lastUpdated, 
  onViewDetailedMap,
  onZoneClick
}) => {
  return (
    <Card>
      <CardHeader className="px-4 py-5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">Library Map</CardTitle>
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
      </CardHeader>
      <CardContent className="px-4 py-3">
        <div className="w-full h-96 bg-gray-50 rounded-lg p-4 overflow-hidden relative">
          <LibraryMapSvg zones={zones} onZoneClick={onZoneClick} />
          
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-900">Current Highlights</div>
            <div className="mt-1 text-xs text-gray-500">Computer Lab (Zone B) is nearly full</div>
            <div className="mt-1 text-xs text-gray-500">Best seating: Zone A (Reading Area)</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4">
        <div className="flex items-center w-full">
          <div className="w-0 flex-1 flex items-center text-sm text-gray-500">
            <span className="truncate">Last updated: {lastUpdated}</span>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Button 
              variant="link" 
              className="font-medium text-primary hover:text-primary-500"
              onClick={onViewDetailedMap}
            >
              View detailed map
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LibraryMap;
