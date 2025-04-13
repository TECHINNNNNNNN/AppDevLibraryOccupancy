import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowUp } from "lucide-react";

export interface AvailableSeatsProps {
  available: number;
  percentChange: number;
  zoneData: {
    quiet: number;
    group: number;
    computer: number;
  };
  onFindSeat?: () => void;
}

const AvailableSeatsCard: React.FC<AvailableSeatsProps> = ({ 
  available, 
  percentChange, 
  zoneData, 
  onFindSeat 
}) => {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Available Seats
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{available}</div>
              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                <ArrowUp className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                <span className="ml-1">{percentChange}%</span>
              </div>
            </dd>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Quiet Zone: <span className="font-medium">{zoneData.quiet}</span></div>
            <div>Group Area: <span className="font-medium">{zoneData.group}</span></div>
            <div>Computer: <span className="font-medium">{zoneData.computer}</span></div>
          </div>
          <Button 
            variant="outline" 
            className="mt-3 w-full"
            onClick={onFindSeat}
          >
            Find Available Seat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableSeatsCard;
