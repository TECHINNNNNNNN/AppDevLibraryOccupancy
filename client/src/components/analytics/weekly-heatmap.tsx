import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chart.js/auto';

interface WeeklyHeatmapProps {
  data: Array<{
    day: string;
    [hour: string]: string | number;
  }>;
}

const WeeklyHeatmap: React.FC<WeeklyHeatmapProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Extract days and hours from data
    const days = data.map(d => d.day);
    const hours = Object.keys(data[0]).filter(k => k !== 'day');

    // Prepare data for heatmap
    const datasets = hours.map(hour => ({
      label: `${hour}:00`,
      data: data.map(d => d[hour]),
      backgroundColor: 'rgba(157, 28, 32, 0.8)',
    }));

    // Create the chart
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Occupancy by Hour and Day',
            data: data.map((d, i) => {
              const hourValues = hours.map(hour => ({
                x: days[i],
                y: hour,
                v: d[hour]
              }));
              return hourValues;
            }).flat(),
            backgroundColor: (context) => {
              const value = context.raw?.v as number;
              if (!value && value !== 0) return 'rgba(200, 200, 200, 0.2)';
              
              // Color scale based on occupancy percentage
              if (value < 30) return 'rgba(16, 185, 129, 0.7)';
              if (value < 60) return 'rgba(245, 158, 11, 0.7)';
              return 'rgba(239, 68, 68, 0.7)';
            },
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'category',
            labels: hours.map(h => `${h}:00`),
            offset: true,
            ticks: {
              align: 'center',
            }
          },
          x: {
            type: 'category',
            offset: true,
            grid: {
              display: false
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => {
                if (!items.length) return '';
                const item = items[0];
                return `${item.dataset.label}, ${item.label}`;
              },
              label: (item) => {
                const dataPoint = item.raw as { v: number };
                return `Occupancy: ${dataPoint.v}%`;
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full h-96">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WeeklyHeatmap;
