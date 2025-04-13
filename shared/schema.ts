import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and user management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  email: text("email").notNull().unique(), // Must be @student.chula.ac.th
  name: text("name").notNull(),
  profileImage: text("profile_image"),
  role: text("role").notNull().default("student"), // "student", "admin", "staff"
  microsoftId: text("microsoft_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login").defaultNow().notNull(),
  preferences: json("preferences").$type<{
    notifications: boolean;
    notificationThreshold: number;
    favoriteAreas: string[];
  }>().default({
    notifications: true,
    notificationThreshold: 75,
    favoriteAreas: []
  }),
});

// Entry/Exit events for tracking occupancy
export const entryExitEvents = pgTable("entry_exit_events", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  eventType: text("event_type").notNull(), // "entry" or "exit"
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  deviceId: text("device_id"),
  location: text("location"),
});

// Occupancy records for historical data
export const occupancyRecords = pgTable("occupancy_records", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  currentOccupancy: integer("current_occupancy").notNull(),
  capacity: integer("capacity").notNull(),
  zoneOccupancy: json("zone_occupancy").$type<Record<string, number>>(),
});

// Library zones definition
export const libraryZones = pgTable("library_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  resources: json("resources").$type<string[]>().notNull(),
  coordinates: json("coordinates").$type<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>().notNull(),
  currentOccupancy: integer("current_occupancy").default(0),
});

// Social seating posts
export const seatPosts = pgTable("seat_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  location: json("location").$type<{
    zone: string;
    seatId?: string;
    coordinates?: {
      x: number;
      y: number;
    };
  }>().notNull(),
  imageUrl: text("image_url"),
  duration: integer("duration").notNull(), // in minutes
  endTime: timestamp("end_time").notNull(),
  groupSize: integer("group_size").default(1),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  verifications: json("verifications").$type<{
    positive: number;
    negative: number;
  }>().default({
    positive: 0,
    negative: 0
  }),
  status: text("status").default("active"), // "active", "expired", "removed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Announcements for the dashboard
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  expiry: timestamp("expiry"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Create insert schemas for all tables
export const insertUserSchema = createInsertSchema(users);
export const insertEntryExitEventSchema = createInsertSchema(entryExitEvents);
export const insertOccupancyRecordSchema = createInsertSchema(occupancyRecords);
export const insertLibraryZoneSchema = createInsertSchema(libraryZones);
export const insertSeatPostSchema = createInsertSchema(seatPosts);
export const insertAnnouncementSchema = createInsertSchema(announcements);

// Define types for all tables
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type EntryExitEvent = typeof entryExitEvents.$inferSelect;
export type InsertEntryExitEvent = z.infer<typeof insertEntryExitEventSchema>;

export type OccupancyRecord = typeof occupancyRecords.$inferSelect;
export type InsertOccupancyRecord = z.infer<typeof insertOccupancyRecordSchema>;

export type LibraryZone = typeof libraryZones.$inferSelect;
export type InsertLibraryZone = z.infer<typeof insertLibraryZoneSchema>;

export type SeatPost = typeof seatPosts.$inferSelect;
export type InsertSeatPost = z.infer<typeof insertSeatPostSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Create auth schemas
export const loginSchema = z.object({
  email: z.string().email().endsWith("@student.chula.ac.th"),
  microsoftId: z.string(),
  name: z.string(),
  studentId: z.string(),
});

export type LoginData = z.infer<typeof loginSchema>;
