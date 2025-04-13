import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart, 
  Timer 
} from 'lucide-react';

interface OccupancyStatisticsProps {
  data: {
    averageOccupancy: number;
    peakHour: string;
    peakDay: string;
    leastBusyTime: string;
    leastBusyDay: string;
    medianStayDuration: string;
  };
}

const OccupancyStatistics: React.FC<OccupancyStatisticsProps> = ({ data }) => {
  const stats = [
    {
      name: 'Average Occupancy',
      value: `${data.averageOccupancy}%`,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Peak Hour',
      value: data.peakHour,
      icon: Clock,
      color: 'bg-red-100 text-red-600',
    },
    {
      name: 'Peak Day',
      value: data.peakDay,
      icon: Calendar,
      color: 'bg-red-100 text-red-600',
    },
    {
      name: 'Least Busy Time',
      value: data.leastBusyTime,
      icon: TrendingDown,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Least Busy Day',
      value: data.leastBusyDay,
      icon: TrendingDown,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Median Stay Duration',
      value: data.medianStayDuration,
      icon: Timer,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="border rounded-lg p-4 flex items-start space-x-4">
          <div className={`rounded-md p-2 ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OccupancyStatistics;
