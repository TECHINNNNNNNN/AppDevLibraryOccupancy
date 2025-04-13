import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface WaitTimeProps {
  estimatedTime: string;
  bestTimeToVisit: string;
  trafficLevel: 'Low' | 'Moderate' | 'High';
}

const getTrafficBadgeColors = (level: 'Low' | 'Moderate' | 'High') => {
  switch (level) {
    case 'Low':
      return 'bg-green-100 text-green-800';
    case 'Moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'High':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const WaitTimeCard: React.FC<WaitTimeProps> = ({ 
  estimatedTime, 
  bestTimeToVisit, 
  trafficLevel 
}) => {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Estimated Wait Time
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{estimatedTime}</div>
              <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                for a seat
              </div>
            </dd>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Best time to visit: <span className="font-medium text-purple-600">{bestTimeToVisit}</span></div>
          </div>
          <div className="mt-3 h-10 bg-gray-50 rounded-md flex items-center px-4">
            <div className="text-xs text-gray-500">Current traffic:
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrafficBadgeColors(trafficLevel)} ml-1`}>
                {trafficLevel}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaitTimeCard;
