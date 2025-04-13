# Chulalongkorn Engineering Library Tracker
## Technical Product Requirements Document

### 1. Project Overview

This document provides technical specifications for developing the Chulalongkorn Engineering Library Occupancy Tracker, a full-stack application to monitor and share real-time library occupancy data. This PRD is specifically designed for implementation guidance in development environments like Replit and Cursor.

### 2. Technology Stack

#### 2.1 Frontend
- **Framework**: React 18+ with TypeScript
- **UI Components**: shadcn/ui (Built on Radix UI primitives with Tailwind CSS styling)
- **State Management**: Redux Toolkit or React Query
- **Styling**: Tailwind CSS (integrated with shadcn/ui)
- **Data Visualization**: Chart.js or D3.js for analytics displays
- **Maps/Layout**: React Flow or custom SVG for interactive library maps
- **Real-time Updates**: Socket.io client for live occupancy data
- **Forms Management**: React Hook Form + Zod for validation (recommended by shadcn/ui)
- **Image Processing**: react-image-crop for profile/seat photos
- **Authentication**: Microsoft Authentication Library (MSAL) for Chulalongkorn email integration

#### 2.2 Backend
- **Runtime**: Node.js with Express.js
- **Language**: JavaScript (TypeScript recommended for type safety)
- **API Architecture**: RESTful API with JSON responses
- **Real-time Communication**: Socket.io for live updates
- **Authentication**: JWT-based authentication with Microsoft OAuth integration
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
  studentId: string;        // University ID (extracted from email)
  email: string;            // Must be @student.chula.ac.th
  name: string;
  profileImage?: string;    // URL to profile image
  preferences: {
    notifications: boolean;
    notificationThreshold: number;
    favoriteAreas: string[];
  };
  role: "student" | "admin" | "staff";
  createdAt: Date;
  lastLogin: Date;
  microsoftId: string;      // ID from Microsoft OAuth
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
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth flow
- `GET /api/auth/microsoft/callback` - Handle Microsoft OAuth callback
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

#### 6.1 Chulalongkorn University Authentication System

Chulalongkorn University uses Microsoft Azure Active Directory for their organizational email accounts. All students have an email address in the format `studentID@student.chula.ac.th`. The authentication system will implement Microsoft OAuth integration to ensure only Chulalongkorn students can access the application.

##### 6.1.1 Microsoft Authentication Implementation

