import { useEffect, useState } from 'react';

// Socket connection state
let socket: WebSocket | null = null;
let messageQueue: any[] = [];
let isConnecting = false;
let subscribers: Set<(data: any) => void> = new Set();

// Create WebSocket connection
const createSocketConnection = (): Promise<WebSocket> => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return Promise.resolve(socket);
  }

  return new Promise((resolve, reject) => {
    if (isConnecting) {
      // Check every 100ms if socket is connected
      const checkInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          clearInterval(checkInterval);
          resolve(socket);
        }
      }, 100);
      return;
    }

    isConnecting = true;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      isConnecting = false;
      
      // Send any queued messages
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(msg));
        }
      }
      
      resolve(socket);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      socket = null;
      isConnecting = false;
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        createSocketConnection().catch(console.error);
      }, 5000);
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      socket = null;
      isConnecting = false;
      reject(err);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        notifySubscribers(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
  });
};

// Send message through WebSocket
export const sendSocketMessage = async (type: string, data: any = {}) => {
  const message = { type, data };
  
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    // Queue message if socket is not open
    messageQueue.push(message);
    await createSocketConnection();
  } else {
    socket.send(JSON.stringify(message));
  }
};

// Subscribe to socket messages
const subscribeToSocket = (callback: (data: any) => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

// Notify all subscribers with new data
const notifySubscribers = (data: any) => {
  subscribers.forEach(callback => {
    callback(data);
  });
};

// Hook for using WebSocket
export const useSocket = (initializer?: () => void) => {
  const [isConnected, setIsConnected] = useState(
    socket !== null && socket.readyState === WebSocket.OPEN
  );

  useEffect(() => {
    const connectAndInit = async () => {
      try {
        await createSocketConnection();
        setIsConnected(true);
        if (initializer) initializer();
      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
        setIsConnected(false);
      }
    };

    connectAndInit();

    // Setup subscriber for connection status changes
    const checkConnectionStatus = () => {
      setIsConnected(socket !== null && socket.readyState === WebSocket.OPEN);
    };
    
    const connectionInterval = setInterval(checkConnectionStatus, 5000);

    return () => {
      clearInterval(connectionInterval);
    };
  }, [initializer]);

  return { isConnected, sendMessage: sendSocketMessage, subscribe: subscribeToSocket };
};

// Initialize connection as early as possible
createSocketConnection().catch(console.error);
