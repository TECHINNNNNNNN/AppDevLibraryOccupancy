import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  loginSchema, insertSeatPostSchema, insertAnnouncementSchema,
  insertOccupancyRecordSchema, insertEntryExitEventSchema 
} from "@shared/schema";

interface WsMessage {
  type: string;
  data: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Connected clients
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    // Add client to set
    clients.add(ws);
    
    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as WsMessage;
        
        // Handle different message types
        if (parsedMessage.type === 'getOccupancy') {
          // Send current occupancy data
          const occupancy = await storage.getCurrentOccupancy();
          const zoneOccupancy = await storage.getAllZoneOccupancy();
          const zones = await storage.getLibraryZones();
          
          ws.send(JSON.stringify({
            type: 'occupancyUpdate',
            data: {
              current: occupancy,
              total: 400, // Total library capacity
              zones: zones.map(zone => ({
                id: zone.id,
                name: zone.name,
                current: zone.currentOccupancy ?? 0,
                capacity: zone.capacity,
                percentage: Math.round(((zone.currentOccupancy ?? 0) / zone.capacity) * 100)
              }))
            }
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client from set
      clients.delete(ws);
    });
    
    // Send initial data
    sendInitialData(ws);
  });
  
  // Function to broadcast to all connected clients
  const broadcast = (message: WsMessage) => {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
  
  // Function to send initial data to a client
  const sendInitialData = async (ws: WebSocket) => {
    try {
      // Current occupancy
      const occupancy = await storage.getCurrentOccupancy();
      const zones = await storage.getLibraryZones();
      
      // Active announcements
      const announcements = await storage.getActiveAnnouncements();
      
      // Active seat posts
      const seatPosts = await storage.getActiveSeatPosts();
      
      ws.send(JSON.stringify({
        type: 'initialData',
        data: {
          occupancy: {
            current: occupancy,
            total: 400, // Total library capacity
            zones: zones.map(zone => ({
              id: zone.id,
              name: zone.name,
              current: zone.currentOccupancy,
              capacity: zone.capacity,
              percentage: Math.round((zone.currentOccupancy / zone.capacity) * 100)
            }))
          },
          announcements,
          seatPosts
        }
      }));
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  };
  
  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Check if the user exists
      let user = await storage.getUserByMicrosoftId(loginData.microsoftId);
      
      // If not, create a new user
      if (!user) {
        user = await storage.createUser({
          microsoftId: loginData.microsoftId,
          studentId: loginData.studentId,
          email: loginData.email,
          name: loginData.name,
          role: 'student',
          preferences: {
            notifications: true,
            notificationThreshold: 75,
            favoriteAreas: []
          }
        });
      } else {
        // Update last login time (In a real app, we'd update this in the database)
        user = { ...user, lastLogin: new Date() };
      }
      
      // Strip sensitive data before sending
      const { microsoftId, ...safeUser } = user;
      
      res.json({
        user: safeUser
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.get('/api/auth/me', async (req, res) => {
    // In a real app, this would check JWT or session
    // For now, we'll return a mock response
    res.status(401).json({ error: 'Unauthorized' });
  });
  
  // Occupancy routes
  app.get('/api/occupancy/current', async (_req, res) => {
    try {
      const occupancy = await storage.getCurrentOccupancy();
      const zones = await storage.getLibraryZones();
      
      res.json({
        current: occupancy,
        total: 400, // Total library capacity
        percentage: Math.round((occupancy / 400) * 100),
        zones: zones.map(zone => ({
          id: zone.id,
          name: zone.name,
          current: zone.currentOccupancy,
          capacity: zone.capacity,
          percentage: Math.round((zone.currentOccupancy / zone.capacity) * 100)
        }))
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.get('/api/occupancy/history', async (req, res) => {
    try {
      const startDate = req.query.start ? new Date(req.query.start as string) : new Date(new Date().setHours(0, 0, 0, 0));
      const endDate = req.query.end ? new Date(req.query.end as string) : new Date();
      
      const history = await storage.getOccupancyHistory(startDate, endDate);
      
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Simulate entry/exit for testing
  app.post('/api/occupancy/scan', async (req, res) => {
    try {
      const eventData = insertEntryExitEventSchema.parse(req.body);
      
      const event = await storage.recordEntryExit(eventData);
      
      // Get updated occupancy to broadcast
      const occupancy = await storage.getCurrentOccupancy();
      const zones = await storage.getLibraryZones();
      
      // Broadcast to all clients
      broadcast({
        type: 'occupancyUpdate',
        data: {
          current: occupancy,
          total: 400,
          percentage: Math.round((occupancy / 400) * 100),
          zones: zones.map(zone => ({
            id: zone.id,
            name: zone.name,
            current: zone.currentOccupancy,
            capacity: zone.capacity,
            percentage: Math.round((zone.currentOccupancy / zone.capacity) * 100)
          }))
        }
      });
      
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Manual occupancy update for testing
  app.post('/api/occupancy/update', async (req, res) => {
    try {
      const recordData = insertOccupancyRecordSchema.parse(req.body);
      
      const record = await storage.saveOccupancyRecord(recordData);
      
      // Update zone occupancies if provided
      if (recordData.zoneOccupancy) {
        for (const [zoneId, occupancy] of Object.entries(recordData.zoneOccupancy)) {
          await storage.updateZoneOccupancy(parseInt(zoneId), occupancy);
        }
      }
      
      // Broadcast to all clients
      broadcast({
        type: 'occupancyUpdate',
        data: {
          current: recordData.currentOccupancy,
          total: recordData.capacity,
          percentage: Math.round((recordData.currentOccupancy / recordData.capacity) * 100),
          zones: (await storage.getLibraryZones()).map(zone => ({
            id: zone.id,
            name: zone.name,
            current: zone.currentOccupancy,
            capacity: zone.capacity,
            percentage: Math.round((zone.currentOccupancy / zone.capacity) * 100)
          }))
        }
      });
      
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Library zones routes
  app.get('/api/zones', async (_req, res) => {
    try {
      const zones = await storage.getLibraryZones();
      res.json(zones);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.get('/api/zones/:id', async (req, res) => {
    try {
      const zoneId = parseInt(req.params.id);
      const zone = await storage.getLibraryZone(zoneId);
      
      if (!zone) {
        return res.status(404).json({ error: 'Zone not found' });
      }
      
      res.json(zone);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Seat posts routes
  app.get('/api/seats', async (_req, res) => {
    try {
      const seats = await storage.getActiveSeatPosts();
      res.json(seats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.get('/api/seats/zone/:zone', async (req, res) => {
    try {
      const zone = req.params.zone;
      const seats = await storage.getSeatPostsByZone(zone);
      res.json(seats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.post('/api/seats', async (req, res) => {
    try {
      const postData = insertSeatPostSchema.parse(req.body);
      
      const post = await storage.createSeatPost(postData);
      
      // Broadcast to all clients
      broadcast({
        type: 'newSeatPost',
        data: post
      });
      
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/seats/:id', async (req, res) => {
    try {
      const seatId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['active', 'expired', 'removed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const post = await storage.updateSeatPost(seatId, status);
      
      if (!post) {
        return res.status(404).json({ error: 'Seat post not found' });
      }
      
      // Broadcast to all clients
      broadcast({
        type: 'seatPostUpdate',
        data: post
      });
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.post('/api/seats/:id/verify', async (req, res) => {
    try {
      const seatId = parseInt(req.params.id);
      const { isPositive } = req.body;
      
      if (typeof isPositive !== 'boolean') {
        return res.status(400).json({ error: 'isPositive must be a boolean' });
      }
      
      const post = await storage.verifySeatPost(seatId, isPositive);
      
      if (!post) {
        return res.status(404).json({ error: 'Seat post not found' });
      }
      
      // Broadcast to all clients
      broadcast({
        type: 'seatPostUpdate',
        data: post
      });
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Announcement routes
  app.get('/api/announcements', async (_req, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.post('/api/announcements', async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      
      const announcement = await storage.createAnnouncement(announcementData);
      
      // Broadcast to all clients
      broadcast({
        type: 'newAnnouncement',
        data: announcement
      });
      
      res.json(announcement);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.put('/api/announcements/:id/deactivate', async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      
      const announcement = await storage.deactivateAnnouncement(announcementId);
      
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      
      // Broadcast to all clients
      broadcast({
        type: 'announcementUpdate',
        data: announcement
      });
      
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Simulate some data for demo purposes
  simulateLibraryData();
  
  async function simulateLibraryData() {
    // Create a test announcement
    await storage.createAnnouncement({
      message: "The library will close early at 20:00 today due to system maintenance. Please plan accordingly.",
      createdBy: 1, // Admin ID
      expiry: new Date(new Date().setHours(23, 59, 59)), // Expires today
      isActive: true,
      createdAt: new Date()
    });
    
    // Create some occupancy history (for the chart)
    const today = new Date();
    today.setHours(8, 0, 0, 0); // Start at 8:00 AM
    
    const hourlyData = [45, 87, 156, 201, 245, 267, 310, 345, 290, 234, 178, 145];
    
    for (let i = 0; i < hourlyData.length; i++) {
      const timestamp = new Date(today);
      timestamp.setHours(timestamp.getHours() + i);
      
      await storage.saveOccupancyRecord({
        timestamp,
        currentOccupancy: hourlyData[i],
        capacity: 400,
        zoneOccupancy: {
          "1": Math.floor(hourlyData[i] * 0.3), // 30% in Zone A
          "2": Math.floor(hourlyData[i] * 0.25), // 25% in Zone B
          "3": Math.floor(hourlyData[i] * 0.35), // 35% in Zone C
          "4": Math.floor(hourlyData[i] * 0.1)  // 10% in Zone D
        }
      });
    }
  }

  return httpServer;
}
