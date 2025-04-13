import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, Calendar } from 'lucide-react';
import PageHeader from '@/components/layout/page-header';
import WeeklyHeatmap from '@/components/analytics/weekly-heatmap';
import TrendChart from '@/components/analytics/trend-chart';
import OccupancyStatistics from '@/components/analytics/occupancy-statistics';
import DateRangePicker from '@/components/analytics/date-range-picker';

// Sample data
const weeklyData = [
  { day: 'Monday', '8': 15, '9': 28, '10': 42, '11': 56, '12': 68, '13': 74, '14': 82, '15': 78, '16': 64, '17': 55, '18': 48, '19': 36, '20': 25, '21': 14 },
  { day: 'Tuesday', '8': 18, '9': 31, '10': 45, '11': 59, '12': 72, '13': 78, '14': 85, '15': 80, '16': 68, '17': 58, '18': 50, '19': 39, '20': 27, '21': 16 },
  { day: 'Wednesday', '8': 22, '9': 35, '10': 48, '11': 62, '12': 75, '13': 82, '14': 89, '15': 84, '16': 71, '17': 62, '18': 53, '19': 42, '20': 30, '21': 18 },
  { day: 'Thursday', '8': 25, '9': 38, '10': 52, '11': 65, '12': 78, '13': 85, '14': 92, '15': 87, '16': 75, '17': 65, '18': 56, '19': 45, '20': 33, '21': 21 },
  { day: 'Friday', '8': 20, '9': 33, '10': 47, '11': 60, '12': 73, '13': 80, '14': 87, '15': 82, '16': 69, '17': 60, '18': 51, '19': 40, '20': 28, '21': 17 },
  { day: 'Saturday', '8': 12, '9': 25, '10': 38, '11': 51, '12': 64, '13': 70, '14': 77, '15': 72, '16': 60, '17': 50, '18': 42, '19': 31, '20': 20, '21': 10 },
  { day: 'Sunday', '8': 8, '9': 18, '10': 30, '11': 43, '12': 55, '13': 62, '14': 68, '15': 63, '16': 51, '17': 42, '18': 34, '19': 23, '20': 13, '21': 6 }
];

const monthlyTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Average Daily Occupancy',
      data: [180, 195, 210, 225, 240, 205, 150, 165, 220, 235, 245, 220],
      color: 'rgba(157, 28, 32, 0.8)'
    },
    {
      label: 'Peak Occupancy',
      data: [280, 290, 325, 345, 365, 310, 220, 240, 330, 350, 375, 340],
      color: 'rgba(178, 65, 68, 0.8)'
    }
  ]
};

const statisticsData = {
  averageOccupancy: 62,
  peakHour: '14:00 - 15:00',
  peakDay: 'Thursday',
  leastBusyTime: '08:00 - 09:00',
  leastBusyDay: 'Sunday',
  medianStayDuration: '2h 15m'
};

interface DateRange {
  from: Date;
  to: Date;
}

const Analytics: React.FC = () => {
  const [tab, setTab] = useState('weekly');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/occupancy/history', dateRange],
    enabled: false // Disabled for demo
  });

  const handleExportData = () => {
    // In a real app, this would trigger a CSV download
    console.log('Exporting data for range:', dateRange);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics & Trends" 
        subtitle="Analyze historical library usage patterns"
        actions={
          <>
            <Button variant="outline" className="gap-2" onClick={handleExportData}>
              <File className="h-5 w-5 text-gray-500" />
              Export Data
            </Button>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              className="ml-3"
            />
          </>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Occupancy Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <OccupancyStatistics data={statisticsData} />
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="weekly">Weekly Patterns</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
            <TabsTrigger value="yearly">Academic Year</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="weekly" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Weekly Occupancy Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyHeatmap data={weeklyData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Monthly Occupancy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart 
                data={monthlyTrendData}
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="yearly" className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Academic Year Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-80 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Academic Year Comparison</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Data for previous academic years not available in this demo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Zone Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium mb-2">Most Utilized Zones</h3>
              <ol className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone B - Computer Lab</span>
                  <span className="font-medium">78% average</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone C - Group Study</span>
                  <span className="font-medium">72% average</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone A - Reading Area</span>
                  <span className="font-medium">65% average</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone D - Quiet Zone</span>
                  <span className="font-medium">58% average</span>
                </li>
              </ol>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium mb-2">Peak Times by Zone</h3>
              <ol className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone B - Computer Lab</span>
                  <span className="font-medium">13:00 - 16:00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone C - Group Study</span>
                  <span className="font-medium">15:00 - 18:00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone A - Reading Area</span>
                  <span className="font-medium">11:00 - 14:00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Zone D - Quiet Zone</span>
                  <span className="font-medium">10:00 - 13:00</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
