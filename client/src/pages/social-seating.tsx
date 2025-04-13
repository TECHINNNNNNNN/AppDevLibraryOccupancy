import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Plus, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import PageHeader from '@/components/layout/page-header';
import SeatPost from '@/components/social/seat-post';
import SeatFilter from '@/components/social/seat-filter';
import PostList from '@/components/social/post-list';
import CreatePost from '@/components/social/create-post';
import { useSocket, sendSocketMessage } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { LibraryZone } from '@/assets/library-map';

interface SeatPostType {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  location: {
    zone: string;
    seatId?: string;
  };
  imageUrl?: string;
  duration: number;
  endTime: Date;
  groupSize: number;
  message?: string;
  isAnonymous: boolean;
  verifications: {
    positive: number;
    negative: number;
  };
  createdAt: Date;
}

const mockUsers = [
  { id: 1, name: 'Tanawat K.', avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 2, name: 'Sirinda P.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: 3, name: 'Pattarapol S.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
];

const SocialSeating: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [posts, setPosts] = useState<SeatPostType[]>([]);
  const [zones, setZones] = useState<LibraryZone[]>([
    { id: 1, name: 'Zone A - Reading Area', current: 32, capacity: 100, percentage: 32 },
    { id: 2, name: 'Zone B - Computer Lab', current: 47, capacity: 50, percentage: 94 },
    { id: 3, name: 'Zone C - Group Study', current: 54, capacity: 80, percentage: 68 },
    { id: 4, name: 'Zone D - Quiet Zone', current: 22, capacity: 40, percentage: 55 }
  ]);
  
  const { toast } = useToast();
  
  // Socket connection
  const { subscribe } = useSocket(() => {
    sendSocketMessage('getSeatPosts');
  });
  
  useEffect(() => {
    // Subscribe to socket updates
    const unsubscribe = subscribe((message) => {
      if (message.type === 'newSeatPost') {
        setPosts(prev => [message.data, ...prev]);
      } else if (message.type === 'seatPostUpdate') {
        setPosts(prev => prev.map(post => 
          post.id === message.data.id ? message.data : post
        ));
      } else if (message.type === 'initialData' && message.data.seatPosts) {
        // Map to our SeatPostType format and add mock user data
        const formattedPosts = message.data.seatPosts.map((post: any) => ({
          ...post,
          userName: mockUsers[Math.floor(Math.random() * mockUsers.length)].name,
          userAvatar: mockUsers[Math.floor(Math.random() * mockUsers.length)].avatar,
          endTime: new Date(post.endTime),
          createdAt: new Date(post.createdAt)
        }));
        setPosts(formattedPosts);
      }
    });
    
    // Load initial sample data
    loadSampleData();
    
    return () => unsubscribe();
  }, [subscribe]);
  
  // Load sample data
  const loadSampleData = () => {
    const now = new Date();
    const samplePosts: SeatPostType[] = [
      {
        id: 1,
        userId: 1,
        userName: 'Tanawat K.',
        userAvatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        location: {
          zone: 'Zone C',
          seatId: 'Table 15'
        },
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        duration: 120,
        endTime: new Date(now.getTime() + 90 * 60000),
        groupSize: 1,
        message: 'Found a great quiet spot near the windows. Will be here for about 2 hours.',
        isAnonymous: false,
        verifications: {
          positive: 3,
          negative: 0
        },
        createdAt: new Date(now.getTime() - 10 * 60000)
      },
      {
        id: 2,
        userId: 2,
        userName: 'Sirinda P.',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        location: {
          zone: 'Zone B',
          seatId: 'Computer 8'
        },
        duration: 60,
        endTime: new Date(now.getTime() + 30 * 60000),
        groupSize: 1,
        message: 'Computer stations in Zone B are filling up fast! Only 3 left.',
        isAnonymous: false,
        verifications: {
          positive: 2,
          negative: 1
        },
        createdAt: new Date(now.getTime() - 25 * 60000)
      },
      {
        id: 3,
        userId: 3,
        userName: 'Pattarapol S.',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        location: {
          zone: 'Zone A',
          seatId: 'Table 7'
        },
        imageUrl: 'https://images.unsplash.com/photo-1529007196863-d07650a3f0ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        duration: 180,
        endTime: new Date(now.getTime() + 150 * 60000),
        groupSize: 3,
        message: 'Got a big table for group study. We\'ll be here all afternoon.',
        isAnonymous: false,
        verifications: {
          positive: 5,
          negative: 0
        },
        createdAt: new Date(now.getTime() - 45 * 60000)
      },
      {
        id: 4,
        userId: 4,
        userName: 'Anonymous',
        location: {
          zone: 'Zone D',
          seatId: 'Quiet Zone 5'
        },
        duration: 90,
        endTime: new Date(now.getTime() + 60 * 60000),
        groupSize: 1,
        message: 'Quiet zone is very peaceful today. Found a great spot by the bookshelf.',
        isAnonymous: true,
        verifications: {
          positive: 1,
          negative: 0
        },
        createdAt: new Date(now.getTime() - 55 * 60000)
      }
    ];
    
    setPosts(samplePosts);
  };
  
  // Filter posts based on tab, search term, and filters
  const filteredPosts = posts.filter(post => {
    // Filter by tab
    if (activeTab !== 'all' && !post.location.zone.toLowerCase().includes(activeTab)) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !post.message?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !post.location.zone.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !post.location.seatId?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by selected filters
    if (selectedFilters.length > 0) {
      const postFilters = [];
      if (post.groupSize > 1) postFilters.push('group');
      if (post.location.zone.includes('Computer')) postFilters.push('computer');
      if (post.location.zone.includes('Quiet')) postFilters.push('quiet');
      
      if (!selectedFilters.some(filter => postFilters.includes(filter))) {
        return false;
      }
    }
    
    return true;
  });
  
  const handleCreatePost = (values: any) => {
    const now = new Date();
    const endTime = new Date(now.getTime() + values.duration * 60000);
    
    const newPost: SeatPostType = {
      id: posts.length + 1,
      userId: 1, // Current user
      userName: 'Somchai P.', // Current user
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      location: {
        zone: values.zone,
        seatId: values.seatId
      },
      imageUrl: values.imageUrl,
      duration: values.duration,
      endTime,
      groupSize: values.groupSize,
      message: values.message,
      isAnonymous: values.isAnonymous,
      verifications: {
        positive: 0,
        negative: 0
      },
      createdAt: now
    };
    
    setPosts([newPost, ...posts]);
    
    toast({
      title: 'Seat shared successfully',
      description: 'Your seat information has been shared with other students',
    });
  };
  
  const handleVerifyPost = (postId: number, isPositive: boolean) => {
    setPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          const verifications = { ...post.verifications };
          if (isPositive) {
            verifications.positive++;
          } else {
            verifications.negative++;
          }
          return { ...post, verifications };
        }
        return post;
      })
    );
    
    toast({
      title: isPositive ? 'Seat verified' : 'Seat disputed',
      description: isPositive 
        ? 'Thank you for confirming this seat information' 
        : 'Thank you for your feedback. This helps keep information accurate',
    });
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Social Seating" 
        subtitle="Find available seats and share your spot with other students"
        actions={
          <Button 
            onClick={() => setOpenCreatePost(true)}
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Share a Seat
          </Button>
        }
      />
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search seats..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <SeatFilter 
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
          
          <Alert>
            <AlertTitle>Be a good community member</AlertTitle>
            <AlertDescription>
              Please share accurate information and verify other posts to help your fellow students find seats.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="w-full md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid grid-cols-5">
              <TabsTrigger value="all">All Zones</TabsTrigger>
              <TabsTrigger value="a">Zone A</TabsTrigger>
              <TabsTrigger value="b">Zone B</TabsTrigger>
              <TabsTrigger value="c">Zone C</TabsTrigger>
              <TabsTrigger value="d">Zone D</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <PostList
            posts={filteredPosts}
            onVerify={handleVerifyPost}
            emptyMessage="No seats found. Be the first to share a seat!"
          />
        </div>
      </div>
      
      <CreatePost
        open={openCreatePost}
        onOpenChange={setOpenCreatePost}
        onSubmit={handleCreatePost}
        zones={zones}
      />
    </div>
  );
};

export default SocialSeating;
