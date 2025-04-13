# Chulalongkorn Engineering Library Tracker
## Technical Product Requirements Document

### 1. Project Overview

This document provides technical specifications for developing the Chulalongkorn Engineering Library Occupancy Tracker, a full-stack application to monitor and share real-time library occupancy data. This PRD is specifically designed for implementation guidance in development environments like Replit and Cursor.

### 2. Technology Stack

#### 2.1 Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit or React Query
- **UI Components**: Material-UI or Chakra UI
- **Styling**: Tailwind CSS for utility-first styling
- **Data Visualization**: Chart.js or D3.js for analytics displays
- **Maps/Layout**: React Flow or custom SVG for interactive library maps
- **Real-time Updates**: Socket.io client for live occupancy data
- **Forms Management**: React Hook Form + Zod for validation
- **Image Processing**: react-image-crop for profile/seat photos

#### 2.2 Backend
- **Runtime**: Node.js with Express.js
- **Language**: JavaScript (TypeScript recommended for type safety)
- **API Architecture**: RESTful API with JSON responses
- **Real-time Communication**: Socket.io for live updates
- **Authentication**: JWT-based authentication with refresh tokens
- **Validation**: Express-validator or Joi

#### 2.3 Database
- **Primary Database**: MongoDB
  - **Justification**: 
    - Free tier available through MongoDB Atlas
    - Flexible schema ideal for evolving application requirements
    - Good performance for read-heavy applications
    - Built-in scaling capabilities
    - Native geospatial indexing for location features
  - **Configuration**: MongoDB Atlas free tier (512MB storage, shared RAM)

- **Real-time Database**: Firebase Realtime Database
  - **Justification**:
    - Free tier supports up to 1GB storage and 10GB/month transfer
    - Built specifically for real-time applications
    - Easy implementation with web and mobile clients
    - Handles offline scenarios automatically
  - **Configuration**: Spark Plan (free) with proper security rules

- **Image Storage**: Firebase Storage
  - Free tier offers 5GB storage and 1GB/day transfer
  - Easy integration with the rest of the stack
  - Can implement client-side resizing to reduce storage needs

#### 2.4 DevOps & Deployment
- **Version Control**: Git with GitHub
- **Development Environment**: Replit or Cursor
- **Deployment**: Vercel (frontend), Render or Railway (backend)
- **Environment Variables**: .env files (local) and platform-specific secrets

### 3. Data Models

#### 3.1 User
```typescript
interface User {
  _id: string;              // MongoDB ObjectId
  studentId: string;        // University ID
  name: string;
  email: string;
  profileImage?: string;    // URL to profile image
  preferences: {
    notifications: boolean;
    notificationThreshold: number;
    favoriteAreas: string[];
  };
  role: "student" | "admin" | "staff";
  createdAt: Date;
  lastLogin: Date;
}
```

#### 3.2 Entry/Exit Event
```typescript
interface EntryExitEvent {
  _id: string;              // MongoDB ObjectId
  studentId: string;        // University ID
  eventType: "entry" | "exit";
  timestamp: Date;
  // Optional fields for analytics
  deviceId?: string;        // Which scanner was used
  location?: string;        // Location of scanner
}
```

#### 3.3 Occupancy Record
```typescript
interface OccupancyRecord {
  _id: string;              // MongoDB ObjectId
  timestamp: Date;
  currentOccupancy: number;
  capacity: number;
  // For more granular data if multiple zones exist
  zoneOccupancy?: {
    [zoneId: string]: number;
  };
}
```

#### 3.4 Seat Post
```typescript
interface SeatPost {
  _id: string;              // MongoDB ObjectId
  userId: string;           // Reference to User
  location: {
    zone: string;
    seatId?: string;
    coordinates?: {
      x: number;
      y: number;
    };
  };
  imageUrl?: string;        // URL to uploaded image
  duration: number;         // In minutes
  endTime: Date;            // Calculated from post time + duration
  groupSize: number;        // How many people in this spot
  message?: string;         // Optional status message
  isAnonymous: boolean;     // Whether to show user info
  verifications: {
    positive: number;       // People confirming this is accurate
    negative: number;       // People saying seat is actually available
  };
  status: "active" | "expired" | "removed";
  createdAt: Date;
}
```

