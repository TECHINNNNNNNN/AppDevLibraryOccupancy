import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface TrendChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      color: string;
    }>;
  };
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, height = 300 }) => {
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

    // Create the chart
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.data,
          borderColor: dataset.color,
          backgroundColor: `${dataset.color.slice(0, -1)}, 0.1)`,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: dataset.color,
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: dataset.color,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of People'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 6
            }
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
    <div style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default TrendChart;
