import { 
  users, User, InsertUser, 
  entryExitEvents, EntryExitEvent, InsertEntryExitEvent,
  occupancyRecords, OccupancyRecord, InsertOccupancyRecord,
  libraryZones, LibraryZone, InsertLibraryZone,
  seatPosts, SeatPost, InsertSeatPost,
  announcements, Announcement, InsertAnnouncement
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByStudentId(studentId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: number, preferences: User['preferences']): Promise<User | undefined>;
  
  // Occupancy operations
  recordEntryExit(event: InsertEntryExitEvent): Promise<EntryExitEvent>;
  getCurrentOccupancy(): Promise<number>;
  getZoneOccupancy(zoneId: number): Promise<number>;
  getAllZoneOccupancy(): Promise<Record<string, number>>;
  saveOccupancyRecord(record: InsertOccupancyRecord): Promise<OccupancyRecord>;
  getOccupancyHistory(startDate: Date, endDate: Date): Promise<OccupancyRecord[]>;
  
  // Library zones operations
  getLibraryZones(): Promise<LibraryZone[]>;
  getLibraryZone(id: number): Promise<LibraryZone | undefined>;
  updateZoneOccupancy(id: number, currentOccupancy: number): Promise<LibraryZone>;
  
  // Seat posts operations
  createSeatPost(post: InsertSeatPost): Promise<SeatPost>;
  getSeatPosts(): Promise<SeatPost[]>;
  getActiveSeatPosts(): Promise<SeatPost[]>;
  getSeatPostsByZone(zone: string): Promise<SeatPost[]>;
  updateSeatPost(id: number, status: string): Promise<SeatPost | undefined>;
  verifySeatPost(id: number, isPositive: boolean): Promise<SeatPost | undefined>;
  
  // Announcement operations
  getActiveAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deactivateAnnouncement(id: number): Promise<Announcement | undefined>;
}

export class MemStorage implements IStorage {
  private userMap: Map<number, User>;
  private entryExitMap: Map<number, EntryExitEvent>;
  private occupancyMap: Map<number, OccupancyRecord>;
  private zoneMap: Map<number, LibraryZone>;
  private seatPostMap: Map<number, SeatPost>;
  private announcementMap: Map<number, Announcement>;
  
  private userIdCounter: number = 1;
  private eventIdCounter: number = 1;
  private occupancyIdCounter: number = 1;
  private zoneIdCounter: number = 1;
  private seatPostIdCounter: number = 1;
  private announcementIdCounter: number = 1;
  
  constructor() {
    this.userMap = new Map();
    this.entryExitMap = new Map();
    this.occupancyMap = new Map();
    this.zoneMap = new Map();
    this.seatPostMap = new Map();
    this.announcementMap = new Map();
    
    // Initialize with sample zones
    this.initializeZones();
  }
  
