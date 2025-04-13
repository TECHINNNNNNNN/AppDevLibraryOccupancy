import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export interface OccupancyCardProps {
  current: number;
  total: number;
  percentage: number;
  lastUpdated?: Date;
}

const getStatusColor = (percentage: number) => {
  if (percentage < 50) return "bg-green-500";
  if (percentage < 80) return "bg-amber-500";
  return "bg-red-500";
};

const getStatusText = (percentage: number) => {
  if (percentage < 50) return "Plenty of space available";
  if (percentage < 80) return "Filling up";
  return "Almost full";
};

const getStatusBadgeColors = (percentage: number) => {
  if (percentage < 50) return "bg-green-100 text-green-800";
  if (percentage < 80) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const OccupancyCard: React.FC<OccupancyCardProps> = ({ 
  current, 
  total, 
  percentage,
  lastUpdated 
}) => {
  const seatsAvailable = total - current;
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Current Occupancy</CardTitle>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(percentage)}`}></div>
        </div>
        <CardDescription>{getStatusText(percentage)}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-3">
              <dt className="text-sm font-medium text-gray-500 truncate">
                People
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{current}</div>
                <div className="ml-2 flex items-baseline text-sm font-semibold">
                  <span className="sr-only">out of</span>
                  <span className="text-gray-500">/ {total}</span>
                </div>
              </dd>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Seats Available</p>
            <p className="text-2xl font-semibold text-gray-900">{seatsAvailable}</p>
          </div>
        </div>
        
        <div className="relative pt-1">
          <Progress
            value={percentage}
            className="h-2 bg-gray-200"
            indicatorClassName={getStatusColor(percentage)}
          />
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-xs font-semibold inline-block text-gray-500">
                {percentage}% Full
              </span>
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColors(percentage)}`}>
                {percentage < 50 ? "Low" : percentage < 80 ? "Moderate" : "High"}
              </span>
            </div>
          </div>
        </div>
        
        {lastUpdated && (
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OccupancyCard;