#### 3.5 Library Zone
```typescript
interface LibraryZone {
  _id: string;              // MongoDB ObjectId
  name: string;
  capacity: number;
  resources: string[];      // e.g., ["computers", "printers", "quiet_area"]
  coordinates: {
    // For mapping purposes
    x: number;
    y: number;
    width: number;
    height: number;
  };
  currentOccupancy: number; // Updated regularly
}
```

### 4. API Endpoints

#### 4.1 Authentication APIs
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

#### 4.2 Occupancy APIs
- `GET /api/occupancy/current` - Get current occupancy
- `GET /api/occupancy/history` - Get historical data with filters
- `GET /api/occupancy/zones` - Get zone-specific occupancy
- `POST /api/occupancy/scan` - Record entry/exit event (admin/system only)

#### 4.3 Social Seating APIs
- `GET /api/seats` - Get all active seat posts
- `GET /api/seats/zone/:zoneId` - Get seats by zone
- `POST /api/seats` - Create new seat post
- `PUT /api/seats/:id` - Update seat post
- `DELETE /api/seats/:id` - Remove seat post
- `POST /api/seats/:id/verify` - Verify/dispute seat availability
- `POST /api/seats/upload` - Upload seat image

#### 4.4 User Preference APIs
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences
- `POST /api/users/notifications/subscribe` - Subscribe to notifications

#### 4.5 Admin APIs
- `GET /api/admin/users` - Get user list
- `GET /api/admin/stats` - Get system statistics
- `PUT /api/admin/capacity` - Update capacity settings
- `POST /api/admin/announcement` - Create announcement

### 5. Real-time Architecture

#### 5.1 Socket.io Events
- `occupancy_update` - Broadcast when occupancy changes
- `new_seat_post` - Broadcast when new seat is posted
- `seat_update` - Broadcast when seat status changes
- `seat_verification` - Broadcast when seat is verified/disputed

#### 5.2 Firebase Realtime Database Structure
```
library_tracker/
├── occupancy/
│   ├── current/
│   │   ├── total: 237
│   │   ├── capacity: 400
│   │   ├── percentage: 59.25
│   │   └── lastUpdated: timestamp
│   └── zones/
│       ├── zone1/
│       │   ├── current: 45
│       │   └── capacity: 100
│       └── zone2/
│           ├── current: 78
│           └── capacity: 150
├── seats/
│   ├── active/
│   │   ├── seat1/
│   │   │   ├── location: {...}
│   │   │   ├── endTime: timestamp
│   │   │   └── ...other fields
│   │   └── seat2/
│   │       └── ...
│   └── recentlyExpired/
│       └── ...
└── announcements/
    ├── current/
    │   ├── message: "Library closes early today at 6pm"
    │   └── expiry: timestamp
    └── history/
        └── ...
```

### 6. Key Implementation Details

#### 6.1 Real-time Occupancy Calculation
```javascript
// Pseudocode for occupancy calculation service
async function updateOccupancy() {
  // Get all entry events from today
  const entryEvents = await EntryExitEvent.find({
    eventType: 'entry',
    timestamp: { $gte: startOfToday() }
  }).count();
  
  // Get all exit events from today
  const exitEvents = await EntryExitEvent.find({
    eventType: 'exit',
    timestamp: { $gte: startOfToday() }
  }).count();
  
  // Calculate current occupancy
  const currentOccupancy = entryEvents - exitEvents;
  
  // Update in MongoDB for historical records
  await OccupancyRecord.create({
    timestamp: new Date(),
    currentOccupancy,
    capacity: LIBRARY_CAPACITY
  });
  
  // Update in Firebase for real-time access
  await firebaseDb.ref('library_tracker/occupancy/current').update({
    total: currentOccupancy,
    capacity: LIBRARY_CAPACITY,
    percentage: (currentOccupancy / LIBRARY_CAPACITY) * 100,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  });
  
  // Emit socket event for connected clients
  io.emit('occupancy_update', {
    currentOccupancy,
    capacity: LIBRARY_CAPACITY,
    percentage: (currentOccupancy / LIBRARY_CAPACITY) * 100
  });
}
```