  private initializeZones() {
    const zones: InsertLibraryZone[] = [
      {
        name: "Zone A - Reading Area",
        capacity: 100,
        resources: ["quiet_reading", "power_outlets"],
        coordinates: { x: 60, y: 60, width: 300, height: 200 },
        currentOccupancy: 32
      },
      {
        name: "Zone B - Computer Lab",
        capacity: 50,
        resources: ["computers", "printers", "scanners"],
        coordinates: { x: 440, y: 60, width: 300, height: 120 },
        currentOccupancy: 47
      },
      {
        name: "Zone C - Group Study",
        capacity: 80,
        resources: ["group_tables", "whiteboards", "power_outlets"],
        coordinates: { x: 440, y: 220, width: 300, height: 120 },
        currentOccupancy: 54
      },
      {
        name: "Zone D - Quiet Zone",
        capacity: 40,
        resources: ["silent_study", "individual_desks"],
        coordinates: { x: 60, y: 300, width: 300, height: 40 },
        currentOccupancy: 22
      }
    ];
    
    zones.forEach(zone => {
      const id = this.zoneIdCounter++;
      this.zoneMap.set(id, { ...zone, id });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }

  async getUserByStudentId(studentId: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(
      (user) => user.studentId === studentId
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(
      (user) => user.microsoftId === microsoftId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.userMap.set(id, user);
    return user;
  }

  async updateUserPreferences(id: number, preferences: User['preferences']): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, preferences };
    this.userMap.set(id, updatedUser);
    return updatedUser;
  }

  // Occupancy operations
  async recordEntryExit(insertEvent: InsertEntryExitEvent): Promise<EntryExitEvent> {
    const id = this.eventIdCounter++;
    const event: EntryExitEvent = { ...insertEvent, id };
    this.entryExitMap.set(id, event);
    
    // Update the current occupancy count
    await this.updateOccupancyAfterEvent(event);
    
    return event;
  }

  private async updateOccupancyAfterEvent(event: EntryExitEvent): Promise<void> {
    // Get current occupancy
    const currentOccupancy = await this.getCurrentOccupancy();
    
    // Create a new occupancy record
    const newOccupancy = event.eventType === 'entry' ? currentOccupancy + 1 : Math.max(0, currentOccupancy - 1);
    
    // Save new occupancy record
    await this.saveOccupancyRecord({
      timestamp: new Date(),
      currentOccupancy: newOccupancy,
      capacity: 400, // Total library capacity
      zoneOccupancy: await this.getAllZoneOccupancy()
    });
  }

  async getCurrentOccupancy(): Promise<number> {
    // Count current occupancy based on entry/exit events
    const events = Array.from(this.entryExitMap.values());
    const entries = events.filter(event => event.eventType === 'entry').length;
    const exits = events.filter(event => event.eventType === 'exit').length;
    
    return entries - exits;
  }

  async getZoneOccupancy(zoneId: number): Promise<number> {
    const zone = await this.getLibraryZone(zoneId);
    return zone?.currentOccupancy || 0;
  }

  async getAllZoneOccupancy(): Promise<Record<string, number>> {
    const zones = await this.getLibraryZones();
    return zones.reduce((acc, zone) => {
      acc[zone.id.toString()] = zone.currentOccupancy;
      return acc;
    }, {} as Record<string, number>);
  }

  async saveOccupancyRecord(record: InsertOccupancyRecord): Promise<OccupancyRecord> {
    const id = this.occupancyIdCounter++;
    const occupancyRecord: OccupancyRecord = { ...record, id };
    this.occupancyMap.set(id, occupancyRecord);
    return occupancyRecord;
  }

  async getOccupancyHistory(startDate: Date, endDate: Date): Promise<OccupancyRecord[]> {
    return Array.from(this.occupancyMap.values())
      .filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= startDate && recordDate <= endDate;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Library zones operations
  async getLibraryZones(): Promise<LibraryZone[]> {
    return Array.from(this.zoneMap.values());
  }

  async getLibraryZone(id: number): Promise<LibraryZone | undefined> {
    return this.zoneMap.get(id);
  }

  async updateZoneOccupancy(id: number, currentOccupancy: number): Promise<LibraryZone> {
    const zone = await this.getLibraryZone(id);
    if (!zone) throw new Error(`Zone with id ${id} not found`);
    
    const updatedZone = { ...zone, currentOccupancy };
    this.zoneMap.set(id, updatedZone);
    return updatedZone;
  }

  // Seat posts operations
  async createSeatPost(post: InsertSeatPost): Promise<SeatPost> {
    const id = this.seatPostIdCounter++;
    const seatPost: SeatPost = { ...post, id };
    this.seatPostMap.set(id, seatPost);
    return seatPost;
  }

  async getSeatPosts(): Promise<SeatPost[]> {
    return Array.from(this.seatPostMap.values());
  }

  async getActiveSeatPosts(): Promise<SeatPost[]> {
    const now = new Date();
    return Array.from(this.seatPostMap.values())
      .filter(post => post.status === 'active' && new Date(post.endTime) > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSeatPostsByZone(zone: string): Promise<SeatPost[]> {
    return (await this.getActiveSeatPosts())
      .filter(post => post.location.zone === zone);
  }

  async updateSeatPost(id: number, status: string): Promise<SeatPost | undefined> {
    const post = this.seatPostMap.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, status };
    this.seatPostMap.set(id, updatedPost);
    return updatedPost;
  }

  async verifySeatPost(id: number, isPositive: boolean): Promise<SeatPost | undefined> {
    const post = this.seatPostMap.get(id);
    if (!post) return undefined;
    
    const verifications = { ...post.verifications };
    if (isPositive) {
      verifications.positive++;
    } else {
      verifications.negative++;
    }
    
    const updatedPost = { ...post, verifications };
    this.seatPostMap.set(id, updatedPost);
    return updatedPost;
  }

  // Announcement operations
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date();
    return Array.from(this.announcementMap.values())
      .filter(announcement => 
        announcement.isActive && 
        (!announcement.expiry || new Date(announcement.expiry) > now)
      );
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementIdCounter++;
    const newAnnouncement: Announcement = { ...announcement, id };
    this.announcementMap.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async deactivateAnnouncement(id: number): Promise<Announcement | undefined> {
    const announcement = this.announcementMap.get(id);
    if (!announcement) return undefined;
    
    const updatedAnnouncement = { ...announcement, isActive: false };
    this.announcementMap.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }
}

export const storage = new MemStorage();
