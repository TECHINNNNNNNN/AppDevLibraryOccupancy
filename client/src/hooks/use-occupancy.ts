import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';

export interface ZoneOccupancy {
  id: string;
  name: string;
  current: number;
  capacity: number;
  percentage: number;
}

export interface OccupancyData {
  current: number;
  total: number;
  percentage: number;
  zones: ZoneOccupancy[];
  lastUpdated: Date;
}

const initialOccupancyData = {
  current: 0,
  total: 400,
  percentage: 0,
  zones: [],
  lastUpdated: new Date()
};

export function useOccupancy() {
  const [occupancyData, setOccupancyData] = useState<OccupancyData>(initialOccupancyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected, sendMessage, subscribe } = useSocket();
  
  // Function to request occupancy data
  const fetchOccupancy = useCallback(() => {
    if (isConnected) {
      sendMessage('getOccupancy');
    }
  }, [isConnected, sendMessage]);
  
  // Setup subscription to socket updates
  useEffect(() => {
    const unsubscribe = subscribe((message: any) => {
      if (message.type === 'occupancyUpdate' || 
          (message.type === 'initialData' && message.data.occupancy)) {
        
        const occupancy = message.type === 'occupancyUpdate' 
          ? message.data 
          : message.data.occupancy;
        
        setOccupancyData({
          current: occupancy.current,
          total: occupancy.total || 400,
          percentage: occupancy.percentage || Math.round((occupancy.current / (occupancy.total || 400)) * 100),
          zones: occupancy.zones || [],
          lastUpdated: new Date()
        });
        
        setLoading(false);
      }
    });
    
    // Initial fetch
    fetchOccupancy();
    
    // Fetch occupancy every 60 seconds
    const interval = setInterval(fetchOccupancy, 60000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [fetchOccupancy, subscribe]);
  
  // Handle connection changes
  useEffect(() => {
    if (isConnected) {
      setError(null);
      fetchOccupancy();
    } else {
      setError('Connection lost. Reconnecting...');
    }
  }, [isConnected, fetchOccupancy]);
  
  return {
    occupancyData,
    loading,
    error,
    refreshOccupancy: fetchOccupancy
  };
} 