#### 6.2 Seat Post Expiration Job
```javascript
// Pseudocode for seat expiration job
async function expireSeats() {
  const now = new Date();
  
  // Find all active seats that have passed their endTime
  const expiredSeats = await SeatPost.find({
    status: 'active',
    endTime: { $lte: now }
  });
  
  for (const seat of expiredSeats) {
    // Update status in MongoDB
    seat.status = 'expired';
    await seat.save();
    
    // Update in Firebase
    await firebaseDb.ref(`library_tracker/seats/active/${seat._id}`).remove();
    await firebaseDb.ref(`library_tracker/seats/recentlyExpired/${seat._id}`).set({
      ...seat.toJSON(),
      expiredAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Notify connected clients
    io.emit('seat_update', {
      id: seat._id,
      status: 'expired'
    });
  }
}

// Run every minute
setInterval(expireSeats, 60 * 1000);
```

#### 6.3 Image Upload and Processing
```javascript
// Pseudocode for image upload middleware
const uploadSeatImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    
    // Resize image to standard dimensions
    const resizedBuffer = await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Generate filename with UUID
    const filename = `seats/${uuidv4()}.jpg`;
    
    // Upload to Firebase Storage
    const fileRef = storageRef.child(filename);
    await fileRef.put(resizedBuffer, {
      contentType: 'image/jpeg',
    });
    
    // Get public URL
    const imageUrl = await fileRef.getDownloadURL();
    
    // Add to request for controller use
    req.imageUrl = imageUrl;
    next();
  } catch (error) {
    next(error);
  }
};
```

### 7. Frontend Components Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── dashboard/
│   │   ├── OccupancyCounter.tsx
│   │   ├── DailyGraph.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── QuickStats.tsx
│   ├── analytics/
│   │   ├── WeeklyHeatmap.tsx
│   │   ├── TrendChart.tsx
│   │   ├── FilterPanel.tsx
│   │   └── ExportTools.tsx
│   ├── social/
│   │   ├── SeatMap.tsx
│   │   ├── SeatPost.tsx
│   │   ├── SeatForm.tsx
│   │   ├── ImageUploader.tsx
│   │   └── VerificationButtons.tsx
│   ├── preferences/
│   │   ├── NotificationSettings.tsx
│   │   ├── ProfileEditor.tsx
│   │   └── SavedFilters.tsx
│   ├── map/
│   │   ├── LibraryMap.tsx
│   │   ├── ZoneDetails.tsx
│   │   └── ResourceSearch.tsx
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── CapacityEditor.tsx
│   │   └── AnnouncementCreator.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── SocialSeatingPage.tsx
│   ├── PreferencesPage.tsx
│   ├── ResourceMapPage.tsx
│   ├── AdminPage.tsx
│   ├── LoginPage.tsx
│   └── NotFoundPage.tsx
└── services/
    ├── api.ts
    ├── auth.ts
    ├── socket.ts
    ├── firebase.ts
    └── analytics.ts