```typescript
// Frontend authentication service pseudocode using MSAL
import * as msal from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// Login function
export const loginWithMicrosoft = async () => {
  try {
    const loginRequest = {
      scopes: ['user.read', 'email'],
      prompt: 'select_account'
    };
    
    const response = await msalInstance.loginPopup(loginRequest);
    
    // Verify email domain is @student.chula.ac.th
    if (!response.account.username.endsWith('@student.chula.ac.th')) {
      await msalInstance.logout();
      throw new Error('Only Chulalongkorn University accounts are allowed');
    }
    
    // Get token for API calls
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: response.account
    });
    
    // Send token to your backend for validation and user creation/login
    const apiResponse = await fetch('/api/auth/microsoft/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: tokenResponse.accessToken })
    });
    
    const userData = await apiResponse.json();
    
    // Store user data and JWT from your backend
    localStorage.setItem('authToken', userData.token);
    
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

```javascript
// Backend Microsoft authentication controller pseudocode
const { Client } = require('@microsoft/microsoft-graph-client');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Validate Microsoft token and create/update user
exports.validateMicrosoftToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Create Microsoft Graph client
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      }
    });
    
    // Get user info from Microsoft Graph
    const userDetails = await client.api('/me').get();
    
    // Verify email is from Chulalongkorn
    if (!userDetails.mail.endsWith('@student.chula.ac.th')) {
      return res.status(403).json({ 
        error: 'Only Chulalongkorn University accounts are allowed' 
      });
    }
    
    // Extract student ID from email
    const studentId = userDetails.mail.split('@')[0];
    
    // Find existing user or create new one
    let user = await User.findOne({ email: userDetails.mail });
    
    if (!user) {
      user = new User({
        email: userDetails.mail,
        studentId: studentId,
        name: userDetails.displayName,
        microsoftId: userDetails.id,
        role: 'student'
      });
      await user.save();
    } else {
      // Update existing user info
      user.name = userDetails.displayName;
      user.lastLogin = new Date();
      await user.save();
    }
    
    // Generate JWT token
    const authToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return res.status(200).json({
      token: authToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error) {
    console.error('Microsoft authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
```

##### 6.1.2 Authentication UI with shadcn/ui

```tsx
// LoginPage.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MicrosoftLogo } from '@/components/icons/MicrosoftLogo';
import { loginWithMicrosoft } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loginWithMicrosoft();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Engineering Library Tracker</CardTitle>
          <CardDescription>
            Sign in with your Chulalongkorn University account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleMicrosoftLogin} 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2"
            >
              <MicrosoftLogo className="h-5 w-5" />
              {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
            </Button>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-center text-sm text-slate-600">
              Only @student.chula.ac.th emails are allowed
            </p>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-center text-slate-500 flex justify-center">
          <p>Chulalongkorn University Engineering Library © 2025</p>
        </CardFooter>
      </Card>
    </div>
  );
}
```

#### 6.2 Real-time Occupancy Calculation
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

#### 6.3 Seat Post Expiration Job
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

#### 6.4 Image Upload and Processing
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

### 7. Frontend Components Structure Using shadcn/ui

```
src/
├── components/
│   ├── ui/           # shadcn/ui base components
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
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
│   └── auth/
│       ├── LoginButton.tsx
│       └── AuthGuard.tsx
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

2. Frontend initialization with shadcn/ui:
```bash
# Create Next.js app with TypeScript
npx create-next-app@latest library-tracker-frontend --typescript --tailwind --eslint

cd library-tracker-frontend

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Select these options in the CLI:
# - Styling: Default (tailwind config)
# - Base color: Slate
# - Global CSS: yes
# - CSS variables: yes
# - React Server Components: no
# - Path aliases: yes (@/components)

# Install components
npx shadcn-ui@latest add button card alert dialog tabs avatar input form select sheet toast

# Install additional dependencies
npm install react-router-dom @reduxjs/toolkit react-redux
npm install chart.js react-chartjs-2 socket.io-client
npm install firebase
npm install @azure/msal-browser @azure/msal-react
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
npm install @microsoft/microsoft-graph-client
npm install isomorphic-fetch
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
REACT_APP_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

2. Backend `.env` file:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-tracker
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
NODE_ENV=development
FIREBASE_CREDENTIALS=./firebase-credentials.json
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/microsoft/callback
```

#### 8.3 Microsoft Azure AD Setup

1. Register an app in Azure Portal:
   - Go to Azure Portal (portal.azure.com)
   - Navigate to "Azure Active Directory" > "App registrations" > "New registration"
   - Name your application (e.g., "Engineering Library Tracker")
   - Set supported account types to "Accounts in any organizational directory (Any Azure AD directory)"
   - Set Redirect URI to your frontend URL (for development: http://localhost:3000)
   - After creating, note the Application (client) ID for your .env files
   - Go to "Certificates & secrets" > "New client secret" to generate a secret for backend auth

2. Configure API permissions:
   - Go to "API permissions" > "Add a permission"
   - Select "Microsoft Graph" > "Delegated permissions"
   - Add: "User.Read", "email", "profile"
   - Click "Grant admin consent"

#### 8.4 Database Setup

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

#### 9.1 Phase 1: Core Infrastructure & Authentication (Week 1-2)
- Set up project repositories and initial configuration
- Implement database models and connections
- Set up Microsoft OAuth authentication for Chulalongkorn emails
- Create basic API endpoints
- Implement occupancy calculation logic

#### 9.2 Phase 2: Dashboard & Analytics (Week 3-4)
- Create main dashboard UI with shadcn/ui components
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

#### 11.1 Example shadcn/ui Dashboard Component

```tsx
// DashboardOccupancyCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Users } from "lucide-react";

interface OccupancyCardProps {
  currentOccupancy: number;
  capacity: number;
  lastUpdated: Date;
}

export function DashboardOccupancyCard({ 
  currentOccupancy, 
  capacity, 
  lastUpdated 
}: OccupancyCardProps) {
  const percentage = Math.round((currentOccupancy / capacity) * 100);
  const seatsAvailable = capacity - currentOccupancy;
  
  // Determine status color based on occupancy percentage
  let statusColor = "bg-green-500";
  let statusText = "Plenty of space available";
  
  if (percentage > 85) {
    statusColor = "bg-red-500";
    statusText = "Almost full";
  } else if (percentage > 60) {
    statusColor = "bg-yellow-500";
    statusText = "Filling up";
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Current Occupancy</CardTitle>
          <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
        </div>
        <CardDescription>{statusText}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <span className="text-5xl font-bold">{currentOccupancy}</span>
          <span className="text-2xl text-slate-500">/{capacity}</span>
        </div>
        
        <Progress value={percentage} />
      </CardContent>
    </Card>
  );
}
```

### 12. Page-Specific Implementation Details

#### 12.1 Analytics & Trends Page

##### 12.1.1 Page Overview
The Analytics & Trends page provides historical insights into library usage patterns through interactive visualizations, filters, and data export capabilities.

##### 12.1.2 Component Structure
```
AnalyticsPage/
├── WeeklyHeatmapSection/
│   ├── WeeklyHeatmap.tsx (Heat map showing busy times by day/hour)
│   └── HeatmapControls.tsx (Controls for heatmap display options)
├── TrendsSection/
│   ├── TrendChart.tsx (Line charts for monthly and semester trends)
│   ├── AcademicCalendarOverlay.tsx (Academic event markers for correlation)
│   └── TrendControls.tsx (Controls for trend visualization options)
├── ComparativeSection/
│   ├── PeriodComparisonChart.tsx (Compare two time periods)
│   └── ComparisonControls.tsx (Period selection UI)
├── PeakHoursSection/
│   ├── PeakHoursVisualization.tsx (Statistical insights on peak hours)
│   └── PeakHoursStats.tsx (Numeric representation of peak usage)
├── FilterPanel.tsx (Global date range and filter selector)
└── DataExportPanel.tsx (Export options for analytics data)
```

##### 12.1.3 State Management
```typescript
// Redux slice for analytics state
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsApi } from '@/services/api';

export const fetchWeeklyData = createAsyncThunk(
  'analytics/fetchWeeklyData',
  async (dateRange: { start: Date; end: Date }, { rejectWithValue }) => {
    try {
      const response = await analyticsApi.getWeeklyData(dateRange);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Similar thunks for other data types

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    weeklyData: [],
    trendData: [],
    comparisonData: { period1: [], period2: [] },
    peakHoursData: [],
    loading: {
      weekly: false,
      trends: false,
      comparison: false,
      peakHours: false,
    },
    error: null,
    filters: {
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date(),
      },
      semester: 'current',
      academicYear: 'current',
      showWeekends: true,
      showHolidays: true,
    },
  },
  reducers: {
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
    },
    setSemester: (state, action) => {
      state.filters.semester = action.payload;
    },
    setAcademicYear: (state, action) => {
      state.filters.academicYear = action.payload;
    },
    toggleWeekends: (state) => {
      state.filters.showWeekends = !state.filters.showWeekends;
    },
    toggleHolidays: (state) => {
      state.filters.showHolidays = !state.filters.showHolidays;
    },
    // Additional reducers for other filter options
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeklyData.pending, (state) => {
        state.loading.weekly = true;
      })
      .addCase(fetchWeeklyData.fulfilled, (state, action) => {
        state.loading.weekly = false;
        state.weeklyData = action.payload;
      })
      .addCase(fetchWeeklyData.rejected, (state, action) => {
        state.loading.weekly = false;
        state.error = action.payload;
      });
    // Add cases for other async thunks
  },
});

export const { 
  setDateRange,
  setSemester,
  setAcademicYear,
  toggleWeekends,
  toggleHolidays
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
```

##### 12.1.4 Key Components Implementation

###### WeeklyHeatmap.tsx
```tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeeklyData } from '@/store/slices/analyticsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RootState, AppDispatch } from '@/store';
import HeatmapChart from './HeatmapChart';

export function WeeklyHeatmap() {
  const dispatch = useDispatch<AppDispatch>();
  const { weeklyData, loading, filters } = useSelector((state: RootState) => state.analytics);
  
  useEffect(() => {
    dispatch(fetchWeeklyData(filters.dateRange));
  }, [dispatch, filters.dateRange]);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hoursOfDay = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`); // 8am to 10pm
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Weekly Occupancy Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        {loading.weekly ? (
          <Skeleton className="w-full h-[400px] rounded-md" />
        ) : (
          <HeatmapChart 
            data={weeklyData}
            xLabels={daysOfWeek}
            yLabels={hoursOfDay}
            xLabel="Day of Week"
            yLabel="Hour of Day"
            colorScale={[
              { value: 0, color: '#f7fbff' },
              { value: 0.25, color: '#c6dbef' },
              { value: 0.5, color: '#6baed6' },
              { value: 0.75, color: '#3182bd' },
              { value: 1, color: '#08519c' }
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
```

###### FilterPanel.tsx
```tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setDateRange,
  setSemester,
  setAcademicYear,
  toggleWeekends,
  toggleHolidays
} from '@/store/slices/analyticsSlice';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon, DownloadIcon } from 'lucide-react';
import { format } from 'date-fns';
import { RootState } from '@/store';

export function FilterPanel() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.analytics);
  
  // Current academic year for display
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}/${currentYear}`,
    `${currentYear-2}/${currentYear-1}`,
    `${currentYear-3}/${currentYear-2}`
  ];
  
  const semesters = ['First Semester', 'Second Semester', 'Summer'];
  
  const handleDateRangeChange = (dates: { from: Date; to: Date }) => {
    dispatch(setDateRange({ start: dates.from, end: dates.to }));
  };
  
  const handleSemesterChange = (value: string) => {
    dispatch(setSemester(value));
  };
  
  const handleAcademicYearChange = (value: string) => {
    dispatch(setAcademicYear(value));
  };
  
  const handleWeekendsToggle = () => {
    dispatch(toggleWeekends());
  };
  
  const handleHolidaysToggle = () => {
    dispatch(toggleHolidays());
  };
  
  return (
    <Card className="shadow-md mb-6">
      <CardHeader>
        <CardTitle>Analytics Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range Selector */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(filters.dateRange.start, 'PPP')} - {format(filters.dateRange.end, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ 
                    from: filters.dateRange.start, 
                    to: filters.dateRange.end 
                  }}
                  onSelect={handleDateRangeChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Academic Period Selectors */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={filters.academicYear} onValueChange={handleAcademicYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={filters.semester} onValueChange={handleSemesterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Toggle Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-weekends"
                checked={filters.showWeekends}
                onCheckedChange={handleWeekendsToggle}
              />
              <Label htmlFor="show-weekends">Show Weekends</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-holidays"
                checked={filters.showHolidays}
                onCheckedChange={handleHolidaysToggle}
              />
              <Label htmlFor="show-holidays">Show Holidays</Label>
            </div>
            
            <Button className="mt-4 w-full flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

##### 12.1.5 Data Models and Service Functions

```typescript
// API service functions
export const analyticsApi = {
  getWeeklyData: (dateRange: { start: Date; end: Date }) => 
    axios.get('/api/analytics/weekly', { params: { 
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString()
    }}),
  
  getTrendData: (params: { 
    startDate: string; 
    endDate: string; 
    interval: 'day' | 'week' | 'month';
  }) => axios.get('/api/analytics/trends', { params }),
  
  getComparisonData: (params: {
    period1Start: string;
    period1End: string;
    period2Start: string;
    period2End: string;
  }) => axios.get('/api/analytics/compare', { params }),
  
  getPeakHoursData: (params: {
    startDate: string;
    endDate: string;
    days: string[];
  }) => axios.get('/api/analytics/peak-hours', { params }),
  
  exportData: (params: {
    format: 'csv' | 'pdf';
    startDate: string;
    endDate: string;
    type: 'occupancy' | 'trends' | 'peak-hours';
  }) => axios.get('/api/analytics/export', { 
    params,
    responseType: params.format === 'csv' ? 'blob' : 'blob'
  }),
};

// Weekly heatmap data structure
interface WeeklyHeatmapData {
  day: number;       // 0-6 (Monday-Sunday)
  hour: number;      // 0-23
  value: number;     // 0-1 (normalized occupancy)
  rawValue: number;  // Actual occupancy count
  capacity: number;  // Max capacity for that time
}

// Monthly trend data structure
interface TrendDataPoint {
  date: string;
  occupancy: number;
  capacity: number;
  events?: {
    name: string;
    type: 'exam' | 'holiday' | 'special';
  }[];
}

// Peak hours analysis structure
interface PeakHoursData {
  hour: number;
  averageOccupancy: number;
  standardDeviation: number;
  percentCapacity: number;
  frequency: number; // How often this hour is in the top 3 busiest
}
```

##### 12.1.6 Backend Implementation (Express Route Handlers)

```javascript
// analytics.controller.js
const OccupancyRecord = require('../models/OccupancyRecord');
const AcademicCalendar = require('../models/AcademicCalendar');

// Get weekly heatmap data
exports.getWeeklyData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date range' });
    }
    
    // Aggregate data by day of week and hour
    const weeklyData = await OccupancyRecord.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          day: { $dayOfWeek: "$timestamp" }, // 1-7 for Sunday-Saturday
          hour: { $hour: "$timestamp" },
          currentOccupancy: 1,
          capacity: 1
        }
      },
      {
        $group: {
          _id: { day: "$day", hour: "$hour" },
          avgOccupancy: { $avg: "$currentOccupancy" },
          maxCapacity: { $max: "$capacity" }
        }
      },
      {
        $project: {
          _id: 0,
          day: { $subtract: ["$_id.day", 1] }, // Convert to 0-6 for Monday-Sunday
          hour: "$_id.hour",
          value: { $divide: ["$avgOccupancy", "$maxCapacity"] }, // Normalize to 0-1
          rawValue: "$avgOccupancy",
          capacity: "$maxCapacity"
        }
      },
      {
        $sort: { day: 1, hour: 1 }
      }
    ]);
    
    return res.json(weeklyData);
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get monthly/semester trends with academic calendar overlay
exports.getTrendData = async (req, res) => {
  try {
    const { startDate, endDate, interval } = req.query;
    
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date range' });
    }
    
    // Determine group interval format
    let groupFormat;
    switch(interval) {
      case 'day':
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
        break;
      case 'week':
        groupFormat = { 
          year: { $year: "$timestamp" },
          week: { $week: "$timestamp" }
        };
        break;
      case 'month':
      default:
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
    }
    
    // Aggregate occupancy data
    const occupancyData = await OccupancyRecord.aggregate([
      {
        $match: {
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: groupFormat,
          avgOccupancy: { $avg: "$currentOccupancy" },
          maxCapacity: { $max: "$capacity" }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: interval === 'week' ? 
            { $concat: [{ $toString: "$_id.year" }, "-W", { $toString: "$_id.week" }] } : 
            "$_id",
          occupancy: "$avgOccupancy",
          capacity: "$maxCapacity"
        }
      }
    ]);
    
    // Get academic calendar events for the same period
    const academicEvents = await AcademicCalendar.find({
      date: { $gte: start, $lte: end }
    }).select('date name type');
    
    // Combine data with academic events
    const result = occupancyData.map(dataPoint => {
      const formattedDate = dataPoint.date;
      
      // Find events that match this data point's date period
      const events = academicEvents.filter(event => {
        if (interval === 'day') {
          return event.date.toISOString().split('T')[0] === formattedDate;
        } else if (interval === 'week') {
          const eventYear = event.date.getFullYear();
          const eventWeek = getWeekNumber(event.date);
          return `${eventYear}-W${eventWeek}` === formattedDate;
        } else { // month
          return event.date.toISOString().substring(0, 7) === formattedDate;
        }
      }).map(event => ({
        name: event.name,
        type: event.type,
        date: event.date
      }));
      
      return {
        ...dataPoint,
        events: events.length > 0 ? events : undefined
      };
    });
    
    return res.json(result);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Additional controller methods for other analytics endpoints...
```
```

#### 12.2 Social Seating Page

##### 12.2.1 Page Overview
The Social Seating page provides a community-driven platform for students to share real-time seat availability information through an interactive library map, photo uploads, and verification mechanisms.

##### 12.2.2 Component Structure
```
SocialSeatingPage/
├── LibraryMapSection/
│   ├── InteractiveMap.tsx (SVG map of library layout with clickable areas)
│   ├── MapControls.tsx (Zoom, pan, filter controls for map)
│   └── SeatPointer.tsx (Individual seat location indicators)
├── SeatPostSection/
│   ├── SeatPostForm.tsx (Form for creating new seat posts)
│   ├── ImageUploader.tsx (Photo upload component)
│   ├── DurationSelector.tsx (How long user plans to stay)
│   └── GroupSizeSelector.tsx (Number of people in group)
├── SeatFeedSection/
│   ├── SeatFeed.tsx (Real-time feed of recent posts)
│   ├── SeatPostCard.tsx (Individual post with details)
│   └── VerificationControls.tsx (UI for confirming/disputing seats)
├── FilterSection/
│   ├── AreaFilter.tsx (Filter by library zone/area)
│   ├── DurationFilter.tsx (Filter by available time)
│   └── ResourceFilter.tsx (Filter by available resources)
└── HeatMapOverlay.tsx (Visualization of crowded areas)
```

##### 12.2.3 State Management
```typescript
// Redux slice for social seating
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { seatApi } from '@/services/api';
import { socket } from '@/services/socket';

export const fetchActiveSeatPosts = createAsyncThunk(
  'seats/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await seatApi.getActivePosts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createSeatPost = createAsyncThunk(
  'seats/create',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await seatApi.createPost(postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifySeatPost = createAsyncThunk(
  'seats/verify',
  async ({ id, verification }, { rejectWithValue }) => {
    try {
      const response = await seatApi.verifyPost(id, verification);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const socialSeatingSlice = createSlice({
  name: 'socialSeating',
  initialState: {
    seatPosts: [],
    loading: {
      posts: false,
      creating: false,
      verifying: false
    },
    error: null,
    selectedZone: 'all',
    durationFilter: 0, // minimum minutes available
    filters: {
      floor: 'all',
      zone: 'all',
      resources: [],
      groupSize: 1
    },
    mapView: {
      zoom: 1,
      center: { x: 0, y: 0 },
      showHeatmap: false
    },
    postForm: {
      isOpen: false,
      position: null
    }
  },
  reducers: {
    setSelectedZone: (state, action) => {
      state.selectedZone = action.payload;
    },
    setDurationFilter: (state, action) => {
      state.durationFilter = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateMapView: (state, action) => {
      state.mapView = { ...state.mapView, ...action.payload };
    },
    toggleHeatmap: (state) => {
      state.mapView.showHeatmap = !state.mapView.showHeatmap;
    },
    openPostForm: (state, action) => {
      state.postForm = {
        isOpen: true,
        position: action.payload
      };
    },
    closePostForm: (state) => {
      state.postForm.isOpen = false;
    },
    removeSeatPost: (state, action) => {
      const postId = action.payload;
      state.seatPosts = state.seatPosts.filter(post => post._id !== postId);
    },
    updateSeatPost: (state, action) => {
      const updatedPost = action.payload;
      const index = state.seatPosts.findIndex(post => post._id === updatedPost._id);
      if (index !== -1) {
        state.seatPosts[index] = updatedPost;
      }
    },
    addSeatPost: (state, action) => {
      state.seatPosts.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSeatPosts.pending, (state) => {
        state.loading.posts = true;
      })
      .addCase(fetchActiveSeatPosts.fulfilled, (state, action) => {
        state.loading.posts = false;
        state.seatPosts = action.payload;
      })
      .addCase(fetchActiveSeatPosts.rejected, (state, action) => {
        state.loading.posts = false;
        state.error = action.payload;
      })
      .addCase(createSeatPost.pending, (state) => {
        state.loading.creating = true;
      })
      .addCase(createSeatPost.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.seatPosts.unshift(action.payload);
        state.postForm.isOpen = false;
      })
      .addCase(createSeatPost.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload;
      })
      .addCase(verifySeatPost.pending, (state) => {
        state.loading.verifying = true;
      })
      .addCase(verifySeatPost.fulfilled, (state, action) => {
        state.loading.verifying = false;
        const updatedPost = action.payload;
        const index = state.seatPosts.findIndex(post => post._id === updatedPost._id);
        if (index !== -1) {
          state.seatPosts[index] = updatedPost;
        }
      })
      .addCase(verifySeatPost.rejected, (state, action) => {
        state.loading.verifying = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedZone,
  setDurationFilter,
  setFilters,
  updateMapView,
  toggleHeatmap,
  openPostForm,
  closePostForm,
  removeSeatPost,
  updateSeatPost,
  addSeatPost
} = socialSeatingSlice.actions;

export default socialSeatingSlice.reducer;
```

##### 12.2.4 Socket.IO Integration

```typescript
// Socket service for real-time updates
import { io } from 'socket.io-client';
import { store } from '@/store';
import { 
  addSeatPost, 
  updateSeatPost, 
  removeSeatPost 
} from '@/store/slices/socialSeatingSlice';

const socket = io(process.env.REACT_APP_SOCKET_URL);

export const initializeSeatSocket = () => {
  // Listen for new seat posts
  socket.on('new_seat_post', (seatPost) => {
    store.dispatch(addSeatPost(seatPost));
  });
  
  // Listen for seat updates (verifications, etc.)
  socket.on('seat_update', (updatedSeat) => {
    store.dispatch(updateSeatPost(updatedSeat));
  });
  
  // Listen for seat removals or expirations
  socket.on('seat_removed', (seatId) => {
    store.dispatch(removeSeatPost(seatId));
  });
  
  return () => {
    socket.off('new_seat_post');
    socket.off('seat_update');
    socket.off('seat_removed');
  };
};

export const emitSeatVerification = (seatId, verification) => {
  socket.emit('seat_verification', { seatId, verification });
};

export { socket };
```

##### 12.2.5 Key Components Implementation

###### InteractiveMap.tsx
```tsx
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openPostForm, setSelectedZone } from '@/store/slices/socialSeatingSlice';
import { RootState } from '@/store';
import SeatPointer from './SeatPointer';
import HeatMapOverlay from './HeatMapOverlay';
import { Button } from '@/components/ui/button';
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  MoveIcon 
} from 'lucide-react';

export function InteractiveMap() {
  const dispatch = useDispatch();
  const { seatPosts, selectedZone, mapView } = useSelector(
    (state: RootState) => state.socialSeating
  );
  
  const [isPanning, setIsPanning] = useState(false);
  const mapRef = useRef(null);
  
  // Map zone definitions
  const zones = [
    { id: 'quiet_zone', name: 'Quiet Zone', path: 'M10,10 L200,10 L200,100 L10,100 Z', fill: '#e2f0cb' },
    { id: 'computers', name: 'Computer Area', path: 'M210,10 L400,10 L400,100 L210,100 Z', fill: '#b5d8eb' },
    { id: 'group_study', name: 'Group Study', path: 'M10,110 L200,110 L200,200 L10,200 Z', fill: '#ffd5cd' },
    { id: 'individual', name: 'Individual Study', path: 'M210,110 L400,110 L400,200 L210,200 Z', fill: '#d7bde2' }
  ];
  
  const handleZoomIn = () => {
    dispatch(updateMapView({ zoom: Math.min(mapView.zoom + 0.2, 3) }));
  };
  
  const handleZoomOut = () => {
    dispatch(updateMapView({ zoom: Math.max(mapView.zoom - 0.2, 0.5) }));
  };
  
  const handleMapClick = (e) => {
    if (isPanning) return;
    
    // Get click coordinates relative to the SVG
    const svgRect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - svgRect.left) / mapView.zoom;
    const y = (e.clientY - svgRect.top) / mapView.zoom;
    
    // Open post form at clicked position
    dispatch(openPostForm({ x, y }));
  };
  
  const handleMouseDown = () => {
    if (mapView.zoom > 1) {
      setIsPanning(true);
    }
  };
  
  const handleMouseMove = (e) => {
    if (isPanning && mapRef.current) {
      // Pan the map based on mouse movement
      dispatch(updateMapView({
        center: {
          x: mapView.center.x - e.movementX / mapView.zoom,
          y: mapView.center.y - e.movementY / mapView.zoom
        }
      }));
    }
  };
  
  const handleMouseUp = () => {
    setIsPanning(false);
  };
  
  const handleZoneClick = (zoneId) => {
    // Select this zone for filtering
    dispatch(setSelectedZone(zoneId));
    // Prevent propagation to the general map click handler
    event.stopPropagation();
  };
  
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button size="sm" variant="outline" onClick={handleZoomIn}>
          <ZoomInIcon size={16} />
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomOut}>
          <ZoomOutIcon size={16} />
        </Button>
        <Button 
          size="sm" 
          variant={isPanning ? "default" : "outline"}
          onClick={() => setIsPanning(!isPanning)}
        >
          <MoveIcon size={16} />
        </Button>
      </div>
      
      <svg
        ref={mapRef}
        width="100%"
        height="500"
        viewBox={`0 0 400 200`}
        style={{
          transform: `scale(${mapView.zoom}) translate(${-mapView.center.x}px, ${-mapView.center.y}px)`,
          cursor: isPanning ? 'grab' : 'pointer'
        }}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Library floor plan and zones */}
        <rect x="0" y="0" width="400" height="200" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="2" />
        
        {zones.map(zone => (
          <path
            key={zone.id}
            d={zone.path}
            fill={selectedZone === zone.id ? zone.fill : `${zone.fill}80`}
            stroke="#495057"
            strokeWidth="1"
            onClick={() => handleZoneClick(zone.id)}
          >
            <title>{zone.name}</title>
          </path>
        ))}
        
        {/* Render heat map overlay if enabled */}
        {mapView.showHeatmap && <HeatMapOverlay seatPosts={seatPosts} />}
        
        {/* Render seat pointers for all active posts */}
        {seatPosts.map(post => (
          <SeatPointer
            key={post._id}
            post={post}
            isSelected={false}
          />
        ))}
      </svg>
    </div>
  );
}
```

###### SeatPostForm.tsx
```tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSeatPost, closePostForm } from '@/store/slices/socialSeatingSlice';
import { RootState, AppDispatch } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ImageUploader from './ImageUploader';
import { Clock, Users, MapPin } from 'lucide-react';

export function SeatPostForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { postForm, loading, selectedZone } = useSelector(
    (state: RootState) => state.socialSeating
  );
  
  const [formData, setFormData] = useState({
    imageUrl: '',
    duration: 60, // minutes
    groupSize: 1,
    message: '',
    isAnonymous: false,
    zone: selectedZone
  });
  
  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };
  
  const handleDurationChange = (value) => {
    setFormData(prev => ({ ...prev, duration: value[0] }));
  };
  
  const handleGroupSizeChange = (e) => {
    const groupSize = parseInt(e.target.value, 10);
    if (!isNaN(groupSize) && groupSize > 0) {
      setFormData(prev => ({ ...prev, groupSize }));
    }
  };
  
  const handleMessageChange = (e) => {
    setFormData(prev => ({ ...prev, message: e.target.value }));
  };
  
  const toggleAnonymous = () => {
    setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }));
  };
  
  const handleSubmit = async () => {
    // Calculate end time based on duration
    const endTime = new Date(Date.now() + formData.duration * 60 * 1000);
    
    await dispatch(createSeatPost({
      ...formData,
      location: {
        zone: formData.zone,
        coordinates: postForm.position
      },
      endTime
    }));
  };
  
  return (
    <Dialog open={postForm.isOpen} onOpenChange={() => dispatch(closePostForm())}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" /> Share Seat Availability
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Image Uploader */}
          <div className="space-y-2">
            <Label htmlFor="image">Photo of Area (Optional)</Label>
            <ImageUploader onImageUploaded={handleImageUpload} />
          </div>
          
          {/* Duration Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="duration">How long will you stay?</Label>
              <span className="text-sm font-medium">
                {formData.duration < 60 
                  ? `${formData.duration} minutes` 
                  : `${Math.floor(formData.duration / 60)} hours ${formData.duration % 60} minutes`}
              </span>
            </div>
            <Slider
              id="duration"
              value={[formData.duration]}
              min={15}
              max={240}
              step={15}
              onValueChange={handleDurationChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15min</span>
              <span>1h</span>
              <span>2h</span>
              <span>3h</span>
              <span>4h</span>
            </div>
          </div>
          
          {/* Group Size */}
          <div className="space-y-2">
            <Label htmlFor="group-size">Group Size</Label>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="group-size"
                type="number"
                min="1"
                max="10"
                value={formData.groupSize}
                onChange={handleGroupSizeChange}
              />
            </div>
          </div>
          
          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Status Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="E.g., Near the window, has power outlets..."
              value={formData.message}
              onChange={handleMessageChange}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.message.length}/100 characters
            </p>
          </div>
          
          {/* Anonymous Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={toggleAnonymous}
            />
            <Label htmlFor="anonymous">Post Anonymously</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => dispatch(closePostForm())}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading.creating}
          >
            {loading.creating ? 'Posting...' : 'Share Seat Info'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

###### SeatPostCard.tsx
```tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { verifySeatPost } from '@/store/slices/socialSeatingSlice';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Clock, Users, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SeatPostCardProps {
  post: any;
}

export function SeatPostCard({ post }: SeatPostCardProps) {
  const dispatch = useDispatch();
  
  const handleVerify = (verification) => {
    dispatch(verifySeatPost({ id: post._id, verification }));
  };
  
  // Calculate remaining time
  const endTime = new Date(post.endTime);
  const now = new Date();
  const minutesRemaining = Math.max(0, Math.floor((endTime - now) / (1000 * 60)));
  
  // Format remaining time
  let remainingTimeDisplay;
  if (minutesRemaining > 60) {
    const hours = Math.floor(minutesRemaining / 60);
    const minutes = minutesRemaining % 60;
    remainingTimeDisplay = `${hours}h ${minutes}m remaining`;
  } else {
    remainingTimeDisplay = `${minutesRemaining}m remaining`;
  }
  
  // Get zone name from zone ID
  const zoneNames = {
    'quiet_zone': 'Quiet Zone',
    'computers': 'Computer Area',
    'group_study': 'Group Study',
    'individual': 'Individual Study',
    'all': 'Unknown Area'
  };
  
  const zoneName = zoneNames[post.location.zone] || 'Unknown Area';
  
  return (
    <Card className="mb-4 overflow-hidden">
      {post.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt="Seat area" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            {!post.isAnonymous && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={post.user?.profileImage} />
                <AvatarFallback>{post.user?.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="font-medium">
                {post.isAnonymous ? 'Anonymous' : post.user?.name || 'Unknown User'}
              </p>
              <p className="text-xs text-muted-foreground">
                Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <Badge variant="outline" className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {zoneName}
          </Badge>
        </div>
        
        {post.message && (
          <p className="text-sm mb-4">{post.message}</p>
        )}
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{remainingTimeDisplay}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{post.groupSize} {post.groupSize === 1 ? 'person' : 'people'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Accurate?</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => handleVerify('positive')}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{post.verifications?.positive || 0}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => handleVerify('negative')}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{post.verifications?.negative || 0}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

##### 12.2.6 Backend Implementation (Express Route Handlers)

```javascript
// seats.controller.js
const SeatPost = require('../models/SeatPost');
const User = require('../models/User');
const firebaseDb = require('../config/firebase');
const { io } = require('../config/socket');

// Get all active seat posts
exports.getActivePosts = async (req, res) => {
  try {
    const now = new Date();
    
    const posts = await SeatPost.find({
      status: 'active',
      endTime: { $gt: now }
    })
    .sort({ createdAt: -1 })
    .populate({
      path: 'userId',
      select: 'name profileImage -_id'
    });
    
    // Format posts with user information
    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        user: post.userId,
        userId: undefined // Remove redundant userId
      };
    });
    
    return res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching active posts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new seat post
exports.createPost = async (req, res) => {
  try {
    const { location, imageUrl, duration, endTime, groupSize, message, isAnonymous } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Create new post in MongoDB
    const newPost = new SeatPost({
      userId,
      location,
      imageUrl,
      duration,
      endTime,
      groupSize,
      message: message || '',
      isAnonymous,
      verifications: { positive: 0, negative: 0 },
      status: 'active',
      createdAt: new Date()
    });
    
    await newPost.save();
    
    // Get user details
    const user = await User.findById(userId).select('name profileImage');
    
    // Format post for response
    const postWithUser = {
      ...newPost.toObject(),
      user: isAnonymous ? null : {
        name: user.name,
        profileImage: user.profileImage
      }
    };
    delete postWithUser.userId;
    
    // Update in Firebase for real-time access
    await firebaseDb.ref(`library_tracker/seats/active/${newPost._id}`).set(postWithUser);
    
    // Notify connected clients
    io.emit('new_seat_post', postWithUser);
    
    return res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Error creating seat post:', error);
    return res.status(500).json({ error: 'Failed to create seat post' });
  }
};

// Verify or dispute seat post
exports.verifyPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { verification } = req.body;
    
    if (!['positive', 'negative'].includes(verification)) {
      return res.status(400).json({ error: 'Invalid verification type' });
    }
    
    // Find and update the post
    const post = await SeatPost.findById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.status !== 'active') {
      return res.status(400).json({ error: 'Cannot verify an inactive post' });
    }
    
    // Increment the appropriate verification counter
    post.verifications[verification] += 1;
    await post.save();
    
    // Get user details for response
    let userInfo = null;
    if (!post.isAnonymous) {
      const user = await User.findById(post.userId).select('name profileImage');
      userInfo = {
        name: user.name,
        profileImage: user.profileImage
      };
    }
    
    // Format post for response
    const updatedPost = {
      ...post.toObject(),
      user: userInfo
    };
    delete updatedPost.userId;
    
    // Update in Firebase
    await firebaseDb.ref(`library_tracker/seats/active/${post._id}`).update({
      verifications: post.verifications
    });
    
    // Notify connected clients
    io.emit('seat_update', updatedPost);
    
    return res.json(updatedPost);
  } catch (error) {
    console.error('Error verifying seat post:', error);
    return res.status(500).json({ error: 'Failed to verify seat post' });
  }
};

// Additional controller methods for updating and deleting posts...
```
```

#### 12.3 User Preferences & Notifications Page

##### 12.3.1 Page Overview
The User Preferences & Notifications page allows students to personalize their experience with the library tracker application. It includes notification settings, personal usage statistics, favorite study areas, and other customization options.

##### 12.3.2 Component Structure
```
PreferencesPage/
├── ProfileSection/
│   ├── ProfileCard.tsx (User information display)
│   └── ProfileEditor.tsx (Edit name, profile image)
├── NotificationSection/
│   ├── NotificationSettings.tsx (Toggle notifications on/off)
│   ├── ThresholdSelector.tsx (Occupancy level for alerts)
│   └── ChannelPreferences.tsx (Push, email, SMS options)
├── FavoritesSection/
│   ├── FavoriteAreaSelector.tsx (Preferred library zones)
│   ├── FavoriteTimeSelector.tsx (Typical study times)
│   └── QuickAccessSettings.tsx (Dashboard customization)
├── UsageStatsSection/
│   ├── PersonalStats.tsx (Visualize personal library usage)
│   ├── TimeDistribution.tsx (When user typically visits)
│   └── StreakDisplay.tsx (Consecutive days visited)
└── SavedFiltersSection/
    ├── SavedFiltersList.tsx (Previously saved analytics filters)
    └── FilterManager.tsx (Create, edit, delete saved filters)
```

##### 12.3.3 State Management
```typescript
// Redux slice for user preferences
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { preferencesApi } from '@/services/api';

export const fetchUserPreferences = createAsyncThunk(
  'preferences/fetchUserPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.getUserPreferences();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'preferences/updateUserPreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.updateUserPreferences(preferencesData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const subscribeToNotifications = createAsyncThunk(
  'preferences/subscribeToNotifications',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.subscribeToNotifications(subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserStatistics = createAsyncThunk(
  'preferences/fetchUserStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await preferencesApi.getUserStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    user: {
      name: '',
      email: '',
      profileImage: '',
      studentId: ''
    },
    preferences: {
      notifications: true,
      notificationThreshold: 80, // percentage
      notificationChannels: {
        push: true,
        email: false,
        sms: false
      },
      favoriteAreas: [],
      favoriteTimes: {
        morning: false,
        afternoon: true,
        evening: false
      },
      dashboardWidgets: {
        currentOccupancy: true,
        personalStats: true,
        recentPosts: true,
        quickAccess: true
      }
    },
    statistics: {
      visitsThisMonth: 0,
      totalHours: 0,
      averageDuration: 0,
      currentStreak: 0,
      topVisitTimes: [],
      visitsByDay: []
    },
    savedFilters: [],
    loading: {
      preferences: false,
      statistics: false,
      updating: false
    },
    error: null
  },
  reducers: {
    setNotificationsEnabled: (state, action) => {
      state.preferences.notifications = action.payload;
    },
    setNotificationThreshold: (state, action) => {
      state.preferences.notificationThreshold = action.payload;
    },
    toggleNotificationChannel: (state, action) => {
      const channel = action.payload;
      state.preferences.notificationChannels[channel] = 
        !state.preferences.notificationChannels[channel];
    },
    toggleFavoriteArea: (state, action) => {
      const areaId = action.payload;
      const index = state.preferences.favoriteAreas.indexOf(areaId);
      
      if (index > -1) {
        state.preferences.favoriteAreas.splice(index, 1);
      } else {
        state.preferences.favoriteAreas.push(areaId);
      }
    },
    toggleFavoriteTime: (state, action) => {
      const timeOfDay = action.payload;
      state.preferences.favoriteTimes[timeOfDay] = 
        !state.preferences.favoriteTimes[timeOfDay];
    },
    toggleDashboardWidget: (state, action) => {
      const widget = action.payload;
      state.preferences.dashboardWidgets[widget] = 
        !state.preferences.dashboardWidgets[widget];
    },
    deleteSavedFilter: (state, action) => {
      const filterId = action.payload;
      state.savedFilters = state.savedFilters.filter(filter => filter.id !== filterId);
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUserPreferences
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading.preferences = true;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false;
        state.user = action.payload.user;
        state.preferences = action.payload.preferences;
        state.savedFilters = action.payload.savedFilters;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading.preferences = false;
        state.error = action.payload;
      })
      
      // Handle updateUserPreferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading.updating = true;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading.updating = false;
        state.preferences = action.payload.preferences;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.payload;
      })
      
      // Handle fetchUserStatistics
      .addCase(fetchUserStatistics.pending, (state) => {
        state.loading.statistics = true;
      })
      .addCase(fetchUserStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchUserStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.error = action.payload;
      });
      
      // Additional handling for subscribeToNotifications...
  }
});

export const { 
  setNotificationsEnabled,
  setNotificationThreshold,
  toggleNotificationChannel,
  toggleFavoriteArea,
  toggleFavoriteTime,
  toggleDashboardWidget,
  deleteSavedFilter
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
```

##### 12.3.4 Key Components Implementation

###### NotificationSettings.tsx
```tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserPreferences, 
  updateUserPreferences,
  setNotificationsEnabled,
  setNotificationThreshold,
  toggleNotificationChannel
} from '@/store/slices/preferencesSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';

export function NotificationSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const { preferences, loading } = useSelector((state: RootState) => state.preferences);
  
  useEffect(() => {
    dispatch(fetchUserPreferences());
  }, [dispatch]);
  
  const handleNotificationsToggle = () => {
    dispatch(setNotificationsEnabled(!preferences.notifications));
  };
  
  const handleThresholdChange = (value: number[]) => {
    dispatch(setNotificationThreshold(value[0]));
  };
  
  const handleChannelToggle = (channel: 'push' | 'email' | 'sms') => {
    dispatch(toggleNotificationChannel(channel));
  };
  
  const handleSaveChanges = () => {
    dispatch(updateUserPreferences({
      notifications: preferences.notifications,
      notificationThreshold: preferences.notificationThreshold,
      notificationChannels: preferences.notificationChannels
    }));
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control when and how you receive alerts about library occupancy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main notification toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Receive notifications</Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable all notifications from the system
            </p>
          </div>
          <Switch
            id="notifications"
            checked={preferences.notifications}
            onCheckedChange={handleNotificationsToggle}
          />
        </div>
        
        {preferences.notifications && (
          <>
            {/* Occupancy threshold slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="threshold">Notify me when occupancy exceeds</Label>
                <span className="font-medium">{preferences.notificationThreshold}%</span>
              </div>
              <Slider
                id="threshold"
                value={[preferences.notificationThreshold]}
                min={50}
                max={95}
                step={5}
                onValueChange={handleThresholdChange}
                disabled={!preferences.notifications}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>75%</span>
                <span>95%</span>
              </div>
            </div>
            
            {/* Notification channels */}
            <div className="space-y-4">
              <Label>Notification channels</Label>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="push-notifications" className="cursor-pointer">
                    Push notifications
                  </Label>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.notificationChannels.push}
                  onCheckedChange={() => handleChannelToggle('push')}
                  disabled={!preferences.notifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-notifications" className="cursor-pointer">
                    Email notifications
                  </Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notificationChannels.email}
                  onCheckedChange={() => handleChannelToggle('email')}
                  disabled={!preferences.notifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sms-notifications" className="cursor-pointer">
                    SMS notifications
                  </Label>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences.notificationChannels.sms}
                  onCheckedChange={() => handleChannelToggle('sms')}
                  disabled={!preferences.notifications}
                />
              </div>
            </div>
          </>
        )}
        
        <Button 
          onClick={handleSaveChanges} 
          disabled={loading.updating}
          className="w-full mt-4"
        >
          {loading.updating ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

###### FavoriteAreaSelector.tsx
```tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavoriteArea, updateUserPreferences } from '@/store/slices/preferencesSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { RootState } from '@/store';

export function FavoriteAreaSelector() {
  const dispatch = useDispatch();
  const { preferences, loading } = useSelector((state: RootState) => state.preferences);
  
  // Library zones available for selection
  const libraryZones = [
    { id: 'quiet_zone', name: 'Quiet Zone' },
    { id: 'computers', name: 'Computer Area' },
    { id: 'group_study', name: 'Group Study Area' },
    { id: 'individual', name: 'Individual Study Area' },
    { id: 'reading_room', name: 'Reading Room' },
    { id: 'multimedia', name: 'Multimedia Section' }
  ];
  
  const handleAreaToggle = (zoneId) => {
    dispatch(toggleFavoriteArea(zoneId));
  };
  
  const handleSaveChanges = () => {
    dispatch(updateUserPreferences({
      favoriteAreas: preferences.favoriteAreas
    }));
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Favorite Study Areas</CardTitle>
        <CardDescription>
          Select your preferred library zones to quickly filter and check availability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {libraryZones.map(zone => (
            <div key={zone.id} className="flex items-center space-x-2">
              <Checkbox
                id={`zone-${zone.id}`}
                checked={preferences.favoriteAreas.includes(zone.id)}
                onCheckedChange={() => handleAreaToggle(zone.id)}
              />
              <Label
                htmlFor={`zone-${zone.id}`}
                className="cursor-pointer flex items-center"
              >
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {zone.name}
              </Label>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleSaveChanges} 
          disabled={loading.updating}
          className="w-full"
        >
          {loading.updating ? 'Saving...' : 'Save Favorite Areas'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

###### PersonalStats.tsx
```tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserStatistics } from '@/store/slices/preferencesSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function PersonalStats() {
  const dispatch = useDispatch<AppDispatch>();
  const { statistics, loading } = useSelector((state: RootState) => state.preferences);
  
  useEffect(() => {
    dispatch(fetchUserStatistics());
  }, [dispatch]);
  
  // Format data for the visits by day chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours Spent',
        data: statistics.visitsByDay || [0, 0, 0, 0, 0, 0, 0],
        fill: false,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} hours`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  };
  
  // Format time of day distribution
  const formatTimeDistribution = () => {
    if (!statistics.topVisitTimes || statistics.topVisitTimes.length === 0) {
      return 'No data available';
    }
    
    const topTime = statistics.topVisitTimes[0];
    
    if (topTime.hour < 12) {
      return 'Morning (before noon)';
    } else if (topTime.hour < 17) {
      return 'Afternoon (12PM - 5PM)';
    } else {
      return 'Evening (after 5PM)';
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Your Library Usage</CardTitle>
        <CardDescription>
          Statistics about your library visits and usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading.statistics ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center bg-blue-100 w-10 h-10 rounded-full mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold">{statistics.visitsThisMonth}</span>
                <span className="text-sm text-muted-foreground">Visits this month</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center bg-green-100 w-10 h-10 rounded-full mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold">{statistics.totalHours}</span>
                <span className="text-sm text-muted-foreground">Total hours</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center bg-purple-100 w-10 h-10 rounded-full mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-2xl font-bold">{statistics.currentStreak}</span>
                <span className="text-sm text-muted-foreground">Day streak</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center bg-amber-100 w-10 h-10 rounded-full mb-2">
                  <BarChart2 className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-2xl font-bold">{formatTimeDistribution()}</span>
                <span className="text-sm text-muted-foreground">Typical time</span>
              </div>
            </div>
            
            {/* Weekly distribution chart */}
            <div>
              <h3 className="text-sm font-medium mb-2">Weekly Usage Pattern</h3>
              <div className="h-[200px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

##### 12.3.5 Backend Implementation (Express Route Handlers)

```javascript
// preferences.controller.js
const User = require('../models/User');
const EntryExitEvent = require('../models/EntryExitEvent');

// Get user preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const user = await User.findById(userId).select(
      'name email profileImage studentId preferences savedFilters'
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        studentId: user.studentId
      },
      preferences: user.preferences || {
        notifications: true,
        notificationThreshold: 80,
        notificationChannels: {
          push: true,
          email: false,
          sms: false
        },
        favoriteAreas: [],
        favoriteTimes: {
          morning: false,
          afternoon: true,
          evening: false
        },
        dashboardWidgets: {
          currentOccupancy: true,
          personalStats: true,
          recentPosts: true,
          quickAccess: true
        }
      },
      savedFilters: user.savedFilters || []
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const updatedPreferences = req.body;
    
    // Find user and update preferences
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Initialize preferences if not exist
    if (!user.preferences) {
      user.preferences = {};
    }
    
    // Update only the provided fields
    Object.keys(updatedPreferences).forEach(key => {
      user.preferences[key] = updatedPreferences[key];
    });
    
    await user.save();
    
    return res.json({
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Subscribe to notifications
exports.subscribeToNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { threshold, notificationType } = req.body;
    
    // Input validation
    if (!threshold || !notificationType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update notification preferences
    if (!user.preferences) {
      user.preferences = {};
    }
    
    user.preferences.notifications = true;
    user.preferences.notificationThreshold = threshold;
    
    if (!user.preferences.notificationChannels) {
      user.preferences.notificationChannels = {
        push: false,
        email: false,
        sms: false
      };
    }
    
    // Enable the requested notification type
    user.preferences.notificationChannels[notificationType] = true;
    
    await user.save();
    
    return res.json({
      success: true,
      message: `Subscribed to ${notificationType} notifications at ${threshold}% threshold`,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return res.status(500).json({ error: 'Failed to subscribe to notifications' });
  }
};

// Get user statistics
exports.getUserStatistics = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const studentId = req.user.studentId;
    
    // Get current month bounds
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get visit count for current month
    const visitsThisMonth = await EntryExitEvent.countDocuments({
      studentId,
      eventType: 'entry',
      timestamp: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Calculate total hours spent in library
    // This requires paired entry/exit events
    const entryExitPairs = await EntryExitEvent.aggregate([
      {
        $match: {
          studentId
        }
      },
      {
        $sort: { timestamp: 1 }
      },
      {
        $group: {
          _id: {
            // Group by day to find pairs within same day
            day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          events: { $push: { type: '$eventType', time: '$timestamp' } }
        }
      }
    ]);
    
    let totalMinutes = 0;
    let visitCount = 0;
    let lastVisitDate = null;
    let currentStreak = 0;
    
    // Process pairs to calculate duration
    entryExitPairs.forEach(day => {
      const events = day.events;
      let entryTime = null;
      
      for (let i = 0; i < events.length; i++) {
        if (events[i].type === 'entry') {
          entryTime = events[i].time;
        } else if (events[i].type === 'exit' && entryTime) {
          // Calculate duration between entry and exit
          const durationMs = new Date(events[i].time) - new Date(entryTime);
          totalMinutes += durationMs / (1000 * 60); // Convert ms to minutes
          entryTime = null;
          visitCount++;
        }
      }
      
      // Check if this is part of a consecutive day streak
      const dayDate = new Date(day._id.day);
      
      if (!lastVisitDate) {
        currentStreak = 1;
        lastVisitDate = dayDate;
      } else {
        const dayDiff = Math.floor((dayDate - lastVisitDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day
          currentStreak++;
          lastVisitDate = dayDate;
        } else if (dayDiff > 1) {
          // Streak broken
          if (isSameDay(dayDate, new Date())) {
            // If today is a visit, streak is 1
            currentStreak = 1;
          } else {
            // Streak ended before today
            currentStreak = 0;
          }
          lastVisitDate = dayDate;
        }
      }
    });
    
    // Calculate average duration
    const averageDuration = visitCount > 0 ? totalMinutes / visitCount : 0;
    
    // Calculate hours by day of week
    const hoursByDay = await EntryExitEvent.aggregate([
      {
        $match: {
          studentId,
          eventType: 'entry'
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$timestamp' }, // 1-7 for Sunday-Saturday
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Convert to array with days 0-6 (Monday-Sunday)
    const visitsByDay = Array(7).fill(0);
    hoursByDay.forEach(day => {
      // Convert from Sunday(1)-Saturday(7) to Monday(0)-Sunday(6)
      const adjustedDay = day._id === 1 ? 6 : day._id - 2;
      visitsByDay[adjustedDay] = day.count;
    });
    
    // Calculate most common times of visit
    const topVisitTimes = await EntryExitEvent.aggregate([
      {
        $match: {
          studentId,
          eventType: 'entry'
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 3
      },
      {
        $project: {
          hour: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    return res.json({
      visitsThisMonth,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10, // Round to 1 decimal place
      averageDuration: Math.round(averageDuration / 60 * 10) / 10, // In hours
      currentStreak,
      visitsByDay,
      topVisitTimes
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
};

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
```
```

#### 12.4 Library Resources Map

##### 12.4.1 Page Overview
The Library Resources Map provides a visual representation of the library's layout, showing different zones, available resources, and real-time occupancy information for each area. Users can search for specific resources and view details about each zone.

##### 12.4.2 Component Structure
```
ResourceMapPage/
├── MapSection/
│   ├── LibraryMap.tsx (SVG map of library zones)
│   ├── MapLegend.tsx (Key for map symbols and colors)
│   └── ZoneHighlighter.tsx (Highlights selected zone)
├── ResourceSearchSection/
│   ├── ResourceSearchBar.tsx (Search for computers, printers, etc.)
│   ├── ResourceFilterTags.tsx (Quick filters for common resources)
│   └── ResourceResults.tsx (List of resources matching search)
├── ZoneDetailsSection/
│   ├── ZoneInfoCard.tsx (Information about selected zone)
│   ├── ZoneOccupancyIndicator.tsx (Current occupancy of zone)
│   └── ZoneResourcesList.tsx (Available resources in zone)
└── FacilitiesSection/
    ├── SpecialFacilitiesList.tsx (Printers, scanners, etc.)
    └── FacilityAvailability.tsx (Shows if facility is in use)
```

##### 12.4.3 State Management
```typescript
// Redux slice for library resources
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resourcesApi } from '@/services/api';

export const fetchLibraryZones = createAsyncThunk(
  'resources/fetchLibraryZones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourcesApi.getZones();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchZoneDetails = createAsyncThunk(
  'resources/fetchZoneDetails',
  async (zoneId, { rejectWithValue }) => {
    try {
      const response = await resourcesApi.getZoneDetails(zoneId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const searchResources = createAsyncThunk(
  'resources/searchResources',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await resourcesApi.searchResources(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFacilities = createAsyncThunk(
  'resources/fetchFacilities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourcesApi.getFacilities();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState: {
    zones: [],
    selectedZone: null,
    zoneDetails: null,
    facilities: [],
    searchResults: [],
    searchQuery: '',
    resourceFilters: {
      type: 'all',
      availability: true
    },
    loading: {
      zones: false,
      zoneDetails: false,
      search: false,
      facilities: false
    },
    error: null
  },
  reducers: {
    setSelectedZone: (state, action) => {
      state.selectedZone = action.payload;
      // Clear previous zone details
      state.zoneDetails = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setResourceFilter: (state, action) => {
      state.resourceFilters = {
        ...state.resourceFilters,
        ...action.payload
      };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchLibraryZones
      .addCase(fetchLibraryZones.pending, (state) => {
        state.loading.zones = true;
      })
      .addCase(fetchLibraryZones.fulfilled, (state, action) => {
        state.loading.zones = false;
        state.zones = action.payload;
        
        // Select first zone by default if none selected
        if (!state.selectedZone && action.payload.length > 0) {
          state.selectedZone = action.payload[0]._id;
        }
      })
      .addCase(fetchLibraryZones.rejected, (state, action) => {
        state.loading.zones = false;
        state.error = action.payload;
      })
      
      // Handle fetchZoneDetails
      .addCase(fetchZoneDetails.pending, (state) => {
        state.loading.zoneDetails = true;
      })
      .addCase(fetchZoneDetails.fulfilled, (state, action) => {
        state.loading.zoneDetails = false;
        state.zoneDetails = action.payload;
      })
      .addCase(fetchZoneDetails.rejected, (state, action) => {
        state.loading.zoneDetails = false;
        state.error = action.payload;
      })
      
      // Handle searchResources
      .addCase(searchResources.pending, (state) => {
        state.loading.search = true;
      })
      .addCase(searchResources.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload;
      })
      .addCase(searchResources.rejected, (state, action) => {
        state.loading.search = false;
        state.error = action.payload;
      })
      
      // Handle fetchFacilities
      .addCase(fetchFacilities.pending, (state) => {
        state.loading.facilities = true;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading.facilities = false;
        state.facilities = action.payload;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading.facilities = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setSelectedZone, 
  setSearchQuery, 
  setResourceFilter, 
  clearSearchResults 
} = resourcesSlice.actions;

export default resourcesSlice.reducer;
```

##### 12.4.4 Key Components Implementation

###### LibraryMap.tsx
```tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLibraryZones, 
  fetchZoneDetails,
  setSelectedZone 
} from '@/store/slices/resourcesSlice';
import { RootState, AppDispatch } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';

export function LibraryMap() {
  const dispatch = useDispatch<AppDispatch>();
  const { zones, selectedZone, loading } = useSelector(
    (state: RootState) => state.resources
  );
  
  useEffect(() => {
    dispatch(fetchLibraryZones());
  }, [dispatch]);
  
  useEffect(() => {
    if (selectedZone) {
      dispatch(fetchZoneDetails(selectedZone));
    }
  }, [dispatch, selectedZone]);
  
  const handleZoneClick = (zoneId: string) => {
    dispatch(setSelectedZone(zoneId));
  };
  
  if (loading.zones) {
    return <Skeleton className="w-full h-[500px] rounded-md" />;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <svg
        width="100%"
        height="500"
        viewBox="0 0 800 400"
        className="border border-gray-200 rounded-md"
      >
        {/* Library outline */}
        <rect x="0" y="0" width="800" height="400" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="2" />
        
        {/* Render each zone */}
        {zones.map((zone) => {
          // This is simplified - in a real app, each zone would have its own path data
          // Here we're creating rectangular zones for simplicity
          const { _id, name, coordinates, currentOccupancy, capacity } = zone;
          const { x, y, width, height } = coordinates;
          
          // Calculate fill color based on occupancy
          const occupancyPercentage = Math.min(100, (currentOccupancy / capacity) * 100);
          let fillColor;
          
          if (occupancyPercentage < 50) {
            fillColor = '#d1fae5'; // Green tint for low occupancy
          } else if (occupancyPercentage < 80) {
            fillColor = '#fef3c7'; // Yellow tint for medium occupancy
          } else {
            fillColor = '#fee2e2'; // Red tint for high occupancy
          }
          
          // Highlight selected zone
          const isSelected = selectedZone === _id;
          const strokeColor = isSelected ? '#2563eb' : '#64748b';
          const strokeWidth = isSelected ? 3 : 1;
          
          return (
            <g key={_id} onClick={() => handleZoneClick(_id)} style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                rx="4"
                ry="4"
              />
              
              <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight={isSelected ? 'bold' : 'normal'}
                fill="#1e293b"
              >
                {name}
              </text>
              
              <text
                x={x + width / 2}
                y={y + height / 2 + 20}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#64748b"
              >
                {currentOccupancy}/{capacity}
              </text>
            </g>
          );
        })}
        
        {/* Add library landmarks like entrances, staircases, etc. */}
        <circle cx="400" cy="10" r="8" fill="#94a3b8" />
        <text x="400" y="30" textAnchor="middle" fontSize="10" fill="#64748b">
          Main Entrance
        </text>
        
        {/* Add other landmarks as needed */}
      </svg>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-sm border border-gray-200">
        <div className="text-xs font-medium mb-1">Occupancy Level</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-[#d1fae5] mr-1"></div>
          <span className="text-xs">Low (&lt;50%)</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-[#fef3c7] mr-1"></div>
          <span className="text-xs">Medium (50-80%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#fee2e2] mr-1"></div>
          <span className="text-xs">High (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
}
```

###### ResourceSearchBar.tsx
```tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  searchResources, 
  setSearchQuery,
  setResourceFilter
} from '@/store/slices/resourcesSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { RootState, AppDispatch } from '@/store';

export function ResourceSearchBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { searchQuery, resourceFilters, loading } = useSelector(
    (state: RootState) => state.resources
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };
  
  const handleTypeChange = (value: string) => {
    dispatch(setResourceFilter({ type: value }));
  };
  
  const handleAvailabilityChange = (checked: boolean) => {
    dispatch(setResourceFilter({ availability: checked }));
  };
  
  const handleSearch = () => {
    dispatch(searchResources({
      query: searchQuery,
      type: resourceFilters.type,
      availability: resourceFilters.availability
    }));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for computers, study rooms, printers..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={loading.search}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="resource-type">Type</Label>
          <Select value={resourceFilters.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Resource type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="computer">Computers</SelectItem>
              <SelectItem value="study_room">Study Rooms</SelectItem>
              <SelectItem value="printer">Printers</SelectItem>
              <SelectItem value="scanner">Scanners</SelectItem>
              <SelectItem value="outlet">Power Outlets</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-available"
            checked={resourceFilters.availability}
            onCheckedChange={handleAvailabilityChange}
          />
          <Label htmlFor="show-available">
            Show only available
          </Label>
        </div>
      </div>
      
      {/* Quick filter tags */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            dispatch(setResourceFilter({ type: 'computer' }));
            dispatch(searchResources({ 
              query: '', 
              type: 'computer', 
              availability: resourceFilters.availability 
            }));
          }}
        >
          Computers
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            dispatch(setResourceFilter({ type: 'study_room' }));
            dispatch(searchResources({ 
              query: '', 
              type: 'study_room', 
              availability: resourceFilters.availability 
            }));
          }}
        >
          Study Rooms
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            dispatch(setResourceFilter({ type: 'printer' }));
            dispatch(searchResources({ 
              query: '', 
              type: 'printer', 
              availability: resourceFilters.availability 
            }));
          }}
        >
          Printers
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            dispatch(setResourceFilter({ type: 'outlet' }));
            dispatch(searchResources({ 
              query: '', 
              type: 'outlet', 
              availability: resourceFilters.availability 
            }));
          }}
        >
          Power Outlets
        </Button>
      </div>
    </div>
  );
}
```

###### ZoneInfoCard.tsx
```tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Info, Users, Printer, MonitorSmartphone, Wifi, Zap } from 'lucide-react';
import { RootState } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';

export function ZoneInfoCard() {
  const { zoneDetails, loading } = useSelector(
    (state: RootState) => state.resources
  );
  
  if (loading.zoneDetails) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!zoneDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Zone Selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a zone on the map to view its details
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const { name, description, currentOccupancy, capacity, openingHours, resources } = zoneDetails;
  const occupancyPercentage = Math.min(100, Math.round((currentOccupancy / capacity) * 100));
  
  // Determine occupancy status
  let statusText = "Available";
  let statusColor = "bg-green-100 text-green-800";
  
  if (occupancyPercentage >= 90) {
    statusText = "Full";
    statusColor = "bg-red-100 text-red-800";
  } else if (occupancyPercentage >= 70) {
    statusText = "Busy";
    statusColor = "bg-yellow-100 text-yellow-800";
  }
  
  // Map resource icons
  const resourceIcons = {
    computer: <MonitorSmartphone className="h-4 w-4" />,
    printer: <Printer className="h-4 w-4" />,
    wifi: <Wifi className="h-4 w-4" />,
    power_outlet: <Zap className="h-4 w-4" />
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{name}</CardTitle>
          <Badge className={statusColor}>
            {statusText}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone description */}
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        
        {/* Opening hours */}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">
            {openingHours}
          </span>
        </div>
        
        {/* Occupancy indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Current Occupancy</span>
            </div>
            <span className="text-sm font-medium">
              {currentOccupancy}/{capacity} ({occupancyPercentage}%)
            </span>
          </div>
          <Progress value={occupancyPercentage} />
        </div>
        
        {/* Available resources */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Available Resources</h3>
          <div className="grid grid-cols-2 gap-2">
            {resources.map((resource) => (
              <div 
                key={resource.id} 
                className="flex items-center p-2 bg-slate-50 rounded-md"
              >
                <span className="mr-2 text-slate-500">
                  {resourceIcons[resource.type] || <div className="w-4 h-4" />}
                </span>
                <div>
                  <p className="text-sm font-medium">{resource.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.available}/{resource.total} available
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

##### 12.4.5 Backend Implementation (Express Route Handlers)

```javascript
// resources.controller.js
const LibraryZone = require('../models/LibraryZone');
const Resource = require('../models/Resource');
const Facility = require('../models/Facility');

// Get all library zones
exports.getZones = async (req, res) => {
  try {
    const zones = await LibraryZone.find()
      .select('name capacity coordinates currentOccupancy');
    
    return res.json(zones);
  } catch (error) {
    console.error('Error fetching library zones:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get specific zone details
exports.getZoneDetails = async (req, res) => {
  try {
    const { zoneId } = req.params;
    
    const zone = await LibraryZone.findById(zoneId);
    
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    // Get resources in this zone
    const resources = await Resource.aggregate([
      {
        $match: { zoneId: zone._id }
      },
      {
        $group: {
          _id: '$type',
          name: { $first: '$typeName' },
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: [{ $eq: ['$status', 'available'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          type: '$_id',
          name: 1,
          total: 1,
          available: 1
        }
      }
    ]);
    
    return res.json({
      _id: zone._id,
      name: zone.name,
      description: zone.description,
      capacity: zone.capacity,
      currentOccupancy: zone.currentOccupancy,
      openingHours: zone.openingHours,
      resources
    });
  } catch (error) {
    console.error('Error fetching zone details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Search for resources
exports.searchResources = async (req, res) => {
  try {
    const { query, type, availability } = req.query;
    
    // Build search filter
    const filter = {};
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (availability === 'true') {
      filter.status = 'available';
    }
    
    // Perform search
    const resources = await Resource.find(filter)
      .populate('zoneId', 'name')
      .sort({ name: 1 });
    
    // Format results
    const formattedResults = resources.map(resource => ({
      id: resource._id,
      name: resource.name,
      type: resource.type,
      typeName: resource.typeName,
      status: resource.status,
      zone: {
        id: resource.zoneId._id,
        name: resource.zoneId.name
      },
      location: resource.location
    }));
    
    return res.json(formattedResults);
  } catch (error) {
    console.error('Error searching resources:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all special facilities
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find()
      .populate('zoneId', 'name')
      .sort({ name: 1 });
    
    // Format facilities response
    const formattedFacilities = facilities.map(facility => ({
      id: facility._id,
      name: facility.name,
      type: facility.type,
      description: facility.description,
      inUse: facility.inUse,
      maintenanceStatus: facility.maintenanceStatus,
      zone: {
        id: facility.zoneId._id,
        name: facility.zoneId.name
      }
    }));
    
    return res.json(formattedFacilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

##### 12.4.6 Data Models

```javascript
// LibraryZone.js
const mongoose = require('mongoose');

const LibraryZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  coordinates: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  openingHours: {
    type: String,
    default: '8:00 AM - 10:00 PM'
  },
  resources: [String], // Types of resources available in this zone
  features: [String], // Special features of this zone (quiet, group study, etc.)
  floor: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('LibraryZone', LibraryZoneSchema);

// Resource.js
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['computer', 'study_room', 'printer', 'scanner', 'outlet', 'desk']
  },
  typeName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance'],
    default: 'available'
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryZone',
    required: true
  },
  location: {
    x: Number,
    y: Number
  },
  description: String,
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', ResourceSchema);

// Facility.js
const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['printer', 'scanner', 'copier', 'vending_machine', 'water_dispenser', 'microfilm_reader']
  },
  description: String,
  inUse: {
    type: Boolean,
    default: false
  },
  maintenanceStatus: {
    type: String,
    enum: ['operational', 'minor_issues', 'out_of_order'],
    default: 'operational'
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryZone',
    required: true
  }
});

module.exports = mongoose.model('Facility', FacilitySchema);