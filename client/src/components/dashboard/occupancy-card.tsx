import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

export interface OccupancyCardProps {
  current: number;
  total: number;
  percentage: number;
}

const getStatusColor = (percentage: number) => {
  if (percentage < 50) return "bg-green-500";
  if (percentage < 80) return "bg-amber-500";
  return "bg-red-500";
};

const getStatusText = (percentage: number) => {
  if (percentage < 50) return "Low";
  if (percentage < 80) return "Moderate";
  return "High";
};

const getStatusBadgeColors = (percentage: number) => {
  if (percentage < 50) return "bg-green-100 text-green-800";
  if (percentage < 80) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const OccupancyCard: React.FC<OccupancyCardProps> = ({ current, total, percentage }) => {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Current Occupancy
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{current}</div>
              <div className="ml-2 flex items-baseline text-sm font-semibold text-amber-500">
                <span className="sr-only">out of</span>
                <span className="text-gray-500">/ {total}</span>
              </div>
            </dd>
          </div>
        </div>
        <div className="mt-5">
          <div className="relative pt-1">
            <Progress
              value={percentage}
              className="h-2 bg-gray-200"
              indicatorClassName={getStatusColor(percentage)}
            />
            <div className="flex items-center justify-between mt-1">
              <div>
                <span className="text-xs font-semibold inline-block text-gray-500">
                  {percentage}% Full
                </span>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColors(percentage)}`}>
                  {getStatusText(percentage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OccupancyCard;