```

### 8. Project Setup Instructions

#### 8.1 Initial Setup in Replit/Cursor

1. Create two separate projects/repositories:
   - `library-tracker-frontend` (React/TypeScript)
   - `library-tracker-backend` (Node.js/Express)

2. Frontend initialization:
```bash
npx create-react-app library-tracker-frontend --template typescript
cd library-tracker-frontend
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom @reduxjs/toolkit react-redux
npm install chart.js react-chartjs-2 socket.io-client
npm install firebase
npm install react-hook-form zod @hookform/resolvers
```

3. Backend initialization:
```bash
mkdir library-tracker-backend
cd library-tracker-backend
npm init -y
npm install express mongoose dotenv cors helmet socket.io
npm install jsonwebtoken bcryptjs
npm install multer sharp uuid
npm install firebase-admin
npm install --save-dev nodemon
```

#### 8.2 Environment Configuration

1. Frontend `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

2. Backend `.env` file:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-tracker
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
NODE_ENV=development
FIREBASE_CREDENTIALS=./firebase-credentials.json
```

#### 8.3 Database Setup

1. MongoDB Atlas Setup:
   - Create free tier account at https://www.mongodb.com/cloud/atlas
   - Create new cluster
   - Create database user with read/write privileges
   - Configure network access to allow connections from anywhere (for development)
   - Get connection string and add to backend `.env`

2. Firebase Setup:
   - Create project at https://firebase.google.com/
   - Enable Authentication, Realtime Database, and Storage
   - Configure security rules for Realtime Database:
   ```
   {
     "rules": {
       "library_tracker": {
         "occupancy": {
           ".read": true,
           ".write": false,
           "current": {
             ".write": "auth != null && auth.token.admin == true"
           }
         },
         "seats": {
           "active": {
             ".read": true,
             ".write": "auth != null",
             "$seatId": {
               ".write": "auth != null && (newData.child('userId').val() == auth.uid || root.child('users').child(auth.uid).child('role').val() == 'admin')"
             }
           }
         }
       }
     }
   }
   ```
   - Download service account credentials and save as `firebase-credentials.json` in backend root

### 9. Development Milestones

#### 9.1 Phase 1: Core Infrastructure (Week 1-2)
- Set up project repositories and initial configuration
- Implement database models and connections
- Create basic API endpoints
- Set up authentication system
- Implement occupancy calculation logic

#### 9.2 Phase 2: Dashboard & Analytics (Week 3-4)
- Create main dashboard UI
- Implement real-time occupancy updates
- Develop charts and graphs for analytics
- Set up historical data storage and retrieval
- Create filtering and date range selection

#### 9.3 Phase 3: Social Seating Features (Week 5-6)
- Implement seat posting functionality
- Create image upload and storage system
- Develop interactive seating map
- Implement verification system
- Create seat expiration logic

#### 9.4 Phase 4: User Features & Admin Panel (Week 7-8)
- Create user preferences and settings
- Implement notification system
- Develop admin dashboard
- Add announcement creation
- Create resource map

#### 9.5 Phase 5: Testing & Optimization (Week 9-12)
- Comprehensive testing across all features
- Performance optimization
- Mobile responsiveness
- Security hardening
- Documentation and final polish

### 10. Production Considerations

#### 10.1 Scaling Strategy
- Implement MongoDB indexes for frequent queries
- Use Firebase caching strategies
- Consider Redis for additional caching if needed
- Implement pagination for large data sets
- Use image compression and lazy loading

#### 10.2 Security Measures
- Implement rate limiting on APIs
- Use content security policies
- Sanitize all user inputs
- Implement proper CORS configuration
- Regular security audits

#### 10.3 Monitoring & Analytics
- Set up error logging with Sentry or similar service
- Implement user analytics with Firebase Analytics
- Create admin monitoring dashboard
- Regular database usage monitoring

### 11. Appendix

#### 11.1 Helpful Resources
- React TypeScript Documentation: https://create-react-app.dev/docs/adding-typescript/
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- Firebase Documentation: https://firebase.google.com/docs
- Socket.io Documentation: https://socket.io/docs/v4
- Material-UI Documentation: https://mui.com/getting-started/usage/

#### 11.2 Recommended Extensions for Cursor/VSCode
- ESLint
- Prettier
- MongoDB for VS Code
- Firebase Explorer
- React Developer Tools