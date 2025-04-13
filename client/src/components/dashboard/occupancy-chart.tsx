import React, { useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Chart from 'chart.js/auto';

export interface OccupancyChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  onViewAnalytics?: () => void;
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ 
  data, 
  onViewAnalytics 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Occupancy',
          data: data.values,
          fill: true,
          backgroundColor: 'rgba(157, 28, 32, 0.1)',
          borderColor: 'rgba(157, 28, 32, 0.7)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(157, 28, 32, 0.7)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 400,
            ticks: {
              callback: function(value) {
                return value;
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
        <CardTitle className="text-lg font-medium text-gray-900">Today's Occupancy</CardTitle>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">Day</Button>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary-50">Week</Button>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary-50">Month</Button>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-80 relative">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-4">
        <div className="flex items-center w-full">
          <div className="w-0 flex-1 flex items-center text-sm text-gray-500">
            <span className="truncate">Peak time today: <span className="font-medium">14:00 - 16:00</span></span>
          </div>
          <div className="ml-4 flex-shrink-0">
            <Button 
              variant="link" 
              className="font-medium text-primary hover:text-primary-500"
              onClick={onViewAnalytics}
            >
              View detailed analytics
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OccupancyChart;